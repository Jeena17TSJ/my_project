// app/api/records/route.ts
// Enforces doctor-patient confidentiality:
// - Doctor sees ONLY records they created
// - Patient sees ONLY their own records
// - Admin sees everything
import { NextRequest, NextResponse } from 'next/server';
import { connectDB }        from '@/lib/mongodb';
import MedicalRecord        from '@/models/MedicalRecord';
import Patient              from '@/models/Patient';
import Appointment          from '@/models/Appointment';
import { getServerSession } from 'next-auth';
import { authOptions }      from '@/lib/auth';
import { doctorAppointmentQuery, getSessionDoctor } from '@/lib/doctorAccess';

function exactEmail(email: string) {
  return new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
}

async function getSessionPatientIds(session: any) {
  const user = session?.user as any;
  if (!user) return [];

  const patientIds = new Set<string>();

  const patientConditions = [
    { userId: user.id },
    ...(user.email ? [{ email: exactEmail(user.email) }] : []),
  ];

  const patients = await Patient.find({ $or: patientConditions }).select('_id').lean() as any[];
  patients.forEach(patient => patientIds.add(patient._id.toString()));

  if (user.email) {
    const appointments = await Appointment.find({
      email: exactEmail(user.email),
      patientId: { $exists: true, $ne: null },
    }).select('patientId').lean() as any[];

    appointments.forEach(appointment => {
      if (appointment.patientId) patientIds.add(appointment.patientId.toString());
    });
  }

  return [...patientIds];
}

async function getOrCreateAppointmentPatient(appointment: any) {
  if (appointment.patientId) return appointment.patientId;

  const orConditions = [
    ...(appointment.email ? [{ email: appointment.email }] : []),
    ...(appointment.phone ? [{ phone: appointment.phone }] : []),
  ];

  let patient = orConditions.length > 0
    ? await Patient.findOne({ $or: orConditions })
    : null;

  if (!patient) {
    patient = await Patient.create({
      name: appointment.patientName || 'Unknown patient',
      email: appointment.email || '',
      phone: appointment.phone || '',
    });
  }

  await Appointment.findByIdAndUpdate(appointment._id, { patientId: patient._id });
  return patient._id;
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role   = (session.user as any).role;
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');
    const doctorId  = searchParams.get('doctorId');

    const query: any = {};

    // ── DOCTOR: only records they created ─────────────────
    if (role === 'doctor') {
      const doctor = await getSessionDoctor(session);
      if (!doctor)
        return NextResponse.json({ records: [] });
      query.doctorId = doctor._id;
      // If admin also requests a specific patient, include that filter too
      if (patientId) query.patientId = patientId;
    }

    // ── PATIENT: only their own records ───────────────────
    else if (role === 'patient') {
      const patientIds = await getSessionPatientIds(session);
      if (patientIds.length === 0)
        return NextResponse.json({ records: [] });
      query.patientId = { $in: patientIds };
    }

    // ── ADMIN/STAFF: apply optional filters ───────────────
    else {
      if (patientId) query.patientId = patientId;
      if (doctorId)  query.doctorId  = doctorId;
    }

    const records = await MedicalRecord.find(query)
      .populate('patientId', 'name email phone dob gender bloodGroup allergies')
      .populate('doctorId',  'name specialization qualification')
      .sort({ createdAt: -1 });

    return NextResponse.json({ records });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role   = (session.user as any).role;
    const body   = await req.json();

    if (!body.diagnosis?.trim())
      return NextResponse.json({ error: 'Diagnosis is required' }, { status: 400 });

    if (role === 'patient') {
      return NextResponse.json(
        { error: 'Patients can view prescriptions, but cannot create medical records.' },
        { status: 403 }
      );
    }

    // If doctor is creating the record, prove the doctor-patient relationship.
    if (role === 'doctor') {
      const doctor = await getSessionDoctor(session);
      if (!doctor)
        return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 });

      let patientId = body.patientId;

      if (body.appointmentId) {
        const appointment = await Appointment.findOne({
          _id: body.appointmentId,
          ...doctorAppointmentQuery(doctor),
          status: { $ne: 'cancelled' },
        }).lean() as any;

        if (!appointment) {
          return NextResponse.json(
            { error: 'You can only create records for appointments assigned to you.' },
            { status: 403 }
          );
        }

        patientId = await getOrCreateAppointmentPatient(appointment);
        body.appointmentId = appointment._id;
      } else if (patientId) {
        const treatedAppointment = await Appointment.findOne({
          ...doctorAppointmentQuery(doctor),
          patientId,
          status: { $ne: 'cancelled' },
        }).lean();

        if (!treatedAppointment) {
          return NextResponse.json(
            { error: 'You can only create records for patients you have treated.' },
            { status: 403 }
          );
        }
      } else {
        return NextResponse.json({ error: 'Patient is required' }, { status: 400 });
      }

      body.patientId = patientId;
      body.doctorId = doctor._id;
    } else if (!body.patientId) {
      return NextResponse.json({ error: 'Patient is required' }, { status: 400 });
    }

    const record = await MedicalRecord.create(body);
    const populated = await MedicalRecord.findById(record._id)
      .populate('patientId', 'name email phone')
      .populate('doctorId',  'name specialization');

    return NextResponse.json({ record: populated }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
