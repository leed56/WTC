import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      phone,
      clientName,
      reportNumber,
      variety,
      species,
      weight,
      treatment,
      refractiveIndex,
      specificGravity,
      verifyUrl,
      reportFormat,
      apiEndpoint,
      apiKey,
      deviceId,
      customMessage
    } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Recipient WhatsApp phone number is required.' },
        { status: 400 }
      );
    }

    // Normalize phone to international digits (e.g., +94771234567 -> 94771234567)
    const cleanPhone = String(phone).replace(/[^0-9+]/g, '');
    const digitsOnly = cleanPhone.replace(/^\+/, '');

    // Construct official WTC Gem Lab WhatsApp Verification Message
    const messageText =
      customMessage ||
      `*WTC GEM LAB — OFFICIAL GEMOLOGICAL REPORT*\n` +
        `— GEMOLOGICAL LABORATORY —\n\n` +
        `${clientName ? `Dear *${clientName}*,\n` : ''}Your gemstone identification report has been officially issued and registered.\n\n` +
        `• *Report No:* ${reportNumber}\n` +
        `• *Format:* ${reportFormat || 'Official Report'}\n` +
        `• *Identification:* ${variety} (${species})\n` +
        `• *Weight:* ${weight}\n` +
        `• *Treatment Status:* ${treatment}\n` +
        `${refractiveIndex ? `• *Refractive Index:* ${refractiveIndex}\n` : ''}` +
        `${specificGravity ? `• *Specific Gravity:* ${specificGravity}\n` : ''}\n` +
        `*Online Digital Registry Verification:*\n` +
        `${verifyUrl}\n\n` +
        `_World Trade Center, No 26, 5th Floor, Colombo 01, Sri Lanka_`;

    // Resolve Wassapi / Wassenger credentials from request or environment
    const resolvedKey = apiKey || process.env.WASSAPI_API_KEY || process.env.WASSENGER_API_KEY || '';
    const resolvedEndpoint =
      apiEndpoint ||
      process.env.WASSAPI_ENDPOINT ||
      'https://api.wassenger.com/v1/messages';
    const resolvedDevice = deviceId || process.env.WASSAPI_DEVICE_ID || '';

    // If staff configured a live Wassapi / Wassenger API key, dispatch HTTP POST
    if (resolvedKey && resolvedKey.trim().length > 5) {
      const payload: Record<string, any> = {
        phone: cleanPhone.startsWith('+') ? cleanPhone : `+${digitsOnly}`,
        to: digitsOnly,
        chatId: `${digitsOnly}@c.us`,
        message: messageText,
        body: messageText
      };

      if (resolvedDevice) {
        payload.device = resolvedDevice;
        payload.instance_id = resolvedDevice;
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Token: resolvedKey.trim(),
        Authorization: `Bearer ${resolvedKey.trim()}`,
        'x-api-key': resolvedKey.trim()
      };

      const response = await fetch(resolvedEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        return NextResponse.json(
          {
            success: false,
            mode: 'wassapi-live',
            status: response.status,
            error:
              responseData?.message ||
              responseData?.error ||
              `Wassapi gateway returned HTTP ${response.status}`,
            waDirectUrl: `https://wa.me/${digitsOnly}?text=${encodeURIComponent(messageText)}`
          },
          { status: 502 }
        );
      }

      return NextResponse.json({
        success: true,
        mode: 'wassapi-live',
        providerResponse: responseData,
        recipient: `+${digitsOnly}`,
        messagePreview: messageText,
        waDirectUrl: `https://wa.me/${digitsOnly}?text=${encodeURIComponent(messageText)}`
      });
    }

    // If no API key is configured yet, return simulated Wassapi success + direct wa.me deep link
    return NextResponse.json({
      success: true,
      mode: 'wassapi-gateway-ready',
      recipient: `+${digitsOnly}`,
      messagePreview: messageText,
      waDirectUrl: `https://wa.me/${digitsOnly}?text=${encodeURIComponent(messageText)}`,
      notice:
        'Report formatted for Wassapi / WhatsApp delivery. Configure your live Wassapi API Token in Settings for background auto-dispatch, or use the 1-Click WhatsApp Launch.'
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Unexpected error in WhatsApp API dispatch.'
      },
      { status: 500 }
    );
  }
}
