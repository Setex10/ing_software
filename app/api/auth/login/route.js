// app/api/auth/login/route.js
//
// Login simulado: valida las credenciales contra el usuario de prueba
// definido en lib/authUsers.js (no hay base de datos), y si son correctas
// firma un JWT y lo guarda en una cookie httpOnly.

import { NextResponse } from "next/server";
import { buscarUsuarioPorEmail, verificarPassword } from "@/lib/authUsers";
import {
  crearTokenSesion,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth";

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

  const usuario = buscarUsuarioPorEmail(email);

  if (!usuario || !verificarPassword(usuario, password)) {
    return NextResponse.json(
      { error: "Correo o contraseña incorrectos." },
      { status: 401 }
    );
  }

  const token = crearTokenSesion(usuario);

  const response = NextResponse.json({
    usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email },
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
