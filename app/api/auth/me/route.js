// app/api/auth/me/route.js
//
// Devuelve los datos del usuario autenticado (incluyendo su rol), para que
// el cliente pueda decidir qué acciones mostrar (ej. solo un admin puede
// eliminar tareas).

import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

export async function GET(request) {
  const user = getAuthUser(request);

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  return NextResponse.json({
    usuario: { id: user.userId, nombre: user.nombre, email: user.email, rol: user.rol },
  });
}
