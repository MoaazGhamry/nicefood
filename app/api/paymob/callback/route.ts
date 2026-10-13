import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPaymobHmac } from '@/lib/paymob';

/**
 * Paymob Transaction Webhook & Redirection Callback
 * Handles:
 * 1. GET: Redirection callback when customer completes payment on Paymob iframe
 * 2. POST: Server-to-server webhook from Paymob when transaction is processed
 */

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const success = searchParams.get('success') === 'true';
    const hmac = searchParams.get('hmac');
    const merchantOrderId = searchParams.get('merchant_order_id');
    const paymobTransactionId = searchParams.get('id');

    // Convert query parameters into an object for HMAC verification
    const paramsObj: Record<string, any> = {};
    searchParams.forEach((value, key) => {
      paramsObj[key] = value;
    });

    const isAuthentic = verifyPaymobHmac(paramsObj, hmac);

    if (!isAuthentic) {
      console.warn('Paymob GET callback HMAC verification failed.');
      if (merchantOrderId) {
        await prisma.order.update({
          where: { id: merchantOrderId },
          data: {
            paymentStatus: 'failed',
            orderStatus: 'cancelled',
          },
        }).catch(() => {});
        return NextResponse.redirect(new URL(`/payment/failed?orderId=${merchantOrderId}`, req.url));
      }
      return NextResponse.redirect(new URL('/payment/failed', req.url));
    }

    if (merchantOrderId) {
      if (success) {
        await prisma.order.update({
          where: { id: merchantOrderId },
          data: {
            paymentStatus: 'paid',
            orderStatus: 'confirmed',
            paymobOrderId: paymobTransactionId || undefined,
          },
        }).catch((err) => console.error('Error updating order on GET callback:', err));

        return NextResponse.redirect(new URL(`/order-success/${merchantOrderId}?payment=success`, req.url));
      } else {
        await prisma.order.update({
          where: { id: merchantOrderId },
          data: {
            paymentStatus: 'failed',
            orderStatus: 'cancelled',
          },
        }).catch((err) => console.error('Error marking order failed:', err));

        return NextResponse.redirect(new URL(`/payment/failed?orderId=${merchantOrderId}`, req.url));
      }
    }

    return NextResponse.redirect(new URL('/', req.url));
  } catch (error) {
    console.error('Paymob GET callback error:', error);
    return NextResponse.redirect(new URL('/checkout?error=callback_error', req.url));
  }
}

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const body = await req.json();

    // Paymob delivers payload inside { obj: { ... } } or directly
    const transaction = body.obj || body;
    const receivedHmac = searchParams.get('hmac') || req.headers.get('x-paymob-hmac');

    // Cryptographic signature check
    const isAuthentic = verifyPaymobHmac(transaction, receivedHmac);

    if (!isAuthentic) {
      console.error('CRITICAL: Paymob webhook HMAC verification failed! Rejecting payload.');
      return NextResponse.json({ error: 'Invalid HMAC signature' }, { status: 401 });
    }

    const isSuccess = transaction.success === true || transaction.success === 'true';
    const merchantOrderId = transaction.order?.merchant_order_id || transaction.merchant_order_id;
    const paymobTransId = String(transaction.id || '');

    if (merchantOrderId) {
      if (isSuccess) {
        await prisma.order.update({
          where: { id: merchantOrderId },
          data: {
            paymentStatus: 'paid',
            orderStatus: 'confirmed',
            paymobOrderId: paymobTransId,
          },
        });
        console.log(`Order ${merchantOrderId} marked as PAID via Paymob transaction ${paymobTransId}`);
      } else {
        await prisma.order.update({
          where: { id: merchantOrderId },
          data: {
            paymentStatus: 'failed',
            orderStatus: 'cancelled',
          },
        });
      }
    }

    return NextResponse.json({ status: 'success', received: true });
  } catch (error: any) {
    console.error('Paymob webhook error:', error);
    return NextResponse.json({ error: error.message || 'Webhook processing failed' }, { status: 500 });
  }
}
