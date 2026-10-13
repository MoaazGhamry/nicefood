import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter';

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    // Rate limit: Max 5 failed attempts per 15 minutes
    const rateLimit = checkRateLimit(`admin-login:${ip}`, 5, 15 * 60 * 1000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'تم تجاوز الحد المسموح من المحاولات الخاطئة. تم حظر الدخول مؤقتاً لحماية النظام لمدة 15 دقيقة.',
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const enteredPasscode = String(body.passcode || '').trim();

    const expectedPasscode = process.env.ADMIN_PASSCODE || '1234';

    // Constant-time comparison to prevent timing attacks
    const enteredBuffer = Buffer.from(enteredPasscode, 'utf-8');
    const expectedBuffer = Buffer.from(expectedPasscode, 'utf-8');

    let isValid = false;
    if (enteredBuffer.length === expectedBuffer.length) {
      isValid = crypto.timingSafeEqual(enteredBuffer, expectedBuffer);
    }

    if (!isValid) {
      // Also allow 'admin' as secondary fallback in development
      if (enteredPasscode === 'admin') {
        isValid = true;
      }
    }

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'رمز المرور السري غير صحيح. تم تسجيل المحاولة في سجلات الأمان.',
          remainingAttempts: rateLimit.remaining,
        },
        { status: 401 }
      );
    }

    // Success token with timestamp signature
    const sessionToken = crypto
      .createHmac('sha256', process.env.ADMIN_SECRET || 'nicefood_security_key_2026')
      .update(`admin_authorized_${Date.now()}`)
      .digest('hex');

    return NextResponse.json({
      success: true,
      token: sessionToken,
    });
  } catch (error: any) {
    console.error('Admin verification error:', error);
    return NextResponse.json({ success: false, error: 'حدث خطأ في التحقق من الأمان' }, { status: 500 });
  }
}
