// app/api/chatbot/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { groq }                      from '@/lib/groq';
import { buildDynamicSystemPrompt }  from '@/lib/rag';
import { connectDB }                 from '@/lib/mongodb';
import { CLINIC_INFO, SERVICE_CARDS, SERVICE_OPTIONS } from '@/lib/constants';
import Appointment                   from '@/models/Appointment';
import Doctor                        from '@/models/Doctor';
import Patient                       from '@/models/Patient';
import User                          from '@/models/User';
import { notifyAppointment }         from '@/lib/notifications';
import { format }                    from 'date-fns';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ── UTC-safe day range helper ──────────────────────────────────────────
function utcDayRange(dateInput: string | Date): { dayStart: Date; dayEnd: Date } {
  let iso =
    typeof dateInput === 'string'
      ? dateInput.split('T')[0]
      : dateInput.toISOString().split('T')[0];

  if (typeof dateInput === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(dateInput)) {
    const [day, month, year] = dateInput.split('/');
    iso = `${year}-${month}-${day}`;
  }

  const [year, month, day] = iso.split('-').map(Number);
  return {
    dayStart: new Date(Date.UTC(year, month - 1, day,  0,  0,  0,   0)),
    dayEnd:   new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999)),
  };
}

function normalizeDoctorName(name: string) {
  return (name || '')
    .replace(/^Dr\.?\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function doctorNameVariants(name: string) {
  const plainName = normalizeDoctorName(name);
  return Array.from(new Set([
    name,
    plainName,
    plainName ? `Dr. ${plainName}` : '',
    plainName ? `Dr.${plainName}` : '',
  ].filter(Boolean)));
}

function doctorAppointmentQuery(doctor: any, doctorName: string) {
  const variants = doctorNameVariants(doctorName);
  if (doctor?._id) {
    return {
      $or: [
        { doctorId: doctor._id },
        { doctor: doctor._id },
        { doctorName: { $in: variants } },
      ],
    };
  }

  return { doctorName: { $in: variants } };
}

const ACTIVE_BOOKING_STATUSES = ['pending', 'confirmed', 'completed'];

function normalizeSlot(slot: string) {
  return (slot || '').trim().toLowerCase();
}

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function getFreeSlotsForDoctorDate(doctor: any, dateStr: string) {
  const { dayStart, dayEnd } = utcDayRange(dateStr);
  const appointmentDate = dayStart;
  const dayName = format(appointmentDate, 'EEEE');
  const slotConfig = doctor.availableSlots?.find((s: any) => s.day === dayName);
  const allSlots: string[] = slotConfig?.slots || [];

  if (doctor.availableDays?.length && !doctor.availableDays.includes(dayName)) {
    return { dayName, allSlots: [], bookedSlots: [], freeSlots: [] };
  }

  const booked = await Appointment.find({
    ...doctorAppointmentQuery(doctor, doctor.name),
    date: { $gte: dayStart, $lte: dayEnd },
    status: { $in: ACTIVE_BOOKING_STATUSES },
  }).select('timeSlot').lean() as any[];

  const bookedSlots = booked.map(a => a.timeSlot);
  const bookedSet = new Set(bookedSlots.map(normalizeSlot));
  const freeSlots = allSlots.filter(slot => !bookedSet.has(normalizeSlot(slot)));

  return { dayName, allSlots, bookedSlots, freeSlots };
}

async function buildDoctorListReply() {
  await connectDB();
  const doctors = await Doctor.find({ isActive: { $ne: false } })
    .sort({ experience: -1 })
    .lean() as any[];

  if (doctors.length === 0) {
    return 'No doctors are currently available. Please call +91-80-1234-5678.';
  }

  return [
    'Here are all available doctors:',
    '',
    ...doctors.map((d: any, i: number) =>
      `${i + 1}. ${d.name} - ${d.specialization} | Fee: Rs. ${d.consultationFee} | Days: ${d.availableDays?.join(', ') || 'Mon-Sat'}`
    ),
    '',
    'To book an appointment, please share your full name first.',
  ].join('\n');
}

function buildServiceListReply() {
  return [
    'Here are our dental services:',
    '',
    ...SERVICE_CARDS.map((s, i) =>
      `${i + 1}. ${s.title} - ${s.price} | ${s.duration}`
    ),
    '',
    'To book an appointment, please tell me the service you need and I can show available doctors.',
  ].join('\n');
}

function buildClinicInfoReply() {
  return [
    `${CLINIC_INFO.name}`,
    '',
    `Address: ${CLINIC_INFO.address}`,
    `Phone: ${CLINIC_INFO.phone}`,
    `Email: ${CLINIC_INFO.email}`,
    `Hours: ${CLINIC_INFO.hours}`,
    `Emergency: ${CLINIC_INFO.emergency}`,
  ].join('\n');
}

function buildOfflineHelpReply() {
  return [
    'DentalBot can still help with booking basics right now.',
    '',
    'You can ask me for:',
    '- Available doctors',
    '- Services and fees',
    '- Clinic hours and contact details',
    '- Appointment booking help',
    '',
    'For detailed dental advice, please try again later or call the clinic.',
  ].join('\n');
}

function buildBookingErrorReply() {
  return [
    'I am sorry, I could not complete the booking step right now.',
    '',
    'Here is what I can still do for you:',
    '- Show available doctors and their specializations',
    '- List services and fees',
    '- Tell you the best way to book an appointment',
    '',
    'Please try again in a moment, or call +91-80-1234-5678 for immediate help.',
  ].join('\n');
}

async function localFallbackReply(messages: any[], includeGeneric = false) {
  const last = String(messages?.[messages.length - 1]?.content || '').toLowerCase();
  const combined = String(messages?.map((m: any) => m.content).join(' ') || '').toLowerCase();
  const wantsDoctors = /\b(doctor|doctors|dentist|dentists|list)\b/.test(last) || /\b(doctor|doctors|dentist|dentists|list)\b/.test(combined);
  const wantsBooking = /\b(book|booking|appointment|schedule|slot|confirm)\b/.test(last) || /\b(book|booking|appointment|schedule|slot|confirm)\b/.test(combined);
  const wantsServices = /\b(service|services|treatment|treatments|price|prices|fee|fees|cost|costs)\b/.test(last) || /\b(service|services|treatment|treatments|price|prices|fee|fees|cost|costs)\b/.test(combined);
  const wantsClinicInfo = /\b(phone|call|contact|address|location|hours|timing|time|open|emergency)\b/.test(last) || /\b(phone|call|contact|address|location|hours|timing|time|open|emergency)\b/.test(combined);

  if (wantsDoctors || wantsBooking) {
    return buildDoctorListReply();
  }

  if (wantsServices) {
    return buildServiceListReply();
  }

  if (wantsClinicInfo) {
    return buildClinicInfoReply();
  }

  if (includeGeneric) {
    if (wantsBooking) {
      return buildBookingErrorReply();
    }
    return buildOfflineHelpReply();
  }

  return null;
}

export async function POST(req: NextRequest) {
  let requestMessages: any[] = [];

  try {
    const { messages, bookingData } = await req.json();
    requestMessages = messages || [];

    // ══════════════════════════════════════════════════════
    // PATH A — Save booking to DB
    // ══════════════════════════════════════════════════════
    if (bookingData) {
      const bookingName = bookingData.name?.trim();
      const bookingPhone = bookingData.phone?.trim() || '';
      const bookingDoctor = bookingData.doctor?.trim();
      const bookingService = bookingData.service?.trim();
      const bookingDate = bookingData.date?.trim();
      const bookingTimeSlot = bookingData.timeSlot?.trim();

      if (!bookingName) {
        return NextResponse.json({
          reply: 'Please provide your full name so I can continue with the booking.',
          conflict: true,
        }, { status: 400 });
      }

      if (!bookingPhone) {
        return NextResponse.json({
          reply: 'Please share your 10-digit phone number so we can confirm your appointment.',
          conflict: true,
        }, { status: 400 });
      }

      if (!/^[6-9]\d{9}$/.test(bookingPhone)) {
        return NextResponse.json({
          reply: 'Please enter a valid 10-digit Indian mobile number, for example 9876543210.',
          conflict: true,
        }, { status: 400 });
      }

      if (!bookingService) {
        return NextResponse.json({
          reply: 'Please tell me which dental service you need so I can find the right doctor and available slots.',
          conflict: true,
        }, { status: 400 });
      }

      if (!bookingDoctor) {
        return NextResponse.json({
          reply: 'Please choose a preferred doctor or say "any available doctor" so I can proceed.',
          conflict: true,
        }, { status: 400 });
      }

      if (!bookingDate) {
        return NextResponse.json({
          reply: 'Please provide the preferred appointment date in YYYY-MM-DD format.',
          conflict: true,
        }, { status: 400 });
      }

      if (!bookingTimeSlot) {
        return NextResponse.json({
          reply: 'Please select a time slot for your appointment.',
          conflict: true,
        }, { status: 400 });
      }

      if (!SERVICE_OPTIONS.includes(bookingService)) {
        return NextResponse.json({
          reply: `⚠️ Sorry, the service "${bookingService}" is not available for booking. Please choose from: ${SERVICE_OPTIONS.join(', ')}.`,
          conflict: true,
        });
      }

      await connectDB();

      // ── Normalize date using UTC-safe range ────────────────────────────
      const { dayStart, dayEnd } = utcDayRange(bookingDate);
      const appointmentDate = dayStart; // UTC midnight — timezone-safe
      const patientEmail = bookingData.email?.trim().toLowerCase() || '';
      const patientPhone = bookingPhone;
      
      // ── Normalize doctor name and find the canonical doctor ────────────
      const requestedDoctor = bookingDoctor;
      const doctor = await Doctor.findOne({
        name: {
          $in: doctorNameVariants(requestedDoctor).map((variant) =>
            new RegExp(`^${escapeRegExp(variant)}$`, 'i')
          ),
        },
        isActive: { $ne: false },
      }).lean() as any;
      if (!doctor) {
        return NextResponse.json({
          reply: `Sorry, I could not find an active doctor profile for "${requestedDoctor}". Please choose one of the available doctors.`,
          conflict: true,
        });
      }

      const doctorName = doctor?.name || (
        requestedDoctor.startsWith('Dr.')
          ? requestedDoctor
          : `Dr. ${requestedDoctor}`
      );
      const doctorQuery = doctorAppointmentQuery(doctor, doctorName);
      const dateStr = typeof bookingData.date === 'string'
        ? bookingData.date.split('T')[0]
        : format(appointmentDate, 'yyyy-MM-dd');
      const slotAvailability = await getFreeSlotsForDoctorDate(doctor, dateStr);

      if (doctor.availableDays?.length && !doctor.availableDays.includes(slotAvailability.dayName)) {
        return NextResponse.json({
          reply: `${doctorName} is not available on ${slotAvailability.dayName}s. Available days: ${doctor.availableDays.join(', ')}.\n\nPlease choose another date.`,
          conflict: true,
        });
      }

      if (!slotAvailability.allSlots.some(slot => normalizeSlot(slot) === normalizeSlot(bookingData.timeSlot))) {
        return NextResponse.json({
          reply: `${bookingData.timeSlot} is not a valid slot for ${doctorName} on ${slotAvailability.dayName}.\n\nAvailable slots: ${slotAvailability.freeSlots.length ? slotAvailability.freeSlots.join(', ') : 'No slots available on this date'}.`,
          conflict: true,
        });
      }

      if (!slotAvailability.freeSlots.some(slot => normalizeSlot(slot) === normalizeSlot(bookingData.timeSlot))) {
        return NextResponse.json({
          reply: `Sorry, ${doctorName} is already booked on ${format(appointmentDate, 'dd MMM yyyy')} at ${bookingData.timeSlot}.\n\nAvailable slots on this date: ${slotAvailability.freeSlots.length ? slotAvailability.freeSlots.join(', ') : 'No slots available. Please choose another date.'}`,
          conflict: true,
        });
      }

      // ── 1. Double-booking check ──────────────────────────
      const conflict = await Appointment.findOne({
        ...doctorQuery,
        timeSlot:   bookingData.timeSlot,
        date:       { $gte: dayStart, $lte: dayEnd },
        status:     { $in: ACTIVE_BOOKING_STATUSES },
      }).lean();

      if (conflict) {
        return NextResponse.json({
          reply:    `⚠️ Sorry! ${doctorName} is already booked on ${format(appointmentDate, 'dd MMM yyyy')} at ${bookingData.timeSlot}.\n\nWould you like to choose a different time slot or date?`,
          conflict: true,
        });
      }

      // ── 2. Same patient same doctor same slot ─────────────
      if (patientPhone || patientEmail) {
        const orConditions: any[] = [];
        if (patientPhone) orConditions.push({ phone: patientPhone });
        if (patientEmail) orConditions.push({ email: patientEmail });

        const patientConflict = await Appointment.findOne({
          $and: [
            doctorQuery,
            { $or: orConditions },
          ],
          timeSlot:   bookingData.timeSlot,
          date:       { $gte: dayStart, $lte: dayEnd },
          status:     { $in: ACTIVE_BOOKING_STATUSES },
        }).lean() as any;

        if (patientConflict) {
          return NextResponse.json({
            reply:    `⚠️ You already have an appointment with ${doctorName} on this date at ${patientConflict.timeSlot}.\n\nWould you like to book on a different date?`,
            conflict: true,
          });
        }
      }

      // ── 3. Find or create User account ──────────────────
      let userId: string | undefined;

      if (patientEmail) {
        const cleanEmail = patientEmail;
        let user = await User.findOne({ email: cleanEmail }).lean() as any;

        if (!user) {
          const tempPassword = `Smile${Math.random().toString(36).slice(2, 8)}@1`;
          const newUser = await User.create({
            name:     bookingData.name,
            email:    cleanEmail,
            password: tempPassword,
            phone:    patientPhone,
            role:     'patient',
            isActive: true,
          });
          userId = newUser._id.toString();
          console.log(`[Chatbot] New user created: ${cleanEmail}`);
        } else {
          userId = user._id.toString();
        }
      }

      // ── 4. Find or create Patient record ────────────────
      let patient: any = null;

      const orConditions: any[] = [];
      if (patientPhone) orConditions.push({ phone: patientPhone });
      if (patientEmail) orConditions.push({ email: patientEmail });

      if (orConditions.length > 0) {
        patient = await Patient.findOne({ $or: orConditions }).lean() as any;
      }

      if (!patient) {
        const created = await Patient.create({
          userId:         userId   || undefined,
          name:           bookingData.name,
          email:          patientEmail,
          phone:          patientPhone,
          gender:         bookingData.gender || '',
          dob:            bookingData.dob    || undefined,
          address:        bookingData.address || '',
          medicalHistory: `Registered via DentalBot chatbot on ${format(new Date(), 'dd MMM yyyy HH:mm')}.`,
        });
        patient = created.toObject();
        console.log(`[Chatbot] New patient created: ${patient.name} (${patient._id})`);
      } else {
        // Update patient with any missing info
        const updates: Record<string, any> = {};
        if (bookingData.name  && !patient.name)   updates.name   = bookingData.name;
        if (patientEmail && !patient.email) updates.email = patientEmail;
        if (patientPhone && !patient.phone) updates.phone = patientPhone;
        if (userId            && !patient.userId) updates.userId = userId;

        if (Object.keys(updates).length > 0) {
          await Patient.findByIdAndUpdate(patient._id, updates);
        }
        console.log(`[Chatbot] Existing patient: ${patient.name} (${patient._id})`);
      }

      // ── 5. Create Appointment ────────────────────────────
      const appointment = await Appointment.create({
        patientId:   patient._id,
        patientName: bookingData.name,
        doctorId:    doctor?._id,
        doctorName,
        service:     bookingData.service,
        date:        appointmentDate,
        timeSlot:    bookingData.timeSlot,
        status:      'pending',          // admin must approve
        bookedVia:   'chatbot',
        fee:         bookingData.fee   || 500,
        email:       patientEmail,
        phone:       patientPhone,
        notes:       `Booked via DentalBot on ${format(new Date(), 'dd MMM yyyy HH:mm')}.`,
      });

      console.log(`[Chatbot] Appointment created: ${appointment._id}`);

      // ── 6. Send notifications ────────────────────────────
      notifyAppointment('booked', {
        appointmentId:  appointment._id.toString(),
        patientName:    bookingData.name,
        patientEmail,
        patientPhone,
        patientUserId:  userId,
        doctorName:     doctorName,
        service:        bookingData.service,
        date:           format(appointmentDate, 'EEE, dd MMM yyyy'),
        timeSlot:       bookingData.timeSlot,
      }).catch(e => console.error('[Chatbot] Notification error (non-fatal):', e.message));

      // ── 7. Build confirmation reply ──────────────────────
      const refId = appointment._id.toString().slice(-8).toUpperCase();
      const confirmReply = [
        `✅ *Appointment Booked Successfully!*`,
        ``,
        `📋 *Your Details:*`,
        `• Patient  : ${bookingData.name}`,
        `• Doctor   : ${doctorName}`,
        `• Service  : ${bookingData.service}`,
        `• Date     : ${format(appointmentDate, 'EEEE, dd MMMM yyyy')}`,
        `• Time     : ${bookingData.timeSlot}`,
        `• Fee      : ₹${bookingData.fee || 500}`,
        `• Ref ID   : #${refId}`,
        ``,
        `⏳ *Status: Pending admin approval*`,
        `You will receive a confirmation via ${
          patientEmail ? 'Email, ' : ''
        }SMS and WhatsApp once approved.`,
        ``,
        `⚠️ To cancel, call +91-80-1234-5678 at least 24 hours in advance.`,
        ``,
        `Is there anything else I can help you with? 😊`,
      ].join('\n');

      return NextResponse.json({
        reply:         confirmReply,
        conflict:      false,
        appointmentId: appointment._id.toString(),
        patientId:     patient._id.toString(),
      });
    }

    // ══════════════════════════════════════════════════════
    // PATH B — Normal chat with live system prompt
    // ══════════════════════════════════════════════════════
    const localReply = await localFallbackReply(requestMessages);
    if (localReply) return NextResponse.json({ reply: localReply, local: true });

    // Build system prompt with LIVE doctor data from DB
    const systemPrompt = await buildDynamicSystemPrompt();
    const recentMessages = requestMessages.slice(-8);

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...recentMessages.map((m: any) => ({
          role:    m.role    as 'user' | 'assistant',
          content: m.content as string,
        })),
      ],
      max_tokens:  512,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content
      || 'Sorry, I could not process that. Please try again or call +91-80-1234-5678.';

    return NextResponse.json({ reply });

  } catch (err: any) {
    if (err?.code === 11000) {
      return NextResponse.json({
        reply: 'Sorry, that time slot was just booked. Please choose another slot.',
        conflict: true,
      }, { status: 409 });
    }

    const errorText = err?.message || '';
    if (
      err?.status === 429 ||
      err?.code === 'rate_limit_exceeded' ||
      errorText.includes('rate_limit_exceeded') ||
      errorText.includes('Rate limit reached')
    ) {
      const fallbackReply = await localFallbackReply(requestMessages, true);
      return NextResponse.json({
        reply: fallbackReply,
        limited: true,
      });
    }

    console.error('[Chatbot] Error:', err.message);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
