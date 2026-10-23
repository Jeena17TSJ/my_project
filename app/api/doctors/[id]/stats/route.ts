import { NextRequest, NextResponse } from 'next/server';
import { connectDB }  from '@/lib/mongodb';
import Appointment    from '@/models/Appointment';
import Doctor         from '@/models/Doctor';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { doctorAppointmentQuery, getSessionDoctor, sameId } from '@/lib/doctorAccess';

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    if (!user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const doctor = await Doctor.findById(params.id).lean() as any;
    if (!doctor)
      return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (user.role === 'doctor') {
      const sessionDoctor = await getSessionDoctor(session);
      if (!sameId(sessionDoctor?._id, doctor._id))
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    } else if (!['admin', 'staff'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [
      totalAppointments,
      pendingAppointments,
      confirmedAppointments,
      completedAppointments,
      cancelledAppointments,
      todayAppointments,
    ] = await Promise.all([
      Appointment.countDocuments(doctorAppointmentQuery(doctor)),
      Appointment.countDocuments({ ...doctorAppointmentQuery(doctor), status: 'pending' }),
      Appointment.countDocuments({ ...doctorAppointmentQuery(doctor), status: 'confirmed' }),
      Appointment.countDocuments({ ...doctorAppointmentQuery(doctor), status: 'completed' }),
      Appointment.countDocuments({ ...doctorAppointmentQuery(doctor), status: 'cancelled' }),
      Appointment.countDocuments({
        ...doctorAppointmentQuery(doctor),
        date: {
          $gte: new Date(new Date().setHours(0,0,0,0)),
          $lte: new Date(new Date().setHours(23,59,59,999)),
        },
        status: { $in: ['pending','confirmed'] },
      }),
    ]);

    return NextResponse.json({
      totalAppointments,
      pendingAppointments,
      confirmedAppointments,
      completedAppointments,
      cancelledAppointments,
      todayAppointments,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
