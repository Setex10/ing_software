// services/member-service/controllers/memberController.js
//
// Capa de controlador: traduce entre el mundo HTTP y el mundo de negocio
// (services). No contiene queries ni reglas de negocio.

import { getAuthUser } from "@/lib/auth";
import { requireAuthUser, parseJsonBody, jsonFromResult } from "@/lib/httpController";
import {
  agregarIntegranteAProyecto,
  listarIntegrantesDeProyecto,
} from "../services/memberService.js";

/**
 * POST /api/projects/:id/members
 */
export async function handleAddMember(request, proyectoId) {
  const user = getAuthUser(request);
  const authError = requireAuthUser(user);
  if (authError) return authError;

  const { body, response } = await parseJsonBody(request);
  if (response) return response;

  const result = await agregarIntegranteAProyecto(user.userId, proyectoId, body);
  return jsonFromResult(result, "integrante", 201);
}

/**
 * GET /api/projects/:id/members
 */
export async function handleListMembers(request, proyectoId) {
  const user = getAuthUser(request);
  const authError = requireAuthUser(user);
  if (authError) return authError;

  const result = await listarIntegrantesDeProyecto(user.userId, proyectoId);
  return jsonFromResult(result, "integrantes", 200);
}
