import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Doctor        from '@/models/Doctor';
import User          from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions }      from '@/lib/auth';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: 'Unauthorized', status: 401 };
  if ((session.user as any).role !== 'admin') return { error: 'Forbidden', status: 403 };
  return null;
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get('active');
    const name = searchParams.get('name')?.trim();

    const query: any = {};
    if (activeOnly === 'true') {
      // Include doctors that are explicitly active OR missing the isActive field
      // (legacy seeded docs may not have this field set).
      query.$or = [ { isActive: true }, { isActive: { $exists: false } } ];
    }
    if (name) {
      query.name = new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    }

    const doctors = await Doctor.find(query)
      .populate('userId', 'name email isActive')
      .sort({ createdAt: -1 });

    return NextResponse.json({ doctors });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const denied = await requireAdmin();
    if (denied) return NextResponse.json({ error: denied.error }, { status: denied.status });

    const body = await req.json();

    if (!body.name?.trim())
      return NextResponse.json({ error: 'Doctor name is required' }, { status: 400 });
    if (!body.specialization?.trim())
      return NextResponse.json({ error: 'Specialization is required' }, { status: 400 });
    if (!body.email?.trim())
      return NextResponse.json({ error: 'Doctor login email is required' }, { status: 400 });
    if (!body.password || body.password.length < 8)
      return NextResponse.json({ error: 'Doctor password must be at least 8 characters' }, { status: 400 });

    const email = body.email.toLowerCase().trim();
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 });
    }

    const newUser = await User.create({
      name:     body.name,
      email,
      password: body.password,
      phone:    body.phone || '',
      role:     'doctor',
      isActive: true,
    });

    const doctor = await Doctor.create({
      ...body,
      email,
      password: undefined,
      userId:   newUser._id,
      isActive: true,
    });

    return NextResponse.json(
      { doctor, message: 'Doctor added successfully' },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
