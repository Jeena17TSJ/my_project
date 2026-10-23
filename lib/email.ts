import nodemailer from 'nodemailer';

const CLINIC_EMAIL = process.env.CLINIC_EMAIL || 'info@dentalcare.in';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export interface AppointmentEmailData {
  patientName: string;
  patientEmail: string;
  doctorName: string;
  service: string;
  date: string;
  timeSlot: string;
  appointmentId: string;
  clinicPhone?: string;
  status?: string;
}

// -- Beautiful HTML email template --------------------------
function buildAppointmentEmailHTML(data: AppointmentEmailData, type: 'booked' | 'confirmed' | 'cancelled' | 'reminder'): string {
  const configs = {
    booked: {
      headerColor: '#2563eb',
      icon: '',
      title: 'Appointment Booked!',
      subtitle: 'Your appointment has been successfully scheduled.',
      badgeColor: '#dbeafe',
      badgeText: '#1e40af',
      badge: 'PENDING CONFIRMATION',
    },
    confirmed: {
      headerColor: '#16a34a',
      icon: '',
      title: 'Appointment Confirmed!',
      subtitle: 'Your appointment has been confirmed by our team.',
      badgeColor: '#dcfce7',
      badgeText: '#166534',
      badge: 'CONFIRMED',
    },
    cancelled: {
      headerColor: '#dc2626',
      icon: '',
      title: 'Appointment Cancelled',
      subtitle: 'Your appointment has been cancelled.',
      badgeColor: '#fee2e2',
      badgeText: '#991b1b',
      badge: 'CANCELLED',
    },
    reminder: {
      headerColor: '#d97706',
      icon: '',
      title: 'Appointment Reminder',
      subtitle: 'This is a reminder for your upcoming appointment tomorrow.',
      badgeColor: '#fef3c7',
      badgeText: '#92400e',
      badge: 'REMINDER',
    },
  };

  const c = configs[type];

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>DentalCare - ${c.title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:${c.headerColor};padding:40px 32px;text-align:center;">
            <div style="font-size:48px;margin-bottom:12px;">${c.icon}</div>
            <div style="color:#ffffff;font-size:10px;font-weight:700;letter-spacing:3px;margin-bottom:8px;opacity:0.8;">DENTALCARE DENTAL CLINIC</div>
            <h1 style="color:#ffffff;font-size:28px;font-weight:700;margin:0 0 8px;">${c.title}</h1>
            <p style="color:#ffffff;font-size:15px;margin:0;opacity:0.9;">${c.subtitle}</p>
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style="padding:32px 40px 0;">
            <p style="color:#374151;font-size:16px;margin:0 0 8px;">Dear <strong>${data.patientName}</strong>,</p>
            <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0;">
              ${type === 'booked' ? 'Thank you for choosing DentalCare Dental Clinic. Here are your appointment details:' :
                type === 'confirmed' ? 'Great news! Your appointment has been confirmed. Please find your appointment details below:' :
                type === 'cancelled' ? 'We\'re sorry to inform you that your appointment has been cancelled. Please contact us to reschedule.' :
                'This is a friendly reminder about your appointment scheduled for tomorrow.'}
            </p>
          </td>
        </tr>

        <!-- Appointment Details Card -->
        <tr>
          <td style="padding:24px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
              <tr>
                <td style="padding:20px 24px;border-bottom:1px solid #e2e8f0;">
                  <span style="display:inline-block;background:${c.badgeColor};color:${c.badgeText};font-size:11px;font-weight:700;letter-spacing:1px;padding:4px 12px;border-radius:20px;">${c.badge}</span>
                </td>
              </tr>
              ${[
                { icon: '', label: 'Patient Name', value: data.patientName },
                { icon: '', label: 'Doctor', value: data.doctorName },
                { icon: '', label: 'Service', value: data.service },
                { icon: '', label: 'Date', value: data.date },
                { icon: '', label: 'Time', value: data.timeSlot },
                { icon: '', label: 'Appointment ID', value: `#${data.appointmentId.slice(-8).toUpperCase()}` },
              ].map(row => `
              <tr>
                <td style="padding:14px 24px;border-bottom:1px solid #f1f5f9;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="28" style="font-size:18px;vertical-align:middle;">${row.icon}</td>
                      <td style="color:#6b7280;font-size:13px;padding-left:8px;vertical-align:middle;">${row.label}</td>
                      <td style="color:#111827;font-size:14px;font-weight:600;text-align:right;vertical-align:middle;">${row.value}</td>
                    </tr>
                  </table>
                </td>
              </tr>`).join('')}
            </table>
          </td>
        </tr>

        ${type === 'booked' || type === 'confirmed' ? `
        <!-- Reminder Box -->
        <tr>
          <td style="padding:0 40px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border-radius:12px;border-left:4px solid #2563eb;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="color:#1e40af;font-size:13px;font-weight:600;margin:0 0 6px;">Important Reminders</p>
                  <ul style="color:#3b82f6;font-size:12px;margin:0;padding-left:16px;line-height:1.8;">
                    <li>Please arrive 10 minutes before your appointment</li>
                    <li>Bring any previous dental records if available</li>
                    <li>To cancel, contact us at least 24 hours in advance</li>
                    <li>Carry a valid ID and insurance card (if applicable)</li>
                  </ul>
                </td>
              </tr>
            </table>
          </td>
        </tr>` : ''}

        <!-- CTA Button -->
        <tr>
          <td style="padding:0 40px 32px;text-align:center;">
            <a href="${process.env.NEXTAUTH_URL}/appointment"
               style="display:inline-block;background:${c.headerColor};color:#ffffff;font-size:15px;font-weight:600;padding:14px 36px;border-radius:50px;text-decoration:none;letter-spacing:0.3px;">
              ${type === 'cancelled' ? 'Book New Appointment' : 'View Appointment'}
            </a>
          </td>
        </tr>

        <!-- Divider -->
        <tr><td style="padding:0 40px;"><hr style="border:none;border-top:1px solid #e5e7eb;"/></td></tr>

        <!-- Contact Info -->
        <tr>
          <td style="padding:24px 40px;text-align:center;">
            <p style="color:#374151;font-size:14px;font-weight:600;margin:0 0 12px;">Need Help? Contact Us</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding:4px;">
                  <span style="color:#6b7280;font-size:13px;">+91-80-1234-5678</span>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding:4px;">
                  <span style="color:#6b7280;font-size:13px;">info@dentalcare.in</span>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding:4px;">
                  <span style="color:#6b7280;font-size:13px;">123 Health Street, Koramangala, Bengaluru 560034</span>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding:4px;">
                  <span style="color:#6b7280;font-size:13px;">Mon-Sat: 9AM-7PM | Sunday: 10AM-2PM</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="color:#9ca3af;font-size:12px;margin:0 0 4px;">(c) 2024 DentalCare Dental Clinic. All rights reserved.</p>
            <p style="color:#9ca3af;font-size:11px;margin:0;">This is an automated email. Please do not reply directly.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// -- Email sending functions ---------------------------------
export async function sendAppointmentBookedEmail(data: AppointmentEmailData) {
  if (!data.patientEmail) return { success: false, error: 'No email provided' };
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: data.patientEmail,
      subject: `Appointment Booked - DentalCare Dental Clinic (#${data.appointmentId.slice(-8).toUpperCase()})`,
      html: buildAppointmentEmailHTML(data, 'booked'),
    });
    // Also send clinic admin notification
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: CLINIC_EMAIL,
      subject: `New Appointment: ${data.patientName} - ${data.date} at ${data.timeSlot}`,
      html: buildAppointmentEmailHTML(data, 'booked'),
    });
    return { success: true };
  } catch (error: any) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
}

export async function sendAppointmentConfirmedEmail(data: AppointmentEmailData) {
  if (!data.patientEmail) return { success: false, error: 'No email provided' };
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: data.patientEmail,
      subject: `Appointment Confirmed - DentalCare (#${data.appointmentId.slice(-8).toUpperCase()})`,
      html: buildAppointmentEmailHTML(data, 'confirmed'),
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function sendAppointmentCancelledEmail(data: AppointmentEmailData) {
  if (!data.patientEmail) return { success: false, error: 'No email provided' };
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: data.patientEmail,
      subject: `Appointment Cancelled - DentalCare (#${data.appointmentId.slice(-8).toUpperCase()})`,
      html: buildAppointmentEmailHTML(data, 'cancelled'),
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function sendAppointmentReminderEmail(data: AppointmentEmailData) {
  if (!data.patientEmail) return { success: false, error: 'No email provided' };
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: data.patientEmail,
      subject: `Reminder: Appointment Tomorrow - DentalCare (#${data.appointmentId.slice(-8).toUpperCase()})`,
      html: buildAppointmentEmailHTML(data, 'reminder'),
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function sendContactFormEmail(name: string, email: string, phone: string, message: string) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_USER!,
      subject: `New Contact Form Message from ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;background:#f9fafb;padding:24px;border-radius:12px;">
          <h2 style="color:#1e3a8a;">New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          <p><strong>Message:</strong></p>
          <div style="background:#fff;padding:16px;border-radius:8px;border:1px solid #e5e7eb;">${message}</div>
        </div>`,
    });
    // Auto-reply to sender
    if (email) {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'We received your message - DentalCare Dental',
        html: `
          <div style="font-family:sans-serif;max-width:500px;margin:0 auto;background:#eff6ff;padding:24px;border-radius:12px;">
            <h2 style="color:#1e3a8a;">Thanks for reaching out, ${name}!</h2>
            <p style="color:#374151;">We have received your message and will get back to you within 24 hours.</p>
            <p style="color:#374151;">For urgent queries: <strong>+91 83108 97655</strong></p>
            <p style="color:#6b7280;font-size:12px;margin-top:24px;">DentalCare Dental Clinic, 123 Health Street, Bengaluru</p>
          </div>`,
      });
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
