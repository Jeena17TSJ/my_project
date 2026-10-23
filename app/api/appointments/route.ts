// // app/api/appointments/route.ts
// // Doctor can ONLY see appointments assigned to them

// import { NextRequest, NextResponse } from 'next/server';
// import { connectDB }         from '@/lib/mongodb';
// import Appointment           from '@/models/Appointment';
// import Doctor                from '@/models/Doctor';
// import { getServerSession }  from 'next-auth';
// import { authOptions }       from '@/lib/auth';
// import { notifyAppointment } from '@/lib/notifications';
// import { format }            from 'date-fns';

// export async function GET(req: NextRequest) {
//   try {
//     await connectDB();
//     const session = await getServerSession(authOptions);
//     if (!session?.user)
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

//     const { searchParams } = new URL(req.url);
//     const status   = searchParams.get('status');
//     const date     = searchParams.get('date');
//     const role     = (session.user as any).role;
//     const userId   = (session.user as any).id;

//     const query: any = {};
//     if (status) query.status = status;
//     if (date) {
//       const d = new Date(date);
//       const start = new Date(d); start.setHours(0,  0,  0,   0);
//       const end   = new Date(d); end.setHours(23, 59, 59, 999);
//       query.date  = { $gte: start, $lte: end };
//     }

//     // ── DOCTOR: only see their own appointments ────────────
//     if (role === 'doctor') {
//       const doctor = await Doctor.findOne({ userId }).lean() as any;
//       if (!doctor)
//         return NextResponse.json({ appointments: [] });
//       query.doctorName = doctor.name;
//     }

//     // ── PATIENT: only see their own appointments ───────────
//     if (role === 'patient') {
//       query.$or = [
//         { email: (session.user as any).email },
//         { patientUserId: userId },
//       ];
//     }

//     // ── ADMIN/STAFF: see everything ────────────────────────

//     const appointments = await Appointment.find(query)
//       .populate('patientId', 'name email phone')
//       .populate('doctorId',  'name specialization')
//       .sort({ date: -1 });

//     return NextResponse.json({ appointments });
//   } catch (err: any) {
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }

// export async function POST(req: NextRequest) {
//   try {
//     await connectDB();
//     const body = await req.json();

//     if (!body.patientName?.trim())
//       return NextResponse.json({ error: 'Patient name is required.' }, { status: 400 });
//     if (!body.service?.trim())
//       return NextResponse.json({ error: 'Service is required.' }, { status: 400 });
//     if (!body.date)
//       return NextResponse.json({ error: 'Date is required.' }, { status: 400 });
//     if (!body.timeSlot?.trim())
//       return NextResponse.json({ error: 'Time slot is required.' }, { status: 400 });
//     if (!body.doctorName?.trim())
//       return NextResponse.json({ error: 'Please select a doctor.' }, { status: 400 });
//     if (!body.phone?.trim())
//       return NextResponse.json({ error: 'Phone number is required.' }, { status: 400 });
//     if (!/^[6-9]\d{9}$/.test(body.phone.trim()))
//       return NextResponse.json({ error: 'Enter valid 10-digit mobile number.' }, { status: 400 });

//     const appointmentDateRaw = new Date(body.date);
//     const appointmentDate = new Date(appointmentDateRaw);
//     appointmentDate.setHours(0, 0, 0, 0);
//     const dayStart = new Date(appointmentDate);
//     const dayEnd   = new Date(appointmentDate);
//     dayEnd.setHours(23, 59, 59, 999);
//     const appointmentDayName = format(appointmentDateRaw, 'EEEE');

//     const doctor = await Doctor.findOne({
//       name: body.doctorName,
//       isActive: { $ne: false },
//     }).lean() as any;

//     if (!doctor) {
//       return NextResponse.json(
//         { error: 'Selected doctor is not available. Please choose another doctor.' },
//         { status: 400 }
//       );
//     }

//     const availableDays = doctor.availableDays;

//     if (availableDays?.length && !availableDays.includes(appointmentDayName)) {
//       return NextResponse.json(
//         { error: `${doctor.name} does not work on ${appointmentDayName}s. Please choose another date.` },
//         { status: 409 }
//       );
//     }

//     const slotConfig = doctor.availableSlots?.find((s: any) => s.day === appointmentDayName);
//     if (slotConfig?.slots?.length && !slotConfig.slots.includes(body.timeSlot)) {
//       return NextResponse.json(
//         { error: `${body.timeSlot} is not available for ${doctor.name} on ${appointmentDayName}.` },
//         { status: 409 }
//       );
//     }

//     // Double-booking check
//     const conflict = await Appointment.findOne({
//       doctorName: body.doctorName,
//       timeSlot:   body.timeSlot,
//       date:       { $gte: dayStart, $lte: dayEnd },
//       status:     { $in: ['pending', 'confirmed'] },
//     });

//     if (conflict) {
//       return NextResponse.json(
//         { error: `Dr. ${body.doctorName} is already booked at ${body.timeSlot} on this date. Please choose a different slot.`, conflictSlot: body.timeSlot },
//         { status: 409 }
//       );
//     }

//     // Same patient same doctor same slot
//     if (body.phone || body.email) {
//       const patientConflict = await Appointment.findOne({
//         $or: [
//           ...(body.phone ? [{ phone: body.phone }] : []),
//           ...(body.email ? [{ email: body.email }] : []),
//         ],
//         doctorName: body.doctorName,
//         timeSlot:   body.timeSlot,
//         date:       { $gte: dayStart, $lte: dayEnd },
//         status:     { $in: ['pending', 'confirmed'] },
//       });
//       if (patientConflict) {
//         return NextResponse.json(
//           { error: `You already have an appointment with ${body.doctorName} at ${body.timeSlot} on this date.` },
//           { status: 409 }
//         );
//       }
//     }

//     const appointment = await Appointment.create({
//       patientName: body.patientName,
//       doctorName:  body.doctorName,
//       service:     body.service,
//       date:        appointmentDate,
//       timeSlot:    body.timeSlot,
//       status:      'pending',
//       bookedVia:   body.bookedVia || 'website',
//       fee:         body.fee       || 0,
//       email:       body.email     || '',
//       phone:       body.phone     || '',
//       notes:       body.notes     || '',
//     });

//     const dateStr = format(appointmentDate, 'EEE, dd MMM yyyy');
//     notifyAppointment('booked', {
//       appointmentId: appointment._id.toString(),
//       patientName:   body.patientName,
//       patientEmail:  body.email,
//       patientPhone:  body.phone,
//       doctorName:    body.doctorName,
//       service:       body.service,
//       date:          dateStr,
//       timeSlot:      body.timeSlot,
//     }).catch(e => console.error('Notify error:', e.message));

//     return NextResponse.json(
//       { appointment, message: 'Appointment booked!' },
//       { status: 201 }
//     );
//   } catch (err: any) {
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }

// app/api/appointments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB }         from '@/lib/mongodb';
import Appointment           from '@/models/Appointment';
import Doctor                from '@/models/Doctor';
import { getServerSession }  from 'next-auth';
import { authOptions }       from '@/lib/auth';
import { notifyAppointment } from '@/lib/notifications';
import { format }            from 'date-fns';
import {
  doctorAppointmentQuery,
  doctorNameVariants,
  getSessionDoctor,
} from '@/lib/doctorAccess';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ── Shared UTC date helper ─────────────────────────────────────────────────────
// Always parse "YYYY-MM-DD" or a Date as UTC midnight to avoid IST/timezone drift
function utcDayRange(dateInput: string | Date): { dayStart: Date; dayEnd: Date } {
  const iso =
    typeof dateInput === 'string'
      ? dateInput.split('T')[0]               // already "YYYY-MM-DD"
      : dateInput.toISOString().split('T')[0]; // extract date part from Date object

  const [year, month, day] = iso.split('-').map(Number);
  return {
    dayStart: new Date(Date.UTC(year, month - 1, day,  0,  0,  0,   0)),
    dayEnd:   new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999)),
  };
}

function exactEmail(email: string) {
  return new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status   = searchParams.get('status');
    const date     = searchParams.get('date');
    const doctorId = searchParams.get('doctorId');
    const role     = (session.user as any).role;
    const userId   = (session.user as any).id;

    const query: any = {};
    if (status) query.status = status;
    if (date) {
      const { dayStart, dayEnd } = utcDayRange(date);
      query.date = { $gte: dayStart, $lte: dayEnd };
    }

    // ── DOCTOR: only see their own appointments ────────────
    if (role === 'doctor') {
      const doctor = await getSessionDoctor(session);
      if (!doctor)
        return NextResponse.json({ appointments: [] });
      Object.assign(query, doctorAppointmentQuery(doctor));
    }

    if ((role === 'admin' || role === 'staff') && doctorId) {
      const doctor = await Doctor.findById(doctorId).lean() as any;
      if (!doctor)
        return NextResponse.json({ appointments: [] });
      Object.assign(query, doctorAppointmentQuery(doctor));
    }

    // ── PATIENT: only see their own appointments ───────────
    if (role === 'patient') {
      query.$or = [
        ...((session.user as any).email ? [{ email: exactEmail((session.user as any).email) }] : []),
        { patientUserId: userId },
      ];
    }

    // ── ADMIN/STAFF: see everything ────────────────────────

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email phone')
      .populate('doctorId',  'name specialization')
      .sort({ date: -1 });

    return NextResponse.json({ appointments });
  } catch (err: any) {
    if (err?.code === 11000) {
      return NextResponse.json(
        { error: 'This time slot was just booked. Please choose a different slot.' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const sessionRole = (session?.user as any)?.role;
    const sessionUserId = (session?.user as any)?.id;
    const sessionEmail = (session?.user as any)?.email;
    const body = await req.json();

    if (!body.patientName?.trim())
      return NextResponse.json({ error: 'Patient name is required.' }, { status: 400 });
    if (!body.service?.trim())
      return NextResponse.json({ error: 'Service is required.' }, { status: 400 });
    if (!body.date)
      return NextResponse.json({ error: 'Date is required.' }, { status: 400 });
    if (!body.timeSlot?.trim())
      return NextResponse.json({ error: 'Time slot is required.' }, { status: 400 });
    if (!body.doctorName?.trim())
      return NextResponse.json({ error: 'Please select a doctor.' }, { status: 400 });
    if (!body.phone?.trim())
      return NextResponse.json({ error: 'Phone number is required.' }, { status: 400 });
    if (!/^[6-9]\d{9}$/.test(body.phone.trim()))
      return NextResponse.json({ error: 'Enter valid 10-digit mobile number.' }, { status: 400 });

    const patientEmail = (sessionRole === 'patient' && sessionEmail
      ? sessionEmail
      : body.email
    )?.trim().toLowerCase() || '';
    const patientPhone = body.phone?.trim() || '';

    // ── Build UTC-safe day boundaries ──────────────────────────────────────────
    // Use the date string directly (not a Date object) to avoid IST timezone drift.
    // new Date("2026-06-03") is UTC midnight but .setHours(0,0,0,0) shifts it to
    // local midnight — storing the wrong UTC timestamp in MongoDB.
    const dateStr = typeof body.date === 'string' && !body.date.includes('T')
      ? body.date
      : format(new Date(body.date), 'yyyy-MM-dd');

    const { dayStart, dayEnd } = utcDayRange(dateStr);

    // appointmentDate stored as UTC midnight — consistent with availability queries
    const appointmentDate    = dayStart;
    const appointmentDayName = format(appointmentDate, 'EEEE');

    const doctor = await Doctor.findOne({
      ...(body.doctorId
        ? { _id: body.doctorId }
        : { name: { $in: doctorNameVariants(body.doctorName) } }),
      isActive: { $ne: false },
    }).lean() as any;

    if (!doctor) {
      return NextResponse.json(
        { error: 'Selected doctor is not available. Please choose another doctor.' },
        { status: 400 }
      );
    }

    const availableDays = doctor.availableDays;
    if (availableDays?.length && !availableDays.includes(appointmentDayName)) {
      return NextResponse.json(
        { error: `${doctor.name} does not work on ${appointmentDayName}s. Please choose another date.` },
        { status: 409 }
      );
    }

    const slotConfig = doctor.availableSlots?.find((s: any) => s.day === appointmentDayName);
    if (slotConfig?.slots?.length && !slotConfig.slots.includes(body.timeSlot)) {
      return NextResponse.json(
        { error: `${body.timeSlot} is not available for ${doctor.name} on ${appointmentDayName}.` },
        { status: 409 }
      );
    }

    // ── Double-booking check ───────────────────────────────────────────────────
    const conflict = await Appointment.findOne({
      ...doctorAppointmentQuery(doctor),
      timeSlot:   body.timeSlot,
      date:       { $gte: dayStart, $lte: dayEnd },
      status:     { $in: ['pending', 'confirmed', 'completed'] },
    });

    if (conflict) {
      return NextResponse.json(
        {
          error: `Dr. ${body.doctorName} is already booked at ${body.timeSlot} on this date. Please choose a different slot.`,
          conflictSlot: body.timeSlot,
        },
        { status: 409 }
      );
    }

    // ── Same patient same doctor same slot ─────────────────────────────────────
    if (body.phone || body.email) {
      const patientConflict = await Appointment.findOne({
        $and: [
          doctorAppointmentQuery(doctor),
          {
            $or: [
              ...(patientPhone ? [{ phone: patientPhone }] : []),
              ...(patientEmail ? [{ email: patientEmail }] : []),
            ],
          },
        ],
        timeSlot:   body.timeSlot,
        date:       { $gte: dayStart, $lte: dayEnd },
        status:     { $in: ['pending', 'confirmed', 'completed'] },
      });
      if (patientConflict) {
        return NextResponse.json(
          { error: `You already have an appointment with ${body.doctorName} at ${body.timeSlot} on this date.` },
          { status: 409 }
        );
      }
    }

    const appointment = await Appointment.create({
      patientName: body.patientName,
      doctorId:    doctor._id,
      doctorName:  doctor.name,
      service:     body.service,
      date:        appointmentDate,   // UTC midnight — timezone-safe
      timeSlot:    body.timeSlot,
      status:      'pending',
      bookedVia:   body.bookedVia || 'website',
      fee:         body.fee       || 0,
      email:       patientEmail,
      phone:       patientPhone,
      notes:       body.notes     || '',
      patientUserId: sessionRole === 'patient' ? sessionUserId : undefined,
    });

    const displayDate = format(appointmentDate, 'EEE, dd MMM yyyy');
    notifyAppointment('booked', {
      appointmentId: appointment._id.toString(),
      patientName:   body.patientName,
      patientEmail,
      patientPhone,
      patientUserId: sessionRole === 'patient' ? sessionUserId : undefined,
      doctorName:    doctor.name,
      service:       body.service,
      date:          displayDate,
      timeSlot:      body.timeSlot,
    }).catch(e => console.error('Notify error:', e.message));

    return NextResponse.json(
      { appointment, message: 'Appointment booked!' },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
