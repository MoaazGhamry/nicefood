import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { brand: true },
    });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    const body = await req.json();

    const dataToUpdate: any = {};
    if (body.isActive !== undefined) dataToUpdate.isActive = Boolean(body.isActive);
    if (body.isOffer !== undefined) dataToUpdate.isOffer = Boolean(body.isOffer);
    if (body.price !== undefined) dataToUpdate.price = parseFloat(body.price);
    if (body.offerPrice !== undefined) {
      dataToUpdate.offerPrice = body.offerPrice === null || body.offerPrice === '' ? null : parseFloat(body.offerPrice);
    }
    if (body.name !== undefined) dataToUpdate.name = body.name;
    if (body.nameAr !== undefined) dataToUpdate.nameAr = body.nameAr;
    if (body.unit !== undefined) dataToUpdate.unit = body.unit;
    if (body.category !== undefined) dataToUpdate.category = body.category;
    if (body.categoryAr !== undefined) dataToUpdate.categoryAr = body.categoryAr;
    if (body.image !== undefined) dataToUpdate.image = body.image;

    const updated = await prisma.product.update({
      where: { id },
      data: dataToUpdate,
      include: { brand: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    await prisma.product.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
