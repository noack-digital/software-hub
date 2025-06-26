import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data } = await request.json();

    // Validiere die Daten
    if (!Array.isArray(data)) {
      return NextResponse.json(
        { error: "Ungültiges Datenformat" },
        { status: 400 }
      );
    }

    // Erstelle einen Audit-Log-Eintrag
    const auditLog = await prisma.auditLog.create({
      data: {
        action: "IMPORT",
        entity: "Software",
        entityId: "BULK_IMPORT",
        userId: session.user.id,
        changes: { count: data.length },
      },
    });

    // Importiere die Daten
    const importedSoftware = await Promise.all(
      data.map(async (item) => {
        const software = await prisma.software.create({
          data: {
            name: item.name,
            description: item.description,
            version: item.version,
            publisher: item.publisher,
            website: item.website,
            category: item.category,
            tags: Array.isArray(item.tags)
              ? item.tags
              : item.tags?.split(",").map((t: string) => t.trim()) || [],
            license: item.license,
            platform: Array.isArray(item.platform)
              ? item.platform
              : item.platform?.split(",").map((p: string) => p.trim()) || [],
            userId: session.user.id,
          },
        });
        return software;
      })
    );

    return NextResponse.json({
      message: `${importedSoftware.length} Software-Einträge erfolgreich importiert`,
      auditLogId: auditLog.id,
    });
  } catch (error) {
    console.error("Fehler beim Import:", error);
    return NextResponse.json(
      { error: "Fehler beim Importieren der Daten" },
      { status: 500 }
    );
  }
}
