// app/page.js
//
// Punto de entrada: redirige según haya o no una sesión simulada válida.

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verificarToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export default function HomePage() {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  const usuario = token ? verificarToken(token) : null;

  redirect(usuario ? "/proyectos" : "/login");
}
