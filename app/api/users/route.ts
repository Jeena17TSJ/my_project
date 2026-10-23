import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: 'Unauthorized', status: 401 };
  if ((session.user as any).role !== 'admin') return { error: 'Forbidden', status: 403 };
  return null;
}

export async function GET() {
  await connectDB();
  const denied = await requireAdmin();
  if (denied) return NextResponse.json({ error: denied.error }, { status: denied.status });

  const users = await User.find({}).select('-password').sort({ createdAt: -1 });
  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const denied = await requireAdmin();
    if (denied) return NextResponse.json({ error: denied.error }, { status: denied.status });

    const { name, email, phone, role, password } = await req.json();

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Name, email, and password are required.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    if (role === 'doctor') {
      return NextResponse.json(
        { message: 'Doctors must be added from the Admin Doctors page.' },
        { status: 400 }
      );
    }

    // Check for duplicate email
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return NextResponse.json({ message: 'A user with this email already exists.' }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || undefined,
      role: role || 'patient',
      password: hashedPassword,
      isActive: true,
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user.toObject();
    return NextResponse.json({ user: userWithoutPassword }, { status: 201 });

  } catch (error: any) {
    console.error('POST /api/users error:', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
