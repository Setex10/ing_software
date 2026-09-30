// services/task-service/services/taskService.js
//
// Reglas de negocio del Task Service: verifica que el proyecto exista y que
// el usuario autenticado sea su creador antes de crear, listar, actualizar
// o eliminar tareas; valida los datos de entrada y resuelve el nombre del
// integrante responsable para mostrarlo en la lista.

import { validateTaskInput, ESTADOS_VALIDOS } from "../models/Task.js";
import {
  crearTarea as crearTareaRepo,
  listarTareasPorProyecto,
  obtenerTarea,
  actualizarTarea as actualizarTareaRepo,
  eliminarTarea as eliminarTareaRepo,
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

function enriquecerTarea(tarea, proyecto) {
  const responsable = tarea.responsableId
    ? proyecto.integrantes.find((i) => i.id === tarea.responsableId) || null
    : null;

  return { ...tarea, responsableNombre: responsable?.nombre || null };
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

  if (
    sanitized.responsableId &&
    !acceso.proyecto.integrantes.some((i) => i.id === sanitized.responsableId)
  ) {
    return {
      ok: false,
      status: 400,
      errors: ["El integrante seleccionado no existe en este proyecto."],
    };
  }

  const tarea = await crearTareaRepo({ proyectoId, ...sanitized });

  return { ok: true, tarea: enriquecerTarea(tarea, acceso.proyecto) };
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

  return { ok: true, tareas: tareas.map((t) => enriquecerTarea(t, acceso.proyecto)) };
}

/**
 * Actualiza el estado y/o el integrante responsable de una tarea.
 * @param {string} userId
 * @param {string} proyectoId
 * @param {string} tareaId
 * @param {{ estado?: string, responsableId?: string | null }} cambios
 */
export async function actualizarTareaDeProyecto(userId, proyectoId, tareaId, cambios) {
  const acceso = await verificarAccesoProyecto(userId, proyectoId);
  if (!acceso.ok) return acceso;

  const tareaExistente = await obtenerTarea(proyectoId, tareaId);
  if (!tareaExistente) {
    return { ok: false, status: 404, errors: ["La tarea no existe."] };
  }

  const cambiosValidados = {};

  if (cambios?.estado !== undefined) {
    if (!ESTADOS_VALIDOS.includes(cambios.estado)) {
      return { ok: false, status: 400, errors: ["Estado de tarea inválido."] };
    }
    cambiosValidados.estado = cambios.estado;
  }

  if (cambios?.responsableId !== undefined) {
    const responsableId = cambios.responsableId || null;
    if (responsableId && !acceso.proyecto.integrantes.some((i) => i.id === responsableId)) {
      return {
        ok: false,
        status: 400,
        errors: ["El integrante seleccionado no existe en este proyecto."],
      };
    }
    cambiosValidados.responsableId = responsableId;
  }

  const tarea = await actualizarTareaRepo(proyectoId, tareaId, cambiosValidados);

  return { ok: true, tarea: enriquecerTarea(tarea, acceso.proyecto) };
}

/**
 * Elimina una tarea de un proyecto del usuario autenticado.
 * @param {string} userId
 * @param {string} proyectoId
 * @param {string} tareaId
 */
export async function eliminarTareaDeProyecto(userId, proyectoId, tareaId) {
  const acceso = await verificarAccesoProyecto(userId, proyectoId);
  if (!acceso.ok) return acceso;

  const eliminada = await eliminarTareaRepo(proyectoId, tareaId);
  if (!eliminada) {
    return { ok: false, status: 404, errors: ["La tarea no existe."] };
  }

  return { ok: true };
}
