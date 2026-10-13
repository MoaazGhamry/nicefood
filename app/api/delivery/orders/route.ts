import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const driverId = searchParams.get('driverId');

    // Fetch active delivery orders
    const orders = await prisma.order.findMany({
      where: {
        orderStatus: {
          in: ['confirmed', 'preparing', 'delivering', 'delivered'],
        },
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
      take: 50,
    });

    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    console.error('Error fetching delivery orders:', error);
    return NextResponse.json({ error: 'فشل تحميل طلبات التوصيل' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { orderId, action, driverId, driverName, driverPhone, deliveryCode } = body;

    if (!orderId || !action) {
      return NextResponse.json({ error: 'بيانات غير مكتملة' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });
    }

    // 1. Action: Driver takes the order for delivery
    if (action === 'take_order') {
      const updated = await prisma.order.update({
        where: { id: orderId },
        data: {
          orderStatus: 'delivering',
          driverId: driverId || null,
          driverName: driverName || 'مندوب التوصيل',
          driverPhone: driverPhone || null,
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
      });

      return NextResponse.json({ success: true, order: updated });
    }

    // 2. Action: Driver confirms delivery via Customer Delivery Code (OTP)
    if (action === 'confirm_delivery') {
      if (!deliveryCode) {
        return NextResponse.json(
          { error: 'يرجى إدخال كود التسليم الذي استلمته من العميل' },
          { status: 400 }
        );
      }

      const inputCode = String(deliveryCode).trim().toUpperCase();
      const validCode = order.deliveryCode ? order.deliveryCode.trim().toUpperCase() : order.id.slice(-4).toUpperCase();

      if (inputCode !== validCode) {
        return NextResponse.json(
          { error: 'كود التسليم غير صحيح! اطلب من العميل إعطائك كود الاستلام الظاهر في شاشته' },
          { status: 400 }
        );
      }

      // Mark order as delivered and update payment status to paid if cash
      const updateData: any = {
        orderStatus: 'delivered',
      };
      if (order.paymentMethod === 'cash') {
        updateData.paymentStatus = 'paid';
      }

      const updated = await prisma.order.update({
        where: { id: orderId },
        data: updateData,
        include: {
          items: {
            include: {
              product: {
                include: { brand: true },
              },
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        order: updated,
        message: 'تم تأكيد تسليم الطلب للعميل بنجاح! شكراً لك كابتن 🛵',
      });
    }

    return NextResponse.json({ error: 'إجراء غير معروف' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating delivery order:', error);
    return NextResponse.json({ error: error.message || 'فشل تحديث الطلب' }, { status: 500 });
  }
}
