import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Appointment from '@/models/Appointment';
import { notifyAppointment } from '@/lib/notifications';
import { format, addDays, startOfDay, endOfDay } from 'date-fns';

// Call this endpoint daily via a free cron service like cron-job.org
// Set it to hit: https://yourdomain.com/api/cron/reminders
// Add header: x-cron-secret: your_secret

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();

  // Find all confirmed appointments for tomorrow
  const tomorrow = addDays(new Date(), 1);
  const appointments = await Appointment.find({
    date: { $gte: startOfDay(tomorrow), $lte: endOfDay(tomorrow) },
    status: 'confirmed',
    reminderSent: { $ne: true },
  });

  let sent = 0;
  for (const appt of appointments) {
    const dateStr = format(new Date(appt.date), 'EEE, dd MMM yyyy');
    await notifyAppointment('reminder', {
      appointmentId: appt._id.toString(),
      patientName: appt.patientName,
      patientEmail: (appt as any).email,
      patientPhone: (appt as any).phone,
      doctorName: appt.doctorName,
      service: appt.service,
      date: dateStr,
      timeSlot: appt.timeSlot,
    });
    // Mark as reminded
    await Appointment.findByIdAndUpdate(appt._id, { reminderSent: true });
    sent++;
  }

  return NextResponse.json({ message: `Reminders sent: ${sent}` });
}