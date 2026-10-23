// dental-clinic\app\api\appointments\pending\route.ts
import { NextResponse } from 'next/server';
import { connectDB }    from '@/lib/mongodb';
import Appointment      from '@/models/Appointment';
import { getServerSession } from 'next-auth';
import { authOptions }      from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if ((session.user as any).role !== 'admin')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const pending = await Appointment.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({
      appointments: pending,
      count:        pending.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
