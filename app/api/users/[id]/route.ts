// dental-clinic\app\api\users\[id]\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: 'Unauthorized', status: 401 };
  if ((session.user as any).role !== 'admin') return { error: 'Forbidden', status: 403 };
  return null;
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const denied = await requireAdmin();
  if (denied) return NextResponse.json({ error: denied.error }, { status: denied.status });

  const body = await req.json();
  delete body.password; // Never update password via this route
  const user = await User.findByIdAndUpdate(params.id, body, { new: true }).select('-password');
  return NextResponse.json({ user });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const denied = await requireAdmin();
  if (denied) return NextResponse.json({ error: denied.error }, { status: denied.status });

  await User.findByIdAndUpdate(params.id, { isActive: false });
  return NextResponse.json({ message: 'User deactivated' });
}
