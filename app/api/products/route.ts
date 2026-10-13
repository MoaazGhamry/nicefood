import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: { brand: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      nameAr,
      description,
      descriptionAr,
      price,
      offerPrice,
      image,
      category,
      categoryAr,
      brandId,
      unit,
      isOffer,
      isActive,
    } = body;

    if (!name || !nameAr || price === undefined || !brandId) {
      return NextResponse.json({ error: 'Missing required product fields' }, { status: 400 });
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        nameAr,
        description: description || '',
        descriptionAr: descriptionAr || '',
        price: parseFloat(price),
        offerPrice: offerPrice ? parseFloat(offerPrice) : null,
        image: image || null,
        category: category || 'general',
        categoryAr: categoryAr || 'عام',
        brandId,
        unit: unit || 'كجم',
        isOffer: Boolean(isOffer),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
      include: { brand: true },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
