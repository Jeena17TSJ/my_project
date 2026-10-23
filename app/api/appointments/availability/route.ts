// // dental-clinic\app\api\appointments\availability\route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { connectDB } from '@/lib/mongodb';
// import Appointment   from '@/models/Appointment';

// export async function GET(req: NextRequest) {
//   try {
//     await connectDB();
//     const { searchParams } = new URL(req.url);
//     const doctorName = searchParams.get('doctorName');
//     const date       = searchParams.get('date');         // expects "YYYY-MM-DD"

//     if (!doctorName || !date) {
//       return NextResponse.json({ bookedSlots: [] });
//     }

//     // Parse date parts directly to avoid timezone shifts from new Date("YYYY-MM-DD")
//     const [year, month, day] = date.split('-').map(Number);

//     // Build UTC day boundaries explicitly — works regardless of server timezone
//     const dayStart = new Date(Date.UTC(year, month - 1, day,  0,  0,  0,   0));
//     const dayEnd   = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

//     const booked = await Appointment.find({
//       doctorName,
//       date:   { $gte: dayStart, $lte: dayEnd },
//       status: { $in: ['pending', 'confirmed'] },
//     }).select('timeSlot patientName');

//     const bookedSlots: string[] = booked.map((a: any) => a.timeSlot);

//     return NextResponse.json({ bookedSlots, count: bookedSlots.length });
//   } catch (err: any) {
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }

// app/api/appointments/availability/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Appointment   from '@/models/Appointment';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function utcDayRange(dateStr: string): { dayStart: Date; dayEnd: Date } {
  const [year, month, day] = dateStr.split('-').map(Number);
  return {
    dayStart: new Date(Date.UTC(year, month - 1, day,  0,  0,  0,   0)),
    dayEnd:   new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999)),
  };
}

function doctorNameVariants(doctorName: string) {
  const plainName = (doctorName || '')
    .replace(/^Dr\.?\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  return Array.from(new Set([
    doctorName,
    plainName,
    plainName ? `Dr. ${plainName}` : '',
    plainName ? `Dr.${plainName}` : '',
  ].filter(Boolean)));
}

function noStoreJson(data: any, init?: ResponseInit) {
  return NextResponse.json(data, {
    ...init,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      ...(init?.headers || {}),
    },
  });
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const doctorName = searchParams.get('doctorName');
    const date       = searchParams.get('date');   // expects "YYYY-MM-DD"

    if (!doctorName || !date) {
      return noStoreJson({ bookedSlots: [] });
    }

    const { dayStart, dayEnd } = utcDayRange(date);

    const booked = await Appointment.find({
      doctorName: { $in: doctorNameVariants(doctorName) },
      date:   { $gte: dayStart, $lte: dayEnd },
      status: { $in: ['pending', 'confirmed', 'completed'] },
    }).select('timeSlot patientName');

    const bookedSlots: string[] = booked.map((a: any) => a.timeSlot);

    return noStoreJson({ bookedSlots, count: bookedSlots.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
