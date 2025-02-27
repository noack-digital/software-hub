import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST() {
  try {
    // Remove all software entries
    await prisma.software.deleteMany();

    return NextResponse.json({ message: 'Demo data removed successfully' });
  } catch (error) {
    console.error('Error removing demo data:', error);
    return NextResponse.json(
      { error: 'Failed to remove demo data' },
      { status: 500 }
    );
  }
}
