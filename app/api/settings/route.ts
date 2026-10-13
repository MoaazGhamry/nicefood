import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settingsList = await prisma.setting.findMany();
    const settingsMap: Record<string, string> = {};
    settingsList.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    const deliveryFee = settingsMap['deliveryFee'] !== undefined
      ? parseFloat(settingsMap['deliveryFee'])
      : 35;

    const freeDeliveryThreshold = settingsMap['freeDeliveryThreshold'] !== undefined
      ? parseFloat(settingsMap['freeDeliveryThreshold'])
      : 500;

    return NextResponse.json({
      success: true,
      settings: {
        deliveryFee: isNaN(deliveryFee) ? 35 : deliveryFee,
        freeDeliveryThreshold: isNaN(freeDeliveryThreshold) ? 500 : freeDeliveryThreshold,
      },
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    // Fallback to default values if any error occurs
    return NextResponse.json({
      success: true,
      settings: {
        deliveryFee: 35,
        freeDeliveryThreshold: 500,
      },
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { deliveryFee, freeDeliveryThreshold } = body;

    if (deliveryFee !== undefined) {
      const numFee = Math.max(0, parseFloat(String(deliveryFee)));
      if (!isNaN(numFee)) {
        await prisma.setting.upsert({
          where: { key: 'deliveryFee' },
          update: { value: numFee.toString() },
          create: { key: 'deliveryFee', value: numFee.toString() },
        });
      }
    }

    if (freeDeliveryThreshold !== undefined) {
      const numThresh = Math.max(0, parseFloat(String(freeDeliveryThreshold)));
      if (!isNaN(numThresh)) {
        await prisma.setting.upsert({
          where: { key: 'freeDeliveryThreshold' },
          update: { value: numThresh.toString() },
          create: { key: 'freeDeliveryThreshold', value: numThresh.toString() },
        });
      }
    }

    const updatedList = await prisma.setting.findMany();
    const settingsMap: Record<string, string> = {};
    updatedList.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    const finalFee = settingsMap['deliveryFee'] !== undefined
      ? parseFloat(settingsMap['deliveryFee'])
      : 35;

    const finalThreshold = settingsMap['freeDeliveryThreshold'] !== undefined
      ? parseFloat(settingsMap['freeDeliveryThreshold'])
      : 500;

    return NextResponse.json({
      success: true,
      settings: {
        deliveryFee: finalFee,
        freeDeliveryThreshold: finalThreshold,
      },
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
