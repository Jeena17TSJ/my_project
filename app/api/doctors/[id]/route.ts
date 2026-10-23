import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Doctor        from '@/models/Doctor';
import User          from '@/models/User';
import Appointment   from '@/models/Appointment';
import { getServerSession } from 'next-auth';
import { authOptions }      from '@/lib/auth';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: 'Unauthorized', status: 401 };
  if ((session.user as any).role !== 'admin') return { error: 'Forbidden', status: 403 };
  return null;
}

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const doctor = await Doctor.findById(params.id)
      .populate('userId', 'name email isActive');
    if (!doctor)
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    return NextResponse.json({ doctor });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const denied = await requireAdmin();
    if (denied) return NextResponse.json({ error: denied.error }, { status: denied.status });

    const body = await req.json();
    const doctor = await Doctor.findByIdAndUpdate(
      params.id, body, { new: true, runValidators: true }
    ).populate('userId', 'name email isActive');

    if (!doctor)
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });

    // Sync isActive with linked User account
    if (body.isActive !== undefined && doctor.userId) {
      await User.findByIdAndUpdate(doctor.userId, { isActive: body.isActive });
    }

    return NextResponse.json({ doctor, message: 'Doctor updated' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const denied = await requireAdmin();
    if (denied) return NextResponse.json({ error: denied.error }, { status: denied.status });

    const doctor = await Doctor.findById(params.id);
    if (!doctor)
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });

    // Check for upcoming appointments
    const upcoming = await Appointment.countDocuments({
      doctorName: doctor.name,
      date:       { $gte: new Date() },
      status:     { $in: ['pending', 'confirmed'] },
    });

    if (upcoming > 0) {
      return NextResponse.json(
        { error: `Cannot delete — doctor has ${upcoming} upcoming appointment(s). Deactivate instead.` },
        { status: 400 }
      );
    }

    await Doctor.findByIdAndDelete(params.id);
    return NextResponse.json({ message: 'Doctor deleted' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
