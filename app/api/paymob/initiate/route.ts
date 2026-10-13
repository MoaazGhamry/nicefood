import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { initiatePaymobPayment } from '@/lib/paymob';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      customerName,
      customerPhone,
      customerAddress,
      customerLat,
      customerLng,
      deliveryTime,
      notes,
      items,
      total,
    } = body;

    if (!customerName || !customerPhone || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required order details' }, { status: 400 });
    }

    // 1. Create order in DB with pending payment
    const nameParts = customerName.trim().split(' ');
    const firstName = nameParts[0] || 'Customer';
    const lastName = nameParts.slice(1).join(' ') || 'NiceFood';

    const order = await prisma.order.create({
      data: {
        customerName,
        customerPhone,
        customerAddress,
        customerLat: customerLat ? parseFloat(customerLat) : null,
        customerLng: customerLng ? parseFloat(customerLng) : null,
        paymentMethod: 'paymob_visa',
        paymentStatus: 'pending',
        orderStatus: 'pending',
        deliveryTime: deliveryTime || 'أسرع وقت ممكن',
        notes: notes || '',
        total: parseFloat(total) || 0,
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.offerPrice || item.price,
            total: (item.offerPrice || item.price) * item.quantity,
          })),
        },
      },
    });

    // 2. Initiate Paymob Payment
    const paymobRes = await initiatePaymobPayment({
      amountEgp: parseFloat(total) || 0,
      orderId: order.id,
      billingData: {
        first_name: firstName,
        last_name: lastName,
        email: `${customerPhone}@nicefood.customer`,
        phone_number: customerPhone,
        street: customerAddress,
        city: 'العاشر من رمضان',
        country: 'EG',
      },
    });

    // If sandbox / immediate test, mark paid
    if (paymobRes.isSandbox) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'paid',
          paymobOrderId: paymobRes.token,
        },
      });
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      paymentUrl: paymobRes.paymentUrl,
      token: paymobRes.token,
      isSandbox: paymobRes.isSandbox,
    });
  } catch (error: any) {
    console.error('Paymob initiation error:', error);
    return NextResponse.json({ error: error.message || 'Payment initiation failed' }, { status: 500 });
  }
}
