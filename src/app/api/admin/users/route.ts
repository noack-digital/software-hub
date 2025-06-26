import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST-Anfrage zum Erstellen eines neuen Benutzers
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, role, password } = body;

    // Überprüfen, ob die erforderlichen Felder vorhanden sind
    if (!name || !email || !role || !password) {
      return NextResponse.json(
        { error: 'Name, E-Mail, Rolle und Passwort sind erforderlich' },
        { status: 400 }
      );
    }

    // Überprüfen, ob die E-Mail-Adresse bereits verwendet wird
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Diese E-Mail-Adresse wird bereits verwendet' },
        { status: 400 }
      );
    }

    // Benutzer erstellen
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        role,
        password, // In einer echten Anwendung sollte das Passwort gehasht werden
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
