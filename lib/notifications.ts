import {
  sendAppointmentBookedEmail,
  sendAppointmentConfirmedEmail,
  sendAppointmentCancelledEmail,
  sendAppointmentReminderEmail,
} from './email';

import {
  sendSMSNotification,
  sendWhatsAppNotification,
} from './sms';

import { connectDB }   from './mongodb';
import Notification    from '@/models/Notification';

export interface NotifyPayload {
  appointmentId:  string;
  patientName:    string;
  patientEmail?:  string;
  patientPhone?:  string;
  patientUserId?: string;
  doctorName:     string;
  service:        string;
  date:           string;
  timeSlot:       string;
}

export type NotifyType = 'booked' | 'confirmed' | 'cancelled' | 'reminder';

const TITLE_MAP: Record<NotifyType, string> = {
  booked:    'Appointment Booked',
  confirmed: 'Appointment Confirmed',
  cancelled: 'Appointment Cancelled',
  reminder:  'Appointment Reminder',
};

function buildMessage(type: NotifyType, p: NotifyPayload): string {
  switch (type) {
    case 'booked':
      return `Your ${p.service} appointment with ${p.doctorName} on ${p.date} at ${p.timeSlot} has been received and is pending confirmation.`;
    case 'confirmed':
      return `Your appointment on ${p.date} at ${p.timeSlot} with ${p.doctorName} has been confirmed.`;
    case 'cancelled':
      return `Your appointment on ${p.date} at ${p.timeSlot} has been cancelled. Please contact us to rebook.`;
    case 'reminder':
      return `Reminder: You have an appointment tomorrow at ${p.timeSlot} with ${p.doctorName} for ${p.service}.`;
  }
}

export async function notifyAppointment(type: NotifyType, payload: NotifyPayload) {
  const results = {
    email:    null as any,
    sms:      null as any,
    whatsapp: null as any,
    db:       null as any,
  };

  // ── Check which channels are configured ─────────────────
  const emailEnabled = !!(
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASS &&
    process.env.EMAIL_USER !== 'your_gmail@gmail.com'
  );

  const smsEnabled = !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN  &&
    process.env.TWILIO_PHONE_NUMBER &&
    process.env.TWILIO_ACCOUNT_SID !== 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
  );

  const whatsappEnabled = !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_WHATSAPP_NUMBER &&
    process.env.TWILIO_ACCOUNT_SID !== 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
  );

  console.log('[Notify] type=', type,
    'emailEnabled=', emailEnabled,
    'smsEnabled=', smsEnabled,
    'whatsappEnabled=', whatsappEnabled,
    'patientEmail=', payload.patientEmail,
    'patientPhone=', payload.patientPhone);

  const emailData = {
    patientName:   payload.patientName,
    patientEmail:  payload.patientEmail || '',
    doctorName:    payload.doctorName,
    service:       payload.service,
    date:          payload.date,
    timeSlot:      payload.timeSlot,
    appointmentId: payload.appointmentId,
  };

  const smsData = {
    phone:         payload.patientPhone || '',
    patientName:   payload.patientName,
    doctorName:    payload.doctorName,
    service:       payload.service,
    date:          payload.date,
    timeSlot:      payload.timeSlot,
    appointmentId: payload.appointmentId,
  };

  // ── Launch all 3 channels in parallel ───────────────────
  const tasks: Promise<void>[] = [];

  // 1. EMAIL
  if (emailEnabled && payload.patientEmail) {
    const emailFn =
      type === 'booked'    ? sendAppointmentBookedEmail    :
      type === 'confirmed' ? sendAppointmentConfirmedEmail :
      type === 'cancelled' ? sendAppointmentCancelledEmail :
                             sendAppointmentReminderEmail;

    tasks.push(
      emailFn(emailData)
        .then(r  => { results.email = r; })
        .catch(e => {
          results.email = { success: false, error: e.message };
          console.error('[Email error]', e.message);
        })
    );
  } else {
    results.email = {
      success: false,
      error: !emailEnabled ? 'Email not configured' : 'No email address',
    };
  }

  // 2. SMS
  if (smsEnabled && payload.patientPhone) {
    tasks.push(
      sendSMSNotification(type, smsData)
        .then(r  => { results.sms = r; })
        .catch(e => {
          results.sms = { success: false, error: e.message };
          console.error('[SMS error]', e.message);
        })
    );
  } else {
    results.sms = {
      success: false,
      error: !smsEnabled ? 'SMS not configured' : 'No phone number',
    };
  }

  // 3. WHATSAPP
  if (whatsappEnabled && payload.patientPhone) {
    tasks.push(
      sendWhatsAppNotification(type, smsData)
        .then(r  => { results.whatsapp = r; })
        .catch(e => {
          results.whatsapp = { success: false, error: e.message };
          console.error('[WhatsApp error]', e.message);
        })
    );
  } else {
    results.whatsapp = {
      success: false,
      error: !whatsappEnabled ? 'WhatsApp not configured' : 'No phone number',
    };
  }

  // Wait for all channels
  await Promise.all(tasks);

  console.log('[Notify debug] results=', JSON.stringify({
    email: results.email,
    sms: results.sms,
    whatsapp: results.whatsapp,
  }, null, 2));

  // ── Save in-app notification to DB ──────────────────────
  try {
    await connectDB();
    results.db = await Notification.create({
      userId:  payload.patientUserId,
      title:   TITLE_MAP[type],
      message: buildMessage(type, payload),
      type:    'appointment',
    });
  } catch (e: any) {
    console.error('[DB notification error]', e.message);
  }

  // ── Log results ─────────────────────────────────────────
  console.log(
    `[Notify:${type}] ` +
    `email=${results.email?.success     ? '✓' : '✗'} | ` +
    `sms=${results.sms?.success         ? '✓' : '✗'} | ` +
    `whatsapp=${results.whatsapp?.success ? '✓' : '✗'} | ` +
    `db=${results.db?._id               ? '✓' : '✗'}`
  );

  return results;
}
