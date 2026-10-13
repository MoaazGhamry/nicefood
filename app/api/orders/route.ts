import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter';

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
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
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // 1. Anti-spam Rate Limiting: Max 10 orders per 2 minutes per IP
    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(`order-create:${ip}`, 10, 2 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'تم إرسال طلبات كثيرة في وقت قصير. يرجى الانتظار دقيقة والمحاولة مجدداً.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const {
      customerName,
      customerPhone,
      customerAddress,
      customerLat,
      customerLng,
      paymentMethod,
      deliveryTime,
      notes,
      items,
      total,
    } = body;

    // 2. Strict Input Validation
    if (!customerName || !customerPhone || !customerAddress || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'بيانات الطلب غير مكتملة' }, { status: 400 });
    }

    const cleanPhone = String(customerPhone).trim().replace(/[\s-]/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      return NextResponse.json({ error: 'رقم الهاتف غير صالح' }, { status: 400 });
    }

    const cleanName = String(customerName).trim().slice(0, 100);
    const cleanAddress = String(customerAddress).trim().slice(0, 250);
    const cleanNotes = notes ? String(notes).trim().slice(0, 500) : '';
    const numericTotal = Math.max(0, parseFloat(total) || 0);

    // Determine initial payment status
    const paymentStatus = paymentMethod === 'visa' ? 'paid' : 'pending';

    // Resiliently resolve products against DB to guarantee valid foreign keys
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

    const order = await prisma.order.create({
      data: {
        customerName: cleanName,
        customerPhone: cleanPhone,
        customerAddress: cleanAddress,
        customerLat: customerLat ? parseFloat(customerLat) : null,
        customerLng: customerLng ? parseFloat(customerLng) : null,
        paymentMethod: paymentMethod || 'cash',
        paymentStatus,
        orderStatus: 'pending',
        deliveryTime: deliveryTime ? String(deliveryTime).slice(0, 50) : 'أسرع وقت ممكن',
        notes: cleanNotes,
        total: numericTotal,
        items: {
          create: validOrderItems,
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
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
