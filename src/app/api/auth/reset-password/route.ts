import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";
import bcrypt from "bcryptjs";

// Anfrage für Passwort-Reset
export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Aus Sicherheitsgründen geben wir die gleiche Nachricht zurück
      return NextResponse.json({
        message: "Wenn ein Account mit dieser E-Mail existiert, wurde eine E-Mail zum Zurücksetzen des Passworts gesendet.",
      });
    }

    // Generiere Reset-Token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = await bcrypt.hash(resetToken, 10);

    // Speichere Token in der Datenbank
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: resetTokenHash,
        resetTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 Stunden
      },
    });

    // Sende Reset-E-Mail
    await sendPasswordResetEmail(user.email, resetToken);

    return NextResponse.json({
      message: "Wenn ein Account mit dieser E-Mail existiert, wurde eine E-Mail zum Zurücksetzen des Passworts gesendet.",
    });
  } catch (error) {
    console.error("Fehler beim Passwort-Reset:", error);
    return NextResponse.json(
      { error: "Fehler beim Zurücksetzen des Passworts" },
      { status: 500 }
    );
  }
}

// Bestätigung des Passwort-Resets
export async function PUT(request: Request) {
  try {
    const { token, newPassword } = await request.json();

    // Finde Benutzer mit gültigem Reset-Token
    const user = await prisma.user.findFirst({
      where: {
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user || !user.resetToken) {
      return NextResponse.json(
        { error: "Ungültiger oder abgelaufener Token" },
        { status: 400 }
      );
    }

    // Überprüfe Token
    const isValidToken = await bcrypt.compare(token, user.resetToken);
    if (!isValidToken) {
      return NextResponse.json(
        { error: "Ungültiger oder abgelaufener Token" },
        { status: 400 }
      );
    }

    // Hash neues Passwort und update Benutzer
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json({
      message: "Passwort wurde erfolgreich zurückgesetzt",
    });
  } catch (error) {
    console.error("Fehler beim Setzen des neuen Passworts:", error);
    return NextResponse.json(
      { error: "Fehler beim Setzen des neuen Passworts" },
      { status: 500 }
    );
  }
}
