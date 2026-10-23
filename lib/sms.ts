import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const SMS_FROM       = process.env.TWILIO_PHONE_NUMBER!;
const WHATSAPP_FROM  = process.env.TWILIO_WHATSAPP_NUMBER
  ? process.env.TWILIO_WHATSAPP_NUMBER.startsWith('whatsapp:')
    ? process.env.TWILIO_WHATSAPP_NUMBER
    : `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`
  : 'whatsapp:+14155238886';
const CLINIC_PHONE   = '+918310897655';
const CLINIC_NAME    = 'DentalCare Dental Clinic';
const CONTACT_PHONE  = '+918310897655';

export interface SMSData {
  phone:         string;
  patientName:   string;
  doctorName:    string;
  service:       string;
  date:          string;
  timeSlot:      string;
  appointmentId: string;
}

// ── Format phone to E.164 ──────────────────────────────────
export function formatPhone(phone: string): string {
  const trimmed = (phone || '').trim();
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return '';

  if (trimmed.startsWith('+')) {
    if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
    return `+${digits}`;
  }

  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 11 && digits.startsWith('0')) return `+91${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;

  return `+${digits}`;
}

function formatWhatsApp(phone: string): string {
  const normalized = formatPhone(phone);
  return normalized ? `whatsapp:${normalized}` : '';
}

// ── Check if credentials are configured ───────────────────
function isSMSEnabled(): boolean {
  return !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN  &&
    process.env.TWILIO_PHONE_NUMBER &&
    process.env.TWILIO_ACCOUNT_SID !== 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
  );
}

function isWhatsAppEnabled(): boolean {
  return !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_WHATSAPP_NUMBER &&
    process.env.TWILIO_ACCOUNT_SID !== 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
  );
}

// ══════════════════════════════════════════════════════════════
//  SMS MESSAGES
// ══════════════════════════════════════════════════════════════

const buildSMSMessages = {
  booked: (d: SMSData) =>
`${CLINIC_NAME}
Hi ${d.patientName}! Appointment RECEIVED.

Doctor : ${d.doctorName}
Service: ${d.service}
Date   : ${d.date}
Time   : ${d.timeSlot}
Ref ID : #${d.appointmentId.slice(-8).toUpperCase()}

Pending admin confirmation.
Cancel: ${CLINIC_PHONE}`,

  confirmed: (d: SMSData) =>
`${CLINIC_NAME}
Hi ${d.patientName}! Appointment CONFIRMED ✓

Doctor : ${d.doctorName}
Service: ${d.service}
Date   : ${d.date}
Time   : ${d.timeSlot}
Ref ID : #${d.appointmentId.slice(-8).toUpperCase()}

Arrive 10 min early.
Queries: ${CLINIC_PHONE}`,

  cancelled: (d: SMSData) =>
`${CLINIC_NAME}
Hi ${d.patientName}, appointment CANCELLED.

${d.service} on ${d.date} at ${d.timeSlot}
Ref: #${d.appointmentId.slice(-8).toUpperCase()}

Rebook: dentalcare.in/appointment
Call: ${CLINIC_PHONE}`,

  reminder: (d: SMSData) =>
`${CLINIC_NAME} - REMINDER
Hi ${d.patientName}! Appointment TOMORROW.

Doctor : ${d.doctorName}
Time   : ${d.timeSlot}
Service: ${d.service}

Arrive 10 min early.
Cancel: ${CLINIC_PHONE}`,
};

// ══════════════════════════════════════════════════════════════
//  WHATSAPP MESSAGES (Rich formatted)
// ══════════════════════════════════════════════════════════════

const buildWhatsAppMessages = {
  booked: (d: SMSData) =>
`🦷 *${CLINIC_NAME}*

Hello *${d.patientName}*! 👋

Your appointment request has been *received* and is pending admin confirmation.

📋 *Booking Details:*
┌─────────────────────
│ 👨‍⚕️ Doctor  : ${d.doctorName}
│ 🦷 Service : ${d.service}
│ 📅 Date    : ${d.date}
│ 🕐 Time    : ${d.timeSlot}
│ 🎫 Ref ID  : #${d.appointmentId.slice(-8).toUpperCase()}
└─────────────────────

⏳ You will receive another message once confirmed.

📞 Questions? Call us: ${CLINIC_PHONE}
🌐 dentalcare.in`,

  confirmed: (d: SMSData) =>
`🦷 *${CLINIC_NAME}*

Hello *${d.patientName}*! 

✅ *Your appointment is CONFIRMED!*

📋 *Appointment Details:*
┌─────────────────────
│ 👨‍⚕️ Doctor  : ${d.doctorName}
│ 🦷 Service : ${d.service}
│ 📅 Date    : ${d.date}
│ 🕐 Time    : ${d.timeSlot}
│ 🎫 Ref ID  : #${d.appointmentId.slice(-8).toUpperCase()}
└─────────────────────

📌 *Important Reminders:*
- Please arrive *10 minutes early*
- Bring any previous dental records
- Cancellation requires *24 hours notice*

📞 Help: ${CLINIC_PHONE}
🌐 dentalcare.in`,

  cancelled: (d: SMSData) =>
`🦷 *${CLINIC_NAME}*

Hello *${d.patientName}*,

❌ *Your appointment has been cancelled.*

📋 *Cancelled Appointment:*
┌─────────────────────
│ 🦷 Service : ${d.service}
│ 📅 Date    : ${d.date}
│ 🕐 Time    : ${d.timeSlot}
│ 🎫 Ref ID  : #${d.appointmentId.slice(-8).toUpperCase()}
└─────────────────────

Would you like to rebook?
🔗 dentalcare.in/appointment

📞 Call us: ${CLINIC_PHONE}`,

  reminder: (d: SMSData) =>
`🦷 *${CLINIC_NAME}*

⏰ *Appointment Reminder*

Hello *${d.patientName}*! Your appointment is *TOMORROW*.

📋 *Details:*
┌─────────────────────
│ 👨‍⚕️ Doctor  : ${d.doctorName}
│ 🦷 Service : ${d.service}
│ 📅 Date    : ${d.date}
│ 🕐 Time    : ${d.timeSlot}
└─────────────────────

✅ Please arrive 10 minutes early
❌ To cancel: ${CLINIC_PHONE} (24hr notice)

See you tomorrow! 😊`,
};

// ══════════════════════════════════════════════════════════════
//  SEND FUNCTIONS
// ══════════════════════════════════════════════════════════════

type MessageType = 'booked' | 'confirmed' | 'cancelled' | 'reminder';

const buildCleanWhatsAppMessages: Record<MessageType, (d: SMSData) => string> = {
  booked: (d: SMSData) =>
`🦷 *${CLINIC_NAME}*

Hello *${d.patientName}*!

✅ Your appointment request has been received.

📋 *Appointment Details:*
┌─────────────────────
│ 👨‍⚕️ Doctor  : ${d.doctorName}
│ 🦷 Service : ${d.service}
│ 📅 Date    : ${d.date}
│ 🕐 Time    : ${d.timeSlot}
│ 🎫 Ref ID  : #${d.appointmentId.slice(-8).toUpperCase()}
└─────────────────────

⏳ Status: Pending admin confirmation.
You will receive another WhatsApp message once confirmed.

📌 *Important Reminders:*
- Please arrive 10 minutes early
- Bring any previous dental records
- Cancellation requires 24 hours notice

📞 Help: ${CLINIC_PHONE}
🌐 dentalcare.in`,

  confirmed: (d: SMSData) =>
`🦷 *${CLINIC_NAME}*

Hello *${d.patientName}*!

✅ Your appointment is CONFIRMED!

📋 *Appointment Details:*
┌─────────────────────
│ 👨‍⚕️ Doctor  : ${d.doctorName}
│ 🦷 Service : ${d.service}
│ 📅 Date    : ${d.date}
│ 🕐 Time    : ${d.timeSlot}
│ 🎫 Ref ID  : #${d.appointmentId.slice(-8).toUpperCase()}
└─────────────────────

📌 *Important Reminders:*
- Please arrive 10 minutes early
- Bring any previous dental records
- Cancellation requires 24 hours notice

📞 Help: ${CLINIC_PHONE}
🌐 dentalcare.in`,

  cancelled: (d: SMSData) =>
`🦷 *${CLINIC_NAME}*

Hello *${d.patientName}*,

❌ Your appointment has been cancelled.

📋 *Cancelled Appointment:*
┌─────────────────────
│ 👨‍⚕️ Doctor  : ${d.doctorName}
│ 🦷 Service : ${d.service}
│ 📅 Date    : ${d.date}
│ 🕐 Time    : ${d.timeSlot}
│ 🎫 Ref ID  : #${d.appointmentId.slice(-8).toUpperCase()}
└─────────────────────

You can rebook at dentalcare.in/appointment.

📞 Help: ${CLINIC_PHONE}`,

  reminder: (d: SMSData) =>
`🦷 *${CLINIC_NAME}*

⏰ Appointment Reminder

Hello *${d.patientName}*! Your appointment is tomorrow.

📋 *Appointment Details:*
┌─────────────────────
│ 👨‍⚕️ Doctor  : ${d.doctorName}
│ 🦷 Service : ${d.service}
│ 📅 Date    : ${d.date}
│ 🕐 Time    : ${d.timeSlot}
└─────────────────────

📌 Please arrive 10 minutes early.
📞 Help: ${CLINIC_PHONE}`,
};

// ── Send SMS ───────────────────────────────────────────────
async function sendSMS(phone: string, body: string): Promise<{ success: boolean; error?: string }> {
  if (!isSMSEnabled()) {
    console.log('[SMS] Not configured — skipping');
    return { success: false, error: 'SMS not configured' };
  }
  if (!phone) return { success: false, error: 'No phone number' };

  const to = formatPhone(phone);
  if (!to) return { success: false, error: 'Invalid phone number' };

  console.log('[SMS] Sending', { from: SMS_FROM, to, body: body.slice(0, 60) + (body.length > 60 ? '...' : '') });

  try {
    const msg = await client.messages.create({
      body,
      from: SMS_FROM,
      to,
    });
    console.log(`[SMS ✓] Sent to ${to} — SID: ${msg.sid}`);
    return { success: true };
  } catch (e: any) {
    console.error(`[SMS ✗] Failed to send to ${to}:`, e);
    return { success: false, error: e?.message || String(e) };
  }
}

// ── Send WhatsApp ──────────────────────────────────────────
async function sendWhatsApp(phone: string, body: string): Promise<{ success: boolean; error?: string }> {
  if (!isWhatsAppEnabled()) {
    console.log('[WhatsApp] Not configured — skipping');
    return { success: false, error: 'WhatsApp not configured' };
  }
  if (!phone) return { success: false, error: 'No phone number' };

  const to = formatWhatsApp(phone);
  if (!to) return { success: false, error: 'Invalid phone number' };

  console.log('[WhatsApp] Sending', { from: WHATSAPP_FROM, to, body: body.slice(0, 60) + (body.length > 60 ? '...' : '') });

  try {
    const msg = await client.messages.create({
      body,
      from: WHATSAPP_FROM,
      to,
    });
    console.log(`[WhatsApp ✓] Sent to ${to} — SID: ${msg.sid}`);
    return { success: true };
  } catch (e: any) {
    console.error(`[WhatsApp ✗] Failed to send to ${to}:`, e);
    return { success: false, error: e?.message || String(e) };
  }
}

// ══════════════════════════════════════════════════════════════
//  PUBLIC EXPORTS — One function per event type
// ══════════════════════════════════════════════════════════════

export async function sendAppointmentBookedSMS(data: SMSData) {
  return sendSMS(data.phone, buildSMSMessages.booked(data));
}
export async function sendAppointmentConfirmedSMS(data: SMSData) {
  return sendSMS(data.phone, buildSMSMessages.confirmed(data));
}
export async function sendAppointmentCancelledSMS(data: SMSData) {
  return sendSMS(data.phone, buildSMSMessages.cancelled(data));
}
export async function sendAppointmentReminderSMS(data: SMSData) {
  return sendSMS(data.phone, buildSMSMessages.reminder(data));
}

export async function sendAppointmentBookedWhatsApp(data: SMSData) {
  return sendWhatsApp(data.phone, buildCleanWhatsAppMessages.booked(data));
}
export async function sendAppointmentConfirmedWhatsApp(data: SMSData) {
  return sendWhatsApp(data.phone, buildCleanWhatsAppMessages.confirmed(data));
}
export async function sendAppointmentCancelledWhatsApp(data: SMSData) {
  return sendWhatsApp(data.phone, buildCleanWhatsAppMessages.cancelled(data));
}
export async function sendAppointmentReminderWhatsApp(data: SMSData) {
  return sendWhatsApp(data.phone, buildCleanWhatsAppMessages.reminder(data));
}

// ── Generic dispatcher ─────────────────────────────────────
export async function sendSMSNotification(type: MessageType, data: SMSData) {
  return sendSMS(data.phone, buildSMSMessages[type](data));
}

export async function sendWhatsAppNotification(type: MessageType, data: SMSData) {
  return sendWhatsApp(data.phone, buildCleanWhatsAppMessages[type](data));
}

export async function sendContactFormSMS(name: string, email: string, phone: string, message: string) {
  const body = `${CLINIC_NAME} - New contact form message

Name: ${name}
Email: ${email || 'Not provided'}
Phone: ${phone || 'Not provided'}

Message:
${message}`;

  return sendSMS(CONTACT_PHONE, body);
}
