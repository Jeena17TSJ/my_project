import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Appointment  from '@/models/Appointment';
import Patient      from '@/models/Patient';
import Doctor       from '@/models/Doctor';
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

    const [
      totalPatients,
      totalAppointments,
      totalDoctors,
      appointmentsByStatus,
      appointmentsByMonth,
      recentAppointments,
    ] = await Promise.all([
      Patient.countDocuments(),
      Appointment.countDocuments(),
      Doctor.countDocuments(),
      Appointment.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Appointment.aggregate([
        {
          $group: {
            _id: {
              month: { $month: '$date' },
              year:  { $year:  '$date' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 },
      ]),
      Appointment.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    // Appointment stats breakdown
    const statusMap: Record<string, number> = {};
    appointmentsByStatus.forEach((s: any) => { statusMap[s._id] = s.count; });

    return NextResponse.json({
      totalPatients,
      totalAppointments,
      totalDoctors,
      appointmentsByStatus,
      appointmentsByMonth,
      recentAppointments,
      statusBreakdown: {
        pending:   statusMap['pending']   || 0,
        confirmed: statusMap['confirmed'] || 0,
        completed: statusMap['completed'] || 0,
        cancelled: statusMap['cancelled'] || 0,
      },
    });
  } catch (err: any) {
    console.error('Reports API error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
