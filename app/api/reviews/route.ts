import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, productId, rating, comment, customerName, customerPhone, userId } = body;

    if (!orderId || !productId || !rating) {
      return NextResponse.json({ error: 'بيانات التقييم غير مكتملة' }, { status: 400 });
    }

    const numRating = Math.min(5, Math.max(1, parseInt(rating, 10) || 5));

    // Verify order exists and is delivered
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });
    }

    if (order.orderStatus !== 'delivered') {
      return NextResponse.json(
        { error: 'يمكنك تقييم المنتجات فقط بعد توصيل واستلام الطلب بنجاح' },
        { status: 400 }
      );
    }

    // Verify product was part of this order
    const hasProduct = order.items.some((item) => item.productId === productId);
    if (!hasProduct) {
      return NextResponse.json({ error: 'هذا المنتج ليس جزءاً من هذا الطلب' }, { status: 400 });
    }

    const review = await prisma.review.upsert({
      where: {
        orderId_productId: {
          orderId,
          productId,
        },
      },
      update: {
        rating: numRating,
        comment: comment ? String(comment).trim().slice(0, 500) : null,
        customerName: customerName || order.customerName,
        customerPhone: customerPhone || order.customerPhone,
        userId: userId || order.userId || null,
      },
      create: {
        orderId,
        productId,
        rating: numRating,
        comment: comment ? String(comment).trim().slice(0, 500) : null,
        customerName: customerName || order.customerName,
        customerPhone: customerPhone || order.customerPhone,
        userId: userId || order.userId || null,
      },
    });

    return NextResponse.json({ success: true, review });
  } catch (error: any) {
    console.error('Error submitting review:', error);
    return NextResponse.json({ error: error.message || 'فشل تسجيل التقييم' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');
    const productId = searchParams.get('productId');

    if (orderId) {
      const reviews = await prisma.review.findMany({
        where: { orderId },
      });
      return NextResponse.json({ success: true, reviews });
    }

    if (productId) {
      const reviews = await prisma.review.findMany({
        where: { productId },
        orderBy: { createdAt: 'desc' },
      });

      const avgRating =
        reviews.length > 0
          ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
          : 0;

      return NextResponse.json({
        success: true,
        reviews,
        avgRating: Math.round(avgRating * 10) / 10,
        totalReviews: reviews.length,
      });
    }

    return NextResponse.json({ error: 'orderId or productId is required' }, { status: 400 });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'فشل تحميل التقييمات' }, { status: 500 });
  }
}
