import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Patient from '@/models/Patient';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { name, email, password, phone } = await req.json();

    const exists = await User.findOne({ email });
    if (exists) return NextResponse.json({ error: 'Email already registered' }, { status: 400 });

    const user = await User.create({ name, email, password, phone, role: 'patient' });

    await Patient.create({ userId: user._id, name, email, phone });

    return NextResponse.json({ message: 'Registered successfully', userId: user._id }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
