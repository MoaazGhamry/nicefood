import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const phone = searchParams.get('phone');

    if (!userId && !phone) {
      return NextResponse.json({ error: 'مطلوب معرف المستخدم أو رقم الهاتف' }, { status: 400 });
    }

    const cleanPhone = phone ? phone.trim().replace(/[^0-9]/g, '') : null;

    // Build resilient query matching either userId or phone number variations
    const whereConditions: any[] = [];
    if (userId) {
      whereConditions.push({ userId });
    }
    if (cleanPhone) {
      whereConditions.push({ customerPhone: cleanPhone });
      // In case stored with leading 0 or without
      if (cleanPhone.startsWith('0')) {
        whereConditions.push({ customerPhone: cleanPhone.substring(1) });
      } else {
        whereConditions.push({ customerPhone: '0' + cleanPhone });
      }
    }

    const orders = await prisma.order.findMany({
      where: {
        OR: whereConditions,
      },
      include: {
        items: {
          include: {
            product: {
              include: { brand: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    console.error('Error fetching customer orders:', error);
    return NextResponse.json({ error: 'فشل تحميل الطلبات' }, { status: 500 });
  }
}
