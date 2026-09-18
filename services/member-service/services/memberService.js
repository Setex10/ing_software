// services/member-service/services/memberService.js
//
// Reglas de negocio del Member Service: verifica que el proyecto exista y
// que el usuario autenticado sea su creador antes de agregar o listar
// integrantes, y valida los datos de entrada.

import { validateMemberInput } from "../models/Member.js";
import {
  obtenerProyecto,
  agregarIntegrante as agregarIntegranteRepo,
  listarIntegrantes,
} from "../repositories/memberRepository.js";

async function verificarAccesoProyecto(userId, proyectoId) {
  const proyecto = await obtenerProyecto(proyectoId);

  if (!proyecto) {
    return { ok: false, status: 404, errors: ["El proyecto no existe."] };
  }

  if (proyecto.creadorId !== userId) {
    return { ok: false, status: 403, errors: ["No tienes acceso a este proyecto."] };
  }

  return { ok: true, proyecto };
}

/**
 * Agrega un integrante a un proyecto del usuario autenticado.
 * @param {string} userId
 * @param {string} proyectoId
 * @param {any} inputData
 */
export async function agregarIntegranteAProyecto(userId, proyectoId, inputData) {
  const acceso = await verificarAccesoProyecto(userId, proyectoId);
  if (!acceso.ok) return acceso;

  const { valid, errors, sanitized } = validateMemberInput(inputData);
  if (!valid) {
    return { ok: false, status: 400, errors };
  }

  const integrante = await agregarIntegranteRepo(proyectoId, sanitized);

  return { ok: true, integrante };
}

/**
 * Lista los integrantes de un proyecto del usuario autenticado.
 * @param {string} userId
 * @param {string} proyectoId
 */
export async function listarIntegrantesDeProyecto(userId, proyectoId) {
  const acceso = await verificarAccesoProyecto(userId, proyectoId);
  if (!acceso.ok) return acceso;

  const integrantes = await listarIntegrantes(proyectoId);

  return { ok: true, integrantes };
}
