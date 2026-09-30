// services/task-service/controllers/taskController.js
//
// Capa de controlador: traduce entre el mundo HTTP y el mundo de negocio
// (services). No contiene queries ni reglas de negocio.

import { NextResponse } from "next/server";
import { getAuthUser, esAdmin } from "@/lib/auth";
import { requireAuthUser, parseJsonBody, jsonFromResult } from "@/lib/httpController";
import {
  crearTareaParaProyecto,
  listarTareasDeProyecto,
  actualizarTareaDeProyecto,
  eliminarTareaDeProyecto,
} from "../services/taskService.js";

/**
 * POST /api/projects/:id/tasks
 */
export async function handleCreateTask(request, proyectoId) {
  const user = getAuthUser(request);
  const authError = requireAuthUser(user);
  if (authError) return authError;

  const { body, response } = await parseJsonBody(request);
  if (response) return response;

  const result = await crearTareaParaProyecto(user.userId, proyectoId, body);
  return jsonFromResult(result, "tarea", 201);
}

/**
 * GET /api/projects/:id/tasks
 */
export async function handleListTasks(request, proyectoId) {
  const user = getAuthUser(request);
  const authError = requireAuthUser(user);
  if (authError) return authError;

  const result = await listarTareasDeProyecto(user.userId, proyectoId);
  return jsonFromResult(result, "tareas", 200);
}

/**
 * PATCH /api/projects/:id/tasks/:taskId
 * Body: { estado?, responsableId? }
 */
export async function handleUpdateTask(request, proyectoId, tareaId) {
  const user = getAuthUser(request);
  const authError = requireAuthUser(user);
  if (authError) return authError;

  const { body, response } = await parseJsonBody(request);
  if (response) return response;

  const result = await actualizarTareaDeProyecto(user.userId, proyectoId, tareaId, body);
  return jsonFromResult(result, "tarea", 200);
}

/**
 * DELETE /api/projects/:id/tasks/:taskId
 *
 * Restringido a usuarios con rol "admin": eliminar una tarea es una acción
 * destructiva que, en este sistema, solo el rol administrador puede hacer.
 */
export async function handleDeleteTask(request, proyectoId, tareaId) {
  const user = getAuthUser(request);
  const authError = requireAuthUser(user);
  if (authError) return authError;

  if (!esAdmin(user)) {
    return NextResponse.json(
      { error: "Solo un usuario con rol de administrador puede eliminar tareas." },
      { status: 403 }
    );
  }

  const result = await eliminarTareaDeProyecto(user.userId, proyectoId, tareaId);
  if (!result.ok) {
    return NextResponse.json({ error: result.errors.join(" ") }, { status: result.status });
  }
  return NextResponse.json({ ok: true }, { status: 200 });
}
