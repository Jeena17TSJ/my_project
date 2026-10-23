import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import MedicalRecord from '@/models/MedicalRecord';
import Patient from '@/models/Patient';
import Appointment from '@/models/Appointment';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSessionDoctor, sameId } from '@/lib/doctorAccess';

function exactEmail(email: string) {
  return new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
}

async function getSessionPatient(session: any) {
  const user = session?.user as any;
  if (!user) return null;

  return Patient.findOne({
    $or: [
      { userId: user.id },
      ...(user.email ? [{ email: exactEmail(user.email) }] : []),
    ],
  }).lean() as any;
}

async function getSessionPatientIds(session: any) {
  const user = session?.user as any;
  if (!user) return [];

  const patientIds = new Set<string>();
  const patient = await getSessionPatient(session);
  if (patient?._id) patientIds.add(patient._id.toString());

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

async function canAccessRecord(session: any, record: any, mutate = false) {
  const role = (session.user as any).role;

  if (role === 'admin' || role === 'staff') return true;
  if (role === 'patient') {
    if (mutate) return false;
    const patientIds = await getSessionPatientIds(session);
    return patientIds.some(patientId => sameId(record.patientId, patientId));
  }
  if (role === 'doctor') {
    const doctor = await getSessionDoctor(session);
    return sameId(record.doctorId, doctor?._id);
  }

  return false;
}

async function findPopulatedRecord(id: string) {
  return MedicalRecord.findById(id)
    .populate('patientId', 'name email phone dob gender bloodGroup allergies')
    .populate('doctorId', 'name specialization qualification');
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const record = await findPopulatedRecord(params.id);
  if (!record)
    return NextResponse.json({ error: 'Record not found' }, { status: 404 });

  if (!(await canAccessRecord(session, record)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  return NextResponse.json({ record });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const existing = await MedicalRecord.findById(params.id);
  if (!existing)
    return NextResponse.json({ error: 'Record not found' }, { status: 404 });

  if (!(await canAccessRecord(session, existing, true)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  if ((session.user as any).role === 'doctor') {
    delete body.patientId;
    delete body.doctorId;
    delete body.appointmentId;
  }

  const record = await MedicalRecord.findByIdAndUpdate(params.id, body, { new: true })
    .populate('patientId', 'name email phone dob gender bloodGroup allergies')
    .populate('doctorId', 'name specialization qualification');

  return NextResponse.json({ record });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const existing = await MedicalRecord.findById(params.id);
  if (!existing)
    return NextResponse.json({ error: 'Record not found' }, { status: 404 });

  if (!(await canAccessRecord(session, existing, true)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await MedicalRecord.findByIdAndDelete(params.id);
  return NextResponse.json({ message: 'Record deleted' });
}
