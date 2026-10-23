// // dental-clinic\app\api\appointments\[id]\route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { connectDB }         from '@/lib/mongodb';
// import Appointment           from '@/models/Appointment';
// import Patient               from '@/models/Patient';
// import { notifyAppointment } from '@/lib/notifications';
// import { format }            from 'date-fns';

// export async function GET(
//   _: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   await connectDB();
//   const appointment = await Appointment.findById(params.id)
//     .populate('patientId', 'name email phone')
//     .populate('doctorId',  'name specialization');
//   if (!appointment)
//     return NextResponse.json({ error: 'Not found' }, { status: 404 });
//   return NextResponse.json({ appointment });
// }

// export async function PUT(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     await connectDB();
//     const body = await req.json();

//     // Fetch old record to compare status
//     const old = await Appointment.findById(params.id);
//     if (!old)
//       return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });

//     const appointment = await Appointment.findByIdAndUpdate(
//       params.id,
//       body,
//       { new: true }
//     );

//     // ── Fire notification if status changed ────────────────
//     if (body.status && old.status !== body.status) {
//       const notifyType =
//         body.status === 'confirmed'  ? 'confirmed'  :
//         body.status === 'cancelled'  ? 'cancelled'  :
//         body.status === 'completed'  ? null          : null;

//       if (notifyType) {
//         // Get patient contact info from Patient record if available
//         let patientEmail = appointment!.email || '';
//         let patientPhone = appointment!.phone || '';

//         if (appointment!.patientId) {
//           const patient = await Patient.findById(appointment!.patientId)
//             .select('email phone userId');
//           if (patient) {
//             patientEmail = patientEmail || patient.email || '';
//             patientPhone = patientPhone || patient.phone || '';
//           }
//         }

//         const dateStr = format(new Date(appointment!.date), 'EEE, dd MMM yyyy');

//         notifyAppointment(notifyType, {
//           appointmentId: appointment!._id.toString(),
//           patientName:   appointment!.patientName,
//           patientEmail,
//           patientPhone,
//           doctorName:    appointment!.doctorName,
//           service:       appointment!.service,
//           date:          dateStr,
//           timeSlot:      appointment!.timeSlot,
//         }).catch(e =>
//           console.error('Notification error (non-fatal):', e.message)
//         );
//       }
//     }

//     return NextResponse.json({ appointment });
//   } catch (err: any) {
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }

// export async function DELETE(
//   _: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   await connectDB();
//   await Appointment.findByIdAndDelete(params.id);
//   return NextResponse.json({ message: 'Deleted' });
// }

// app/api/appointments/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB }         from '@/lib/mongodb';
import Appointment           from '@/models/Appointment';
import Patient               from '@/models/Patient';
import { notifyAppointment } from '@/lib/notifications';
import { format }            from 'date-fns';
import { getServerSession }  from 'next-auth';
import { authOptions }       from '@/lib/auth';
import {
  doctorNameVariants,
  getSessionDoctor,
  normalizeDoctorName,
} from '@/lib/doctorAccess';

function doctorOwnsAppointment(doctor: any, appointment: any) {
  if (!doctor || !appointment) return false;

  const appointmentDoctorId =
    appointment.doctorId?._id?.toString?.() || appointment.doctorId?.toString?.();
  if (appointmentDoctorId && appointmentDoctorId === doctor._id.toString()) {
    return true;
  }

  const appointmentName = normalizeDoctorName(appointment.doctorName).toLowerCase();
  return doctorNameVariants(doctor.name)
    .map(name => normalizeDoctorName(name).toLowerCase())
    .includes(appointmentName);
}

function patientOwnsAppointment(user: any, appointment: any) {
  if (!user || !appointment) return false;
  return Boolean(
    (user.email && appointment.email === user.email) ||
    (appointment.patientUserId?.toString?.() === user.id)
  );
}

async function canAccessAppointment(session: any, appointment: any) {
  const user = session?.user as any;
  if (!user) return false;
  if (user.role === 'admin' || user.role === 'staff') return true;
  if (user.role === 'doctor') {
    const doctor = await getSessionDoctor(session);
    return doctorOwnsAppointment(doctor, appointment);
  }
  if (user.role === 'patient') return patientOwnsAppointment(user, appointment);
  return false;
}

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const appointment = await Appointment.findById(params.id)
    .populate('patientId', 'name email phone')
    .populate('doctorId',  'name specialization');
  if (!appointment)
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (!(await canAccessAppointment(session, appointment)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  return NextResponse.json({ appointment });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();

    const old = await Appointment.findById(params.id);
    if (!old)
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    if (!(await canAccessAppointment(session, old)))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    if ((session.user as any).role === 'doctor') {
      const allowedDoctorFields = ['status', 'notes'];
      Object.keys(body).forEach(key => {
        if (!allowedDoctorFields.includes(key)) delete body[key];
      });
    }

    // If date is being updated, normalize it to UTC midnight
    if (body.date) {
      const iso = typeof body.date === 'string'
        ? body.date.split('T')[0]
        : new Date(body.date).toISOString().split('T')[0];
      const [year, month, day] = iso.split('-').map(Number);
      body.date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    }

    const appointment = await Appointment.findByIdAndUpdate(
      params.id,
      body,
      { new: true }
    );

    // ── Fire notification if status changed ────────────────
    if (body.status && old.status !== body.status) {
      const notifyType =
        body.status === 'confirmed' ? 'confirmed' :
        body.status === 'cancelled' ? 'cancelled' : null;

      if (notifyType) {
        let patientEmail = (appointment!.email || '').trim();
        let patientPhone = (appointment!.phone || '').trim();
        let patientUserId = appointment!.patientUserId?.toString?.();

        if (appointment!.patientId) {
          const patient = await Patient.findById(appointment!.patientId)
            .select('email phone userId');
          if (patient) {
            patientEmail = patientEmail || (patient.email || '').trim();
            patientPhone = patientPhone || (patient.phone || '').trim();
            patientUserId = patientUserId || patient.userId?.toString?.();
          }
        }

        const dateStr = format(new Date(appointment!.date), 'EEE, dd MMM yyyy');

        console.log('[Appointment Confirm] notifyType=', notifyType, 'patientPhone=', patientPhone, 'patientEmail=', patientEmail);

        if (!patientPhone) {
          console.warn('[Appointment Confirm] No patient phone available, SMS and WhatsApp will not be sent.');
        }

        try {
          const notificationResults = await notifyAppointment(notifyType, {
            appointmentId:  appointment!._id.toString(),
            patientName:    appointment!.patientName,
            patientEmail,
            patientPhone,
            patientUserId,
            doctorName:     appointment!.doctorName,
            service:        appointment!.service,
            date:           dateStr,
            timeSlot:       appointment!.timeSlot,
          });
          console.log('[Appointment Confirm] notificationResults=', JSON.stringify(notificationResults));
        } catch (e: any) {
          console.error('Notification error (non-fatal):', e.message);
        }
      }
    }

    return NextResponse.json({ appointment });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const appointment = await Appointment.findById(params.id);
  if (!appointment)
    return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
  if (!(await canAccessAppointment(session, appointment)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await Appointment.findByIdAndDelete(params.id);
  return NextResponse.json({ message: 'Deleted' });
}
