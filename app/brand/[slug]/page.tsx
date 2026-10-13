import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import BrandContent from '@/components/BrandContent';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BrandPage({ params }: PageProps) {
  const { slug } = await params;

  const brand = await prisma.brand.findUnique({
    where: { slug },
    include: {
      products: {
        where: { isActive: true },
        orderBy: [{ isOffer: 'desc' }, { createdAt: 'desc' }],
      },
    },
  });

  if (!brand) {
    notFound();
  }

  return <BrandContent brand={brand} />;
}
