import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Test API: Testing database connection...');
    
    // Test database connection
    await prisma.$connect();
    console.log('Test API: Database connection successful');

    // Test simple query
    const tableNames = await prisma.$queryRaw`
      SELECT tablename 
      FROM pg_catalog.pg_tables 
      WHERE schemaname = 'public'
    `;
    console.log('Test API: Available tables:', tableNames);

    // Try to count software entries
    const count = await prisma.software.count();
    console.log('Test API: Software count:', count);

    // Try to fetch software entries
    const software = await prisma.software.findMany({
      select: {
        id: true,
        name: true,
        url: true,
        shortDescription: true
      }
    });
    console.log('Test API: Software entries:', software);

    return NextResponse.json({
      success: true,
      connection: 'ok',
      tables: tableNames,
      count,
      software
    });
  } catch (error) {
    console.error('Test API Error:', error);
    let errorMessage = 'Unknown error';
    let errorDetails = {};

    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
      errorMessage = error.message;
      errorDetails = {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    }

    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: errorDetails
    }, {
      status: 500
    });
  } finally {
    await prisma.$disconnect();
  }
}
