import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current password and new password are required.' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters.' }, { status: 400 });
    }

    await connectDB();
    const userId = (session.user as any).id;
    const user = await User.findById(userId);

    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });
    }

    user.password = newPassword;
    await user.save();

    return NextResponse.json({ message: 'Password changed successfully.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to change password.' }, { status: 500 });
  }
}
