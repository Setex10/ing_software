// services/project-service/controllers/projectController.js
//
// Capa de controlador: traduce entre el mundo HTTP (Request/NextResponse)
// y el mundo de negocio (services). No contiene queries ni reglas de negocio.

import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import {
  crearProyectoParaUsuario,
  listarProyectosDeUsuario,
} from "../services/projectService.js";

/**
 * POST /api/projects
 */
export async function handleCreateProject(request) {
  const user = getAuthUser(request);

  if (!user) {
    return NextResponse.json(
      { error: "No autenticado." },
      { status: 401 }
    );
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

  const result = await crearProyectoParaUsuario(user.userId, body);

  if (!result.ok) {
    return NextResponse.json({ error: result.errors.join(" ") }, { status: result.status });
  }

  return NextResponse.json({ proyecto: result.proyecto }, { status: 201 });
}

/**
 * GET /api/projects
 */
export async function handleListProjects(request) {
  const user = getAuthUser(request);

  if (!user) {
    return NextResponse.json(
      { error: "No autenticado." },
      { status: 401 }
    );
  }

  const result = await listarProyectosDeUsuario(user.userId);

  if (!result.ok) {
    return NextResponse.json({ error: result.errors.join(" ") }, { status: result.status });
  }

  return NextResponse.json({ proyectos: result.proyectos }, { status: 200 });
}
