import React from 'react';
import { prisma } from '@/lib/prisma';
import PaymentFailedContent from '@/components/PaymentFailedContent';

interface PageProps {
  searchParams: Promise<{ orderId?: string; reason?: string }>;
}

export default async function PaymentFailedPage({ searchParams }: PageProps) {
  const { orderId } = await searchParams;

  let order = null;
  if (orderId) {
    try {
      order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Ensure order status is marked as cancelled and payment failed
      if (order && (order.paymentStatus !== 'failed' || order.orderStatus !== 'cancelled')) {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'failed',
            orderStatus: 'cancelled',
          },
        });
        order.paymentStatus = 'failed';
        order.orderStatus = 'cancelled';
      }
    } catch (err) {
      console.error('Failed to query or update cancelled order:', err);
    }
  }

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `if (window.top !== window.self) { try { window.top.location.href = window.location.href; } catch(e){} }`,
        }}
      />
      <PaymentFailedContent order={order} />
    </>
  );
}
