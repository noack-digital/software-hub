import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    
    // Wenn kein Token vorhanden ist oder keine Rolle definiert ist, verweigere den Zugriff
    if (!token || !token.role) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    // Administratoren haben Zugriff auf alle Bereiche
    if (token.role === "ADMIN") {
      return NextResponse.next();
    }

    // Benutzer haben nur Zugriff auf bestimmte Bereiche
    if (token.role === "USER") {
      // Erlaubte Pfade für normale Benutzer
      const allowedPaths = [
        "/admin",
        "/admin/software",
        "/admin/categories",
        "/admin/import-export"
      ];
      
      // Prüfe, ob der aktuelle Pfad erlaubt ist
      const isAllowed = allowedPaths.some(allowedPath => 
        path === allowedPath || path.startsWith(`${allowedPath}/`)
      );
      
      if (isAllowed) {
        return NextResponse.next();
      }
    }
    
    // Zugriff verweigern und zur Startseite umleiten
    return NextResponse.redirect(new URL("/admin", req.url));
  },
  {
    callbacks: {
      // Diese Funktion bestimmt, ob die Middleware überhaupt ausgeführt wird
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/admin/:path*"],
};
