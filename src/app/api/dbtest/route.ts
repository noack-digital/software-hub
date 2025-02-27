import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function GET() {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    // Get database URL from environment
    const dbUrl = process.env.DATABASE_URL;
    console.log('Database URL:', dbUrl ? 'Configured' : 'Missing');

    // Try to connect
    console.log('Attempting to connect to database...');
    await prisma.$connect();
    console.log('Successfully connected to database');

    // Try a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Simple query result:', result);

    return NextResponse.json({
      status: 'success',
      dbConfigured: !!dbUrl,
      connectionTest: 'passed',
      queryTest: result
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      status: 'error',
      dbConfigured: !!process.env.DATABASE_URL,
      error: error instanceof Error ? {
        message: error.message,
        name: error.name,
        stack: error.stack
      } : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
