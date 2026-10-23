import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

const allowedRoles = ['admin', 'doctor', 'patient'];

export async function POST(req: NextRequest) {
  try {
    const { email, role, newPassword } = await req.json();

    if (!email || !role || !newPassword) {
      return NextResponse.json({ error: 'Email, role, and new password are required.' }, { status: 400 });
    }

    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ error: 'Please select a valid account type.' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters.' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase(), role });

    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'No active account found for that email and role.' }, { status: 404 });
    }

    user.password = newPassword;
    await user.save();

    return NextResponse.json({ message: 'Password reset successfully. You can now sign in.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to reset password.' }, { status: 500 });
  }
}
