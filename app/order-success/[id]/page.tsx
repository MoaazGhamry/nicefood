import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import OrderSuccessContent from '@/components/OrderSuccessContent';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderSuccessPage({ params }: PageProps) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
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

  if (!order) {
    notFound();
  }

  // If order was cancelled or payment failed, display failure page immediately
  if (order.orderStatus === 'cancelled' || order.paymentStatus === 'failed') {
    redirect(`/payment/failed?orderId=${order.id}`);
  }

  return <OrderSuccessContent order={order} />;
}
