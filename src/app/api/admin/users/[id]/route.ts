import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET-Anfrage für einen einzelnen Benutzer
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: params.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Benutzer nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PATCH-Anfrage zum Aktualisieren eines Benutzers
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, email, role, password } = body;

    // Überprüfen, ob die erforderlichen Felder vorhanden sind
    if (!name || !email || !role) {
      return NextResponse.json(
        { error: 'Name, E-Mail und Rolle sind erforderlich' },
        { status: 400 }
      );
    }

    // Überprüfen, ob die E-Mail-Adresse bereits verwendet wird
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        id: {
          not: params.id,
        },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Diese E-Mail-Adresse wird bereits verwendet' },
        { status: 400 }
      );
    }

    // Daten für die Aktualisierung vorbereiten
    const updateData: any = {
      name,
      email,
      role,
    };

    // Wenn ein Passwort angegeben wurde, hash es und füge es zu den Update-Daten hinzu
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    // Benutzer aktualisieren
    const updatedUser = await prisma.user.update({
      where: {
        id: params.id,
      },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE-Anfrage zum Löschen eines Benutzers
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Überprüfen, ob der Benutzer existiert
    const user = await prisma.user.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Benutzer nicht gefunden' },
        { status: 404 }
      );
    }

    // Benutzer löschen
    await prisma.user.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ message: 'Benutzer erfolgreich gelöscht' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
