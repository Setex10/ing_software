// services/member-service/controllers/memberController.js
//
// Capa de controlador: traduce entre el mundo HTTP y el mundo de negocio
// (services). No contiene queries ni reglas de negocio.

import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import {
  agregarIntegranteAProyecto,
  listarIntegrantesDeProyecto,
} from "../services/memberService.js";

/**
 * POST /api/projects/:id/members
 */
export async function handleAddMember(request, proyectoId) {
  const user = getAuthUser(request);

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch (err) {
    return NextResponse.json(
      { error: "El cuerpo de la petición no es un JSON válido." },
      { status: 400 }
    );
  }

  const result = await agregarIntegranteAProyecto(user.userId, proyectoId, body);

  if (!result.ok) {
    return NextResponse.json({ error: result.errors.join(" ") }, { status: result.status });
  }

  return NextResponse.json({ integrante: result.integrante }, { status: 201 });
}

/**
 * GET /api/projects/:id/members
 */
export async function handleListMembers(request, proyectoId) {
  const user = getAuthUser(request);

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const result = await listarIntegrantesDeProyecto(user.userId, proyectoId);

  if (!result.ok) {
    return NextResponse.json({ error: result.errors.join(" ") }, { status: result.status });
  }

  return NextResponse.json({ integrantes: result.integrantes }, { status: 200 });
}
