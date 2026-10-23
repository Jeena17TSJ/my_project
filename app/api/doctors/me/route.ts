import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { getSessionDoctor } from '@/lib/doctorAccess';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'doctor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const doctor = await getSessionDoctor(session);

    if (!doctor) {
      return NextResponse.json({
        doctor: null,
        displayName: user.name || 'Doctor',
      });
    }

    return NextResponse.json({
      doctor,
      displayName: doctor.name || user.name || 'Doctor',
    }, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to load doctor profile' },
      { status: 500 }
    );
  }
}
