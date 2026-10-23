import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Patient from '@/models/Patient';
import Appointment from '@/models/Appointment';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { doctorAppointmentQuery, getSessionDoctor } from '@/lib/doctorAccess';

async function canReadPatient(session: any, patient: any) {
  const role = (session.user as any).role;
  if (role === 'admin' || role === 'staff') return true;

  if (role === 'patient') {
    return patient.userId?._id?.toString() === (session.user as any).id
      || patient.userId?.toString() === (session.user as any).id
      || (!!patient.email && patient.email === (session.user as any).email);
  }

  if (role === 'doctor') {
    const doctor = await getSessionDoctor(session);
    if (!doctor) return false;

    const appointment = await Appointment.findOne({
      ...doctorAppointmentQuery(doctor),
      status: { $ne: 'cancelled' },
      $or: [
        { patientId: patient._id },
        ...(patient.email ? [{ email: patient.email }] : []),
        ...(patient.phone ? [{ phone: patient.phone }] : []),
      ],
    }).lean();

    return !!appointment;
  }

  return false;
}

function canMutatePatient(session: any, patient: any) {
  const role = (session.user as any).role;
  if (role === 'admin' || role === 'staff') return true;
  if (role !== 'patient') return false;

  return patient.userId?._id?.toString() === (session.user as any).id
    || patient.userId?.toString() === (session.user as any).id;
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const patient = await Patient.findById(params.id).populate('userId', 'name email isActive');
  const session = await getServerSession(authOptions);

  if (!session?.user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!patient)
    return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
  if (!(await canReadPatient(session, patient)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  return NextResponse.json({ patient });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const existing = await Patient.findById(params.id).populate('userId', 'name email isActive');
  if (!existing)
    return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
  if (!canMutatePatient(session, existing))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body    = await req.json();
  if ((session.user as any).role === 'patient') {
    delete body.userId;
    delete body.email;
  }

  const patient = await Patient.findByIdAndUpdate(params.id, body, { new: true });
  return NextResponse.json({ patient });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!['admin', 'staff'].includes((session.user as any).role))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await Patient.findByIdAndDelete(params.id);
  return NextResponse.json({ message: 'Patient deleted' });
}
