import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Check Twilio credentials
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

    console.log('[Test WhatsApp] Config:', {
      accountSid: accountSid ? '***' + accountSid.slice(-4) : 'MISSING',
      authToken: authToken ? '***' + authToken.slice(-4) : 'MISSING',
      whatsappNumber: whatsappNumber || 'MISSING',
    });

    if (!accountSid || !authToken || !whatsappNumber) {
      return NextResponse.json(
        {
          error: 'Twilio WhatsApp credentials not configured',
          config: {
            accountSid: !accountSid ? 'MISSING' : 'SET',
            authToken: !authToken ? 'MISSING' : 'SET',
            whatsappNumber: !whatsappNumber ? 'MISSING' : 'SET',
          },
        },
        { status: 500 }
      );
    }

    const client = twilio(accountSid, authToken);

    // Normalize phone
    const cleanedPhone = phone.replace(/\D/g, '');
    const formattedPhone =
      cleanedPhone.length === 10
        ? `+91${cleanedPhone}`
        : cleanedPhone.length === 12 && cleanedPhone.startsWith('91')
        ? `+${cleanedPhone}`
        : `+${cleanedPhone}`;

    const recipientWhatsApp = `whatsapp:${formattedPhone}`;

    console.log('[Test WhatsApp] Sending to:', {
      from: whatsappNumber,
      to: recipientWhatsApp,
      body: 'Test message from DentalCare booking system',
    });

    const message = await client.messages.create({
      body: '🦷 **Test Message from DentalCare**\n\nThis is a test WhatsApp message from your dental clinic booking system.\n\nIf you received this, WhatsApp notifications are working! ✅',
      from: whatsappNumber,
      to: recipientWhatsApp,
    });

    console.log('[Test WhatsApp] ✅ Success! SID:', message.sid);

    return NextResponse.json({
      success: true,
      message: 'Test WhatsApp message sent successfully!',
      sid: message.sid,
      details: {
        from: whatsappNumber,
        to: recipientWhatsApp,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error('[Test WhatsApp] ❌ Error:', err);
    return NextResponse.json(
      {
        error: err.message || 'Failed to send test WhatsApp message',
        code: err.code,
        details: err.toString(),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST a phone number to test WhatsApp',
    example: {
      method: 'POST',
      url: '/api/test/whatsapp',
      body: { phone: '9198765XXXXX' },
    },
  });
}
