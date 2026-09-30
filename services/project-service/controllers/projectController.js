// services/project-service/controllers/projectController.js
//
// Capa de controlador: traduce entre el mundo HTTP (Request/NextResponse)
// y el mundo de negocio (services). No contiene queries ni reglas de negocio.

import { getAuthUser } from "@/lib/auth";
import { requireAuthUser, parseJsonBody, jsonFromResult } from "@/lib/httpController";
import {
  crearProyectoParaUsuario,
  listarProyectosDeUsuario,
  obtenerProyectoDeUsuario,
} from "../services/projectService.js";

/**
 * POST /api/projects
 */
export async function handleCreateProject(request) {
  const user = getAuthUser(request);
  const authError = requireAuthUser(user);
  if (authError) return authError;

  const { body, response } = await parseJsonBody(request);
  if (response) return response;

  const result = await crearProyectoParaUsuario(user.userId, body);
  return jsonFromResult(result, "proyecto", 201);
}

/**
 * GET /api/projects
 */
export async function handleListProjects(request) {
  const user = getAuthUser(request);
  const authError = requireAuthUser(user);
  if (authError) return authError;

  const result = await listarProyectosDeUsuario(user.userId);
  return jsonFromResult(result, "proyectos", 200);
}

/**
 * GET /api/projects/:id
 */
export async function handleGetProject(request, proyectoId) {
  const user = getAuthUser(request);
  const authError = requireAuthUser(user);
  if (authError) return authError;

  const result = await obtenerProyectoDeUsuario(user.userId, proyectoId);
  return jsonFromResult(result, "proyecto", 200);
}
