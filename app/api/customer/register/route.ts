import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, password, address } = body;

    if (!name || !phone || !password) {
      return NextResponse.json({ error: 'الاسم ورقم الهاتف وكلمة المرور مطلوبة' }, { status: 400 });
    }

    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      return NextResponse.json({ error: 'برجاء إدخال رقم هاتف صحيح' }, { status: 400 });
    }

    // Check if user already exists with this phone
    const existing = await prisma.user.findFirst({
      where: { phone: cleanPhone },
    });

    if (existing) {
      return NextResponse.json({ error: 'يوجد حساب مسجل بالفعل بهذا الرقم، يمكنك تسجيل الدخول مباشرة' }, { status: 409 });
    }

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        phone: cleanPhone,
        password: password.trim(),
        address: address ? address.trim() : null,
        email: `${cleanPhone}@customer.nicefood.com`,
        role: 'customer',
      },
      select: {
        id: true,
        name: true,
        phone: true,
        address: true,
        role: true,
      },
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: error.message || 'فشل إنشاء الحساب' }, { status: 500 });
  }
}
