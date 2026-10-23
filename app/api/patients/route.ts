// app/api/patients/route.ts  (UPDATED — handles createAccount)
import { NextRequest, NextResponse } from 'next/server';
import { connectDB }        from '@/lib/mongodb';
import Patient              from '@/models/Patient';
import Appointment          from '@/models/Appointment';
import User                 from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions }      from '@/lib/auth';
import { doctorAppointmentQuery, getSessionDoctor } from '@/lib/doctorAccess';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role   = (session.user as any).role;

    // ── DOCTOR: only see their patients ──────────────────
    if (role === 'doctor') {
      const doctor = await getSessionDoctor(session);
      if (!doctor)
        return NextResponse.json({ patients: [], total: 0 });

      // Get all non-cancelled appointments for this doctor
      const appointments = await Appointment.find({
        ...doctorAppointmentQuery(doctor),
        status:     { $ne: 'cancelled' },
      }).select('patientId email phone').lean() as any[];

      const patientIds    = new Set<string>();
      const patientEmails = new Set<string>();
      const patientPhones = new Set<string>();

      appointments.forEach((a: any) => {
        if (a.patientId) patientIds.add(a.patientId.toString());
        if (a.email)     patientEmails.add(a.email.toLowerCase());
        if (a.phone)     patientPhones.add(a.phone);
      });

      if (patientIds.size === 0 && patientEmails.size === 0 && patientPhones.size === 0)
        return NextResponse.json({ patients: [], total: 0, doctorName: doctor.name });

      const orConditions: any[] = [];
      if (patientIds.size   > 0) orConditions.push({ _id:   { $in: [...patientIds]    } });
      if (patientEmails.size > 0) orConditions.push({ email: { $in: [...patientEmails] } });
      if (patientPhones.size > 0) orConditions.push({ phone: { $in: [...patientPhones] } });

      const patients = await Patient.find({ $or: orConditions })
        .populate('userId', 'name email isActive')
        .sort({ createdAt: -1 })
        .lean();

      return NextResponse.json({ patients, total: patients.length, doctorName: doctor.name });
    }

    // ── ADMIN/STAFF: all patients ─────────────────────────
    const patients = await Patient.find({})
      .populate('userId', 'name email isActive')
      .sort({ createdAt: -1 });

    return NextResponse.json({ patients, total: patients.length });
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
    if (!['admin', 'staff'].includes((session.user as any).role))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();

    if (!body.name?.trim())
      return NextResponse.json({ error: 'Patient name is required' }, { status: 400 });

    // Duplicate check
    if (body.phone || body.email) {
      const orConds: any[] = [];
      if (body.phone) orConds.push({ phone: body.phone });
      if (body.email) orConds.push({ email: body.email.toLowerCase() });
      const exists = await Patient.findOne({ $or: orConds });
      if (exists)
        return NextResponse.json(
          { error: 'A patient with this phone or email already exists.' },
          { status: 409 }
        );
    }

    // ── Optionally create a user portal account ────────────
    let userId: string | undefined;
    if (body.createAccount && body.email && body.password) {
      const existingUser = await User.findOne({ email: body.email.toLowerCase() });
      if (existingUser) {
        userId = existingUser._id.toString();
        // Ensure role is patient
        if (existingUser.role !== 'patient') {
          await User.findByIdAndUpdate(existingUser._id, { role: 'patient' });
        }
      } else {
        const newUser = await User.create({
          name:     body.name,
          email:    body.email.toLowerCase(),
          password: body.password,    // pre-save hook hashes it
          phone:    body.phone || '',
          role:     'patient',
          isActive: true,
        });
        userId = newUser._id.toString();
      }
    }

    const { createAccount, password, ...patientData } = body;

    const patient = await Patient.create({
      ...patientData,
      userId:  userId || undefined,
      email:   body.email?.toLowerCase() || '',
    });

    const populated = await Patient.findById(patient._id)
      .populate('userId', 'name email isActive');

    return NextResponse.json(
      {
        patient:     populated,
        accountCreated: !!userId,
        message:     userId
          ? `Patient added with portal account. Login: ${body.email}`
          : 'Patient added successfully.',
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
