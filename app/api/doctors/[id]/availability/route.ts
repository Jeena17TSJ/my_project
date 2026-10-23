// app/api/doctors/[id]/availability/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB }                 from '@/lib/mongodb';
import Doctor                        from '@/models/Doctor';
import Appointment                   from '@/models/Appointment';
import { format, addDays, startOfDay, parseISO } from 'date-fns';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DAY_NAMES = [
  'Sunday', 'Monday', 'Tuesday',
  'Wednesday', 'Thursday', 'Friday', 'Saturday',
];

const ACTIVE_STATUSES = ['pending', 'confirmed', 'completed'];

function normalizeSlot(slot: string) {
  return (slot || '').trim().toLowerCase();
}

function normalizeDoctorName(doctorName: string) {
  return (doctorName || '')
    .replace(/^Dr\.?\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function doctorNameVariants(doctorName: string) {
  const plainName = normalizeDoctorName(doctorName);
  return Array.from(new Set([
    doctorName,
    plainName,
    plainName ? `Dr. ${plainName}` : '',
    plainName ? `Dr.${plainName}` : '',
  ].filter(Boolean)));
}

function doctorAppointmentQuery(doctor: any) {
  const doctorNames = doctorNameVariants(doctor.name);

  return {
    $or: [
      { doctorId: doctor._id },
      { doctor: doctor._id },
      { doctorName: { $in: doctorNames } },
    ],
  };
}

function utcDayRange(dateStr: string): { dayStart: Date; dayEnd: Date } {
  const [year, month, day] = dateStr.split('-').map(Number);
  return {
    dayStart: new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0)),
    dayEnd: new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999)),
  };
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

// ── GET /api/doctors/[id]/availability ───────────────────────
// ?days=60          → returns array of availability for next N days
// ?date=YYYY-MM-DD  → returns slot detail for a single date
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const doctor = await Doctor.findById(params.id).lean() as any;
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');
    const daysParam = parseInt(searchParams.get('days') || '60', 10);

    // ── Single date detail ────────────────────────────────────
    if (dateParam) {
      const date    = parseISO(dateParam);
      const dayName = DAY_NAMES[date.getDay()];
      const isWorkDay = (doctor.availableDays as string[]).includes(dayName);

      if (!isWorkDay) {
        return noStoreJson({
          available:  false,
          onLeave:    false,
          dayName,
          reason:     `${doctor.name} does not work on ${dayName}s`,
          slots:      [],
          bookedSlots:[],
          freeSlots:  [],
          freeCount:  0,
          totalSlots: 0,
        });
      }

      // Get all slots for this day
      const daySlotConfig = (doctor.availableSlots as any[])?.find(
        (s: any) => s.day === dayName
      );
      const allSlots: string[] = daySlotConfig?.slots || [];

      // Find already-booked slots
      const { dayStart, dayEnd } = utcDayRange(dateParam);

      const bookedAppointments = await Appointment.find({
        ...doctorAppointmentQuery(doctor),
        date:   { $gte: dayStart, $lte: dayEnd },
        status: { $in: ACTIVE_STATUSES },
      }).lean() as any[];

      const bookedSlots = bookedAppointments.map((a: any) => a.timeSlot);
      const bookedSet   = new Set(bookedSlots.map(normalizeSlot));
      const freeSlots   = allSlots.filter(s => !bookedSet.has(normalizeSlot(s)));

      return noStoreJson({
        available:  true,
        onLeave:    false,
        dayName,
        slots:      allSlots,
        bookedSlots,
        freeSlots,
        freeCount:  freeSlots.length,
        totalSlots: allSlots.length,
      });
    }

    // ── Multi-day availability range ─────────────────────────
    const today      = new Date();
    const availableDates: any[] = [];

    // Pre-fetch all booked appointments in the range to avoid N+1 queries
    const rangeEnd = addDays(today, daysParam);
    const bookedInRange = await Appointment.find({
      ...doctorAppointmentQuery(doctor),
      date:   { $gte: startOfDay(today), $lte: rangeEnd },
      status: { $in: ACTIVE_STATUSES },
    }).lean() as any[];

    // Group booked slots by date string
    const bookedByDate: Record<string, string[]> = {};
    for (const appt of bookedInRange) {
      const key = format(new Date(appt.date), 'yyyy-MM-dd');
      if (!bookedByDate[key]) bookedByDate[key] = [];
      bookedByDate[key].push(appt.timeSlot);
    }

    for (let i = 0; i < daysParam; i++) {
      const date    = addDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayName = DAY_NAMES[date.getDay()];
      const isWorkDay = (doctor.availableDays as string[]).includes(dayName);

      if (!isWorkDay) {
        availableDates.push({
          date:      dateStr,
          dayName,
          available: false,
          onLeave:   false,
          freeSlots: 0,
          totalSlots:0,
        });
        continue;
      }

      const daySlotConfig = (doctor.availableSlots as any[])?.find(
        (s: any) => s.day === dayName
      );
      const allSlots: string[] = daySlotConfig?.slots || [];
      const booked             = bookedByDate[dateStr] || [];
      const bookedSet          = new Set(booked.map(normalizeSlot));
      const freeCount          = allSlots.filter(s => !bookedSet.has(normalizeSlot(s))).length;

      availableDates.push({
        date:      dateStr,
        dayName,
        available: allSlots.length > 0,   // work day with slots configured
        onLeave:   false,
        freeSlots: Math.max(0, freeCount),
        totalSlots:allSlots.length,
      });
    }

    return noStoreJson({ availableDates });

  } catch (error: any) {
    console.error('[availability] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}
