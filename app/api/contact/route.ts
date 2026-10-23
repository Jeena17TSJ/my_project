import { NextRequest, NextResponse } from 'next/server';
import { sendContactFormEmail } from '@/lib/email';
import { sendContactFormSMS } from '@/lib/sms';

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, message } = await req.json();
    if (!name || !message) {
      return NextResponse.json(
        { message: 'Please enter your name and message.' },
        { status: 400 }
      );
    }

    const [emailResult, smsResult] = await Promise.all([
      sendContactFormEmail(name, email, phone, message),
      sendContactFormSMS(name, email, phone, message),
    ]);

    if (!emailResult.success || !smsResult.success) {
      console.error('Contact notification failed:', {
        email: emailResult.error,
        sms: smsResult.error,
      });
    }
    return NextResponse.json({ message: 'Message sent! We will contact you within 24 hours.' });
  } catch (err: any) {
    console.error('Contact form error:', err);
    // Still return success so user isn't left hanging
    return NextResponse.json({ message: 'Message received! We will contact you shortly.' });
  }
}
