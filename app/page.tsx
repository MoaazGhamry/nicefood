import React from 'react';
import { prisma } from '@/lib/prisma';
import HomeContent from '@/components/HomeContent';

export default async function HomePage() {
  // Fetch active products with brand info
  let products: any[] = [];
  try {
    products = await prisma.product.findMany({
      where: { isActive: true },
      include: { brand: true },
      take: 8,
      orderBy: { isOffer: 'desc' },
    });
  } catch (error) {
    console.error('Failed to load products from DB:', error);
  }

  return <HomeContent products={products} />;
}
