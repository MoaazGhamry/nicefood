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
      userId,
    } = body;

    if (!customerName || !customerPhone || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required order details' }, { status: 400 });
    }

    // 1. Resiliently resolve products against DB to guarantee valid foreign keys
    const validProducts = await prisma.product.findMany();
    const productMap = new Map(validProducts.map((p) => [p.id, p]));

    const validOrderItems = items
      .map((item: any) => {
        let matchedProduct = productMap.get(item.id);
        if (!matchedProduct) {
          matchedProduct = validProducts.find(
            (p) => p.nameAr === item.nameAr || p.name === item.name
          );
        }
        if (!matchedProduct && validProducts.length > 0) {
          matchedProduct = validProducts[0];
        }
        if (!matchedProduct) return null;

        const price = item.offerPrice || item.price || matchedProduct.offerPrice || matchedProduct.price;
        const quantity = Math.max(1, parseInt(item.quantity) || 1);
        return {
          productId: matchedProduct.id,
          quantity,
          price,
          total: price * quantity,
        };
      })
      .filter((x: any): x is { productId: string; quantity: number; price: number; total: number } => x !== null);

    if (validOrderItems.length === 0) {
      return NextResponse.json({ error: 'لم يتم العثور على المنتجات المطلوبة' }, { status: 400 });
    }

    const nameParts = customerName.trim().split(' ');
    const firstName = nameParts[0] || 'Customer';
    const lastName = nameParts.slice(1).join(' ') || 'NiceFood';

    const deliveryCode = Math.floor(1000 + Math.random() * 9000).toString();

    const order = await prisma.order.create({
      data: {
        customerName,
        customerPhone,
        customerAddress,
        userId: userId || null,
        deliveryCode,
        customerLat: customerLat ? parseFloat(customerLat) : null,
        customerLng: customerLng ? parseFloat(customerLng) : null,
        paymentMethod: 'paymob_visa',
        paymentStatus: 'pending',
        orderStatus: 'pending',
        deliveryTime: deliveryTime || 'أسرع وقت ممكن',
        notes: notes || '',
        total: parseFloat(total) || 0,
        items: {
          create: validOrderItems,
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

    // Store payment token on order while keeping status pending
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymobOrderId: paymobRes.token,
        paymentStatus: 'pending',
        orderStatus: 'pending',
      },
    });

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
