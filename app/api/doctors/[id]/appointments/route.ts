import { NextRequest, NextResponse } from 'next/server';
import { connectDB }  from '@/lib/mongodb';
import Appointment    from '@/models/Appointment';
import Doctor         from '@/models/Doctor';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { doctorAppointmentQuery, getSessionDoctor, sameId } from '@/lib/doctorAccess';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    if (!user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const doctor = await Doctor.findById(params.id).lean() as any;
    if (!doctor)
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });

    if (user.role === 'doctor') {
      const sessionDoctor = await getSessionDoctor(session);
      if (!sameId(sessionDoctor?._id, doctor._id))
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    } else if (!['admin', 'staff'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const query: any = doctorAppointmentQuery(doctor);
    if (status) query.status = status;

    const appointments = await Appointment.find(query)
      .sort({ date: -1 })
      .lean();

    return NextResponse.json({ appointments, doctorName: doctor.name });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
