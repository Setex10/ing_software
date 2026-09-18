// services/task-service/controllers/taskController.js
//
// Capa de controlador: traduce entre el mundo HTTP y el mundo de negocio
// (services). No contiene queries ni reglas de negocio.

import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import {
  crearTareaParaProyecto,
  listarTareasDeProyecto,
  cambiarEstadoTarea,
} from "../services/taskService.js";

/**
 * POST /api/projects/:id/tasks
 */
export async function handleCreateTask(request, proyectoId) {
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

  const result = await crearTareaParaProyecto(user.userId, proyectoId, body);

  if (!result.ok) {
    return NextResponse.json({ error: result.errors.join(" ") }, { status: result.status });
  }

  return NextResponse.json({ tarea: result.tarea }, { status: 201 });
}

/**
 * GET /api/projects/:id/tasks
 */
export async function handleListTasks(request, proyectoId) {
  const user = getAuthUser(request);

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const result = await listarTareasDeProyecto(user.userId, proyectoId);

  if (!result.ok) {
    return NextResponse.json({ error: result.errors.join(" ") }, { status: result.status });
  }

  return NextResponse.json({ tareas: result.tareas }, { status: 200 });
}

/**
 * PATCH /api/projects/:id/tasks/:taskId
 */
export async function handleUpdateTaskStatus(request, proyectoId, tareaId) {
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

  const result = await cambiarEstadoTarea(user.userId, proyectoId, tareaId, body?.estado);

  if (!result.ok) {
    return NextResponse.json({ error: result.errors.join(" ") }, { status: result.status });
  }

  return NextResponse.json({ tarea: result.tarea }, { status: 200 });
}
