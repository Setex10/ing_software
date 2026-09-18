// services/task-service/services/taskService.js
//
// Reglas de negocio del Task Service: verifica que el proyecto exista y que
// el usuario autenticado sea su creador antes de crear, listar o actualizar
// tareas, y valida los datos de entrada.

import { validateTaskInput, ESTADOS_VALIDOS } from "../models/Task.js";
import {
  crearTarea as crearTareaRepo,
  listarTareasPorProyecto,
  actualizarEstadoTarea,
} from "../repositories/taskRepository.js";
import { obtenerProyectoPorId } from "@/services/project-service/repositories/projectRepository.js";

async function verificarAccesoProyecto(userId, proyectoId) {
  const proyecto = await obtenerProyectoPorId(proyectoId);

  if (!proyecto) {
    return { ok: false, status: 404, errors: ["El proyecto no existe."] };
  }

  if (proyecto.creadorId !== userId) {
    return { ok: false, status: 403, errors: ["No tienes acceso a este proyecto."] };
  }

  return { ok: true, proyecto };
}

/**
 * Crea una tarea para un proyecto del usuario autenticado.
 * @param {string} userId
 * @param {string} proyectoId
 * @param {any} inputData
 */
export async function crearTareaParaProyecto(userId, proyectoId, inputData) {
  const acceso = await verificarAccesoProyecto(userId, proyectoId);
  if (!acceso.ok) return acceso;

  const { valid, errors, sanitized } = validateTaskInput(inputData);
  if (!valid) {
    return { ok: false, status: 400, errors };
  }

  const tarea = await crearTareaRepo({ proyectoId, ...sanitized });

  return { ok: true, tarea };
}

/**
 * Lista las tareas de un proyecto del usuario autenticado.
 * @param {string} userId
 * @param {string} proyectoId
 */
export async function listarTareasDeProyecto(userId, proyectoId) {
  const acceso = await verificarAccesoProyecto(userId, proyectoId);
  if (!acceso.ok) return acceso;

  const tareas = await listarTareasPorProyecto(proyectoId);

  return { ok: true, tareas };
}

/**
 * Actualiza el estado de una tarea (ej. marcarla como completada).
 * @param {string} userId
 * @param {string} proyectoId
 * @param {string} tareaId
 * @param {string} estado
 */
export async function cambiarEstadoTarea(userId, proyectoId, tareaId, estado) {
  const acceso = await verificarAccesoProyecto(userId, proyectoId);
  if (!acceso.ok) return acceso;

  if (!ESTADOS_VALIDOS.includes(estado)) {
    return { ok: false, status: 400, errors: ["Estado de tarea inválido."] };
  }

  const tarea = await actualizarEstadoTarea(tareaId, estado);
  if (!tarea) {
    return { ok: false, status: 404, errors: ["La tarea no existe."] };
  }

  return { ok: true, tarea };
}
