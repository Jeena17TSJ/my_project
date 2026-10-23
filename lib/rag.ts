
import { connectDB } from './mongodb';
import Doctor        from '@/models/Doctor';
import Appointment   from '@/models/Appointment';
import { SERVICE_CARDS } from '@/lib/constants';
import { addDays, format } from 'date-fns';

const serviceLines = SERVICE_CARDS.map((s) => `- ${s.title.padEnd(27)} : ${s.price}`).join('\n');

// -- Static clinic knowledge ---------------------------------
const CLINIC_KNOWLEDGE = `
=== CLINIC INFO ===
Name    : DentalCare Dental Clinic
Address : 123 Health Street, Koramangala, Bengaluru 560034
Phone   : +91-80-1234-5678
Email   : info@dentalcare.in
Hours   : Mon-Sat 9AM-7PM | Sunday 10AM-2PM
Emergency: +91-80-9999-0000

=== SERVICES & PRICES ===
- Dental Cleaning / Scaling : Rs. 800-1,200
- Teeth Whitening           : Rs. 3,000-6,000
- Dental Implants           : Rs. 25,000-40,000 per tooth
- Root Canal Treatment      : Rs. 5,000-12,000
- Orthodontics (Braces)     : Rs. 25,000-60,000
- Tooth Extraction          : Rs. 500-2,000
- Dental Crown              : Rs. 4,000-8,000
- Dental Veneer             : Rs. 8,000-15,000 per tooth
- Cavity Filling            : Rs. 800-2,500
- Dental X-Ray              : Rs. 300-600
- Pediatric Checkup         : Rs. 400-800
- Gum Treatment             : Rs. 2,000-8,000
- Cosmetic Dentistry        : Rs. 4,000-15,000

=== APPOINTMENT BOOKING POLICY ===
- Cancellation requires 24 hours advance notice
- Arrive 10 minutes before your appointment
`;

// -- Prompt template -----------------------------------------
function buildPromptTemplate(doctorSection: string): string {
  return `You are DentalBot, a friendly and professional AI assistant for DentalCare Dental Clinic in Bengaluru, India.

Use ONLY the knowledge base below to answer all questions. Be polite, concise, and helpful.
If something is not in the knowledge base, say "Please call us at +91-80-1234-5678 for more details."

KNOWLEDGE BASE:
${CLINIC_KNOWLEDGE}

=== DOCTORS (Live from database) ===
${doctorSection}

---------------------------------------------------
APPOINTMENT BOOKING FLOW
---------------------------------------------------
When a user wants to book an appointment, collect ALL required fields
one at a time - ask only ONE question per message:

REQUIRED (collect in this order):
  Step 1 ? Full name
  Step 2 ? Phone number (10-digit Indian mobile, e.g. 9876543210)
  Step 3 - Email address (say "optional - for email confirmation")
  Step 4 ? Service / treatment needed
           (suggest a doctor based on the service if user is unsure:
            - General/Cosmetic  ? Dr. Priya Sharma
            - Orthodontics      ? Dr. Arjun Mehta
            - Surgery/Implants  ? Dr. Sneha Rao
            - Kids/Pediatric    ? Dr. Rohan Patel)
  Step 5 ? Preferred doctor
           (list ALL doctors first, then ask the patient to choose one;
            show available days for the selected doctor)
  Step 6 ? Preferred date
           (ask in plain English like "Which date works for you?",
            confirm the day name, e.g. "That's a Monday - Dr. Priya is available on Mondays ?")
  Step 7 ? Preferred time slot
           (list ONLY available slots for that exact doctor+date;
            use DATE-SPECIFIC FREE SLOTS when provided;
            do not show booked, completed, disabled, or unavailable slots)

OPTIONAL (ask only if user seems willing):
  - Gender
  - Date of birth

CONFIRMATION:
Once all REQUIRED fields are collected, show a summary:

  "Here's your booking summary:
   - Name    : [name]
   - Phone   : [phone]
   - Service : [service]
   - Doctor  : Dr. [doctor]
   - Date    : [date]
   - Time    : [timeslot]
   - Fee     : Rs. [fee]
   Shall I confirm this appointment? (yes / no)"

BOOKING RULES:
- Never suggest a doctor or time slot not in the knowledge base
- Whenever asking for a doctor, list the entire active doctors list from the knowledge base
- Never list booked/completed time slots as options
- If all slots are booked on a date, say no slots are available and ask for another date
- If user asks for a day the doctor is unavailable, politely suggest available days
- Always confirm the day name when user gives a date
- Once user says "yes" or "confirm", output ONLY this JSON on a single line:

BOOKING_CONFIRMED:{"name":"[name]","phone":"[phone]","email":"[email or empty]","doctor":"[doctor name without Dr. prefix]","service":"[service]","date":"YYYY-MM-DD","timeSlot":"H:MM AM/PM","fee":[fee number],"gender":"[gender or empty]","notes":""}

CRITICAL FORMAT RULES:
- The line must start exactly with: BOOKING_CONFIRMED:
- date must be YYYY-MM-DD format (e.g. 2026-06-10)
- timeSlot must exactly match clinic slots (e.g. "9:00 AM", "10:00 AM")
- fee must be a number (no ? symbol)
- doctor must be just the name without "Dr." (e.g. "Priya Sharma")
- If email was not provided, use empty string ""
- Output NOTHING else after the JSON line
---------------------------------------------------`;
}

const ACTIVE_BOOKING_STATUSES = ['pending', 'confirmed', 'completed'];

function normalizeSlot(slot: string) {
  return (slot || '').trim().toLowerCase();
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

function doctorAppointmentQuery(doctor: any) {
  return {
    $or: [
      { doctorId: doctor._id },
      { doctor: doctor._id },
      { doctorName: { $in: doctorNameVariants(doctor.name) } },
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

async function buildAvailabilityCalendar(doctor: any, days = 14) {
  const today = new Date();
  const startStr = format(today, 'yyyy-MM-dd');
  const endStr = format(addDays(today, days), 'yyyy-MM-dd');
  const { dayStart } = utcDayRange(startStr);
  const { dayEnd } = utcDayRange(endStr);

  const appointments = await Appointment.find({
    ...doctorAppointmentQuery(doctor),
    date: { $gte: dayStart, $lte: dayEnd },
    status: { $in: ACTIVE_BOOKING_STATUSES },
  }).select('date timeSlot').lean() as any[];

  const bookedByDate: Record<string, string[]> = {};
  for (const appt of appointments) {
    const dateKey = format(new Date(appt.date), 'yyyy-MM-dd');
    if (!bookedByDate[dateKey]) bookedByDate[dateKey] = [];
    bookedByDate[dateKey].push(appt.timeSlot);
  }

  const lines: string[] = [];
  for (let i = 0; i < days; i++) {
    const date = addDays(today, i);
    const dateKey = format(date, 'yyyy-MM-dd');
    const dayName = format(date, 'EEEE');
    if (!doctor.availableDays?.includes(dayName)) continue;

    const slotConfig = doctor.availableSlots?.find((s: any) => s.day === dayName);
    const allSlots: string[] = slotConfig?.slots || [];
    const bookedSet = new Set((bookedByDate[dateKey] || []).map(normalizeSlot));
    const freeSlots = allSlots.filter(slot => !bookedSet.has(normalizeSlot(slot)));

    lines.push(
      `     ${dateKey} (${dayName}): ${
        freeSlots.length > 0 ? freeSlots.join(', ') : 'No available slots'
      }`
    );
  }

  return lines.length > 0
    ? lines.join('\n')
    : '     No available slots in the next 60 days';
}

// --------------------------------------------------------------
// DYNAMIC - Fetches live doctor data from MongoDB
// Use this in production API routes
// --------------------------------------------------------------
export async function buildDynamicSystemPrompt(): Promise<string> {
  let doctorSection = '';

  try {
    await connectDB();
    const doctors = await Doctor.find({ isActive: true })
      .sort({ experience: -1 })
      .lean() as any[];

    if (doctors.length === 0) {
      doctorSection = 'No doctors currently available. Please call +91-80-1234-5678.';
    } else {
      const doctorSections = await Promise.all(doctors.map(async (d: any, i: number) => {
        const availabilityCalendar = await buildAvailabilityCalendar(d);

        return `${i + 1}. ${d.name} - ${d.specialization} | Fee Rs. ${d.consultationFee} | Days: ${d.availableDays?.join(', ') || 'Mon-Sat'}
   Date-specific FREE slots for booking (next 14 days only; booked/completed slots removed):
${availabilityCalendar}
   For later dates, collect the request and the server will validate before booking.`;
      }));

      doctorSection = doctorSections.join('\n\n');
    }
  } catch (err: any) {
    console.error('[RAG] Failed to fetch doctors from DB:', err.message);
    doctorSection = `1. Dr. Priya Sharma - General & Cosmetic Dentistry | Fee: Rs. 500
   Available: Monday, Wednesday, Friday
   Slots: 9:00 AM, 10:00 AM, 11:00 AM, 2:00 PM, 3:00 PM, 4:00 PM

2. Dr. Arjun Mehta - Orthodontics | Fee: Rs. 700
   Available: Tuesday, Thursday, Saturday
   Slots: 10:00 AM, 11:00 AM, 2:00 PM, 3:00 PM, 5:00 PM

3. Dr. Sneha Rao - Oral Surgery & Implants | Fee: Rs. 800
   Available: Monday, Tuesday, Thursday
   Slots: 9:00 AM, 10:00 AM, 3:00 PM, 4:00 PM, 5:00 PM

4. Dr. Rohan Patel - Pediatric Dentistry | Fee: Rs. 400
   Available: Wednesday, Friday, Saturday
   Slots: 9:00 AM, 10:00 AM, 11:00 AM, 2:00 PM, 3:00 PM`;
  }

  return buildPromptTemplate(doctorSection);
}

// --------------------------------------------------------------
// STATIC - Uses hardcoded fallback (kept for backward compat)
// --------------------------------------------------------------
export function buildSystemPrompt(customDoctorSection?: string): string {
  const fallbackDoctors = `1. Dr. Priya Sharma - General & Cosmetic Dentistry | 12 yrs | Fee: Rs. 500
   Available: Monday, Wednesday, Friday
   Slots: 9:00 AM, 10:00 AM, 11:00 AM, 2:00 PM, 3:00 PM, 4:00 PM

2. Dr. Arjun Mehta - Orthodontics | 8 yrs | Fee: Rs. 700
   Available: Tuesday, Thursday, Saturday
   Slots: 10:00 AM, 11:00 AM, 2:00 PM, 3:00 PM, 5:00 PM

3. Dr. Sneha Rao - Oral Surgery & Implants | 15 yrs | Fee: Rs. 800
   Available: Monday, Tuesday, Thursday
   Slots: 9:00 AM, 10:00 AM, 3:00 PM, 4:00 PM, 5:00 PM

4. Dr. Rohan Patel - Pediatric Dentistry | 6 yrs | Fee: Rs. 400
   Available: Wednesday, Friday, Saturday
   Slots: 9:00 AM, 10:00 AM, 11:00 AM, 2:00 PM, 3:00 PM`;

  return buildPromptTemplate(customDoctorSection || fallbackDoctors);
}

// -- Dental knowledge export (for reference) -----------------
export const dentalKnowledge = CLINIC_KNOWLEDGE;
