// app/api/auth/login/route.js
//
// Login simulado: valida las credenciales contra los usuarios de prueba
// definidos en lib/authUsers.js (no hay base de datos), aplica un límite de
// intentos fallidos (lib/loginRateLimit.js) y, si son correctas, firma un
// JWT y lo guarda en una cookie httpOnly.

import { NextResponse } from "next/server";
import { buscarUsuarioPorEmail, verificarPassword } from "@/lib/authUsers";
import {
  crearTokenSesion,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth";
import { estaBloqueado, registrarIntentoFallido, limpiarIntentos } from "@/lib/loginRateLimit";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch (err) {
    return NextResponse.json(
      { error: "El cuerpo de la petición no es un JSON válido." },
      { status: 400 }
    );
  }

  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Correo y contraseña son obligatorios." },
      { status: 400 }
    );
  }

  const bloqueo = estaBloqueado(email);
  if (bloqueo.bloqueado) {
    return NextResponse.json(
      {
        error: `Demasiados intentos fallidos. Vuelve a intentar en ${Math.ceil(
          bloqueo.segundosRestantes / 60
        )} minuto(s).`,
      },
      { status: 429 }
    );
  }

  const usuario = buscarUsuarioPorEmail(email);

  if (!usuario || !verificarPassword(usuario, password)) {
    registrarIntentoFallido(email);
    return NextResponse.json(
      { error: "Correo o contraseña incorrectos." },
      { status: 401 }
    );
  }

  limpiarIntentos(email);

  const token = crearTokenSesion(usuario);

  const response = NextResponse.json({
    usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
  });

  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return response;
}
