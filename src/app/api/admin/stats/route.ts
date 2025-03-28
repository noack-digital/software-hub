import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [softwareCount, userCount, downloads] = await Promise.all([
      prisma.software.count(),
      prisma.user.count(),
      prisma.software.aggregate({
        _sum: {
          downloads: true,
        },
      }),
    ]);

    return NextResponse.json({
      softwareCount,
      userCount,
      totalDownloads: downloads._sum.downloads || 0,
    });
  } catch (error) {
    console.error("Fehler beim Laden der Admin-Statistiken:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden der Statistiken" },
      { status: 500 }
    );
  }
}
