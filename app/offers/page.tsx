import React from 'react';
import { prisma } from '@/lib/prisma';
import OffersContent from '@/components/OffersContent';

export default async function OffersPage() {
  // Fetch all discounted products across brands
  const offerProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [
        { isOffer: true },
        { offerPrice: { not: null } },
      ],
    },
    include: {
      brand: true,
    },
    orderBy: {
      price: 'desc',
    },
  });

  return <OffersContent products={offerProducts} />;
}
