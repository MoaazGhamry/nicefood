import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, password } = body;

    if (!phone || !password) {
      return NextResponse.json({ error: 'رقم الهاتف وكلمة المرور مطلوبان' }, { status: 400 });
    }

    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: cleanPhone },
          { email: `${cleanPhone}@nicefood.com` },
        ],
      },
    });

    if (!user || user.password !== password.trim()) {
      return NextResponse.json({ error: 'بيانات الدخول غير صحيحة' }, { status: 401 });
    }

    if (user.role !== 'delivery' && user.role !== 'admin' && user.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'هذا الحساب ليس مسجلاً كمندوب توصيل. يرجى التواصل مع إدارة نايس فود.' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      driver: {
        id: user.id,
        name: user.name,
        phone: user.phone || cleanPhone,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Driver login error:', error);
    return NextResponse.json({ error: error.message || 'فشل تسجيل الدخول' }, { status: 500 });
  }
}
