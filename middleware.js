// middleware.js
//
// Protege las rutas privadas (/proyectos y sus subrutas): si no hay cookie
// de sesión, redirige a /login. Corre en Edge Runtime, así que solo hace
// una verificación de presencia (más liviana): la validación completa del
// JWT (firma y expiración) la hace cada Route Handler, que sí corre en
// Node.js y puede usar jsonwebtoken sin restricciones.
// Las rutas de API (/api/projects/**) se protegen aparte, dentro de cada
// controlador, porque deben responder JSON (401) en vez de redirigir.

import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/sessionCookie";

export function middleware(request) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/proyectos/:path*"],
};
