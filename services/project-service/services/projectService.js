// services/project-service/services/projectService.js
//
// Reglas de negocio del Project Service: validación de datos, creación
// del proyecto con el creador como responsable, consulta de proyectos del
// usuario y cálculo de porcentaje de avance a partir de las tareas creadas
// en el módulo de Tareas (lib/localStore.js, colección "tasks").

import { db } from "@/lib/localStore";
import { validateProjectInput } from "../models/Project.js";
import {
  crearProyecto as crearProyectoRepo,
  listarProyectosPorUsuario,
  obtenerProyectoPorId,
} from "../repositories/projectRepository.js";

/**
 * Crea un proyecto para el usuario autenticado.
 * @param {string} userId - id del usuario autenticado (de la sesión, nunca del body)
 * @param {any} inputData - datos crudos del body (nombre, descripcion, fechaLimite)
 * @returns {Promise<{ ok: true, proyecto: object } | { ok: false, status: number, errors: string[] }>}
 */
export async function crearProyectoParaUsuario(userId, inputData) {
  if (!userId) {
    return { ok: false, status: 401, errors: ["Sesión inválida."] };
  }

  const { valid, errors, sanitized } = validateProjectInput(inputData);

  if (!valid) {
    return { ok: false, status: 400, errors };
  }

  const proyecto = await crearProyectoRepo({
    nombre: sanitized.nombre,
    descripcion: sanitized.descripcion,
    fechaLimite: sanitized.fechaLimite,
    creadorId: userId,
  });

  return { ok: true, proyecto };
}

/**
 * Lista los proyectos del usuario autenticado, cada uno con su porcentaje
 * de avance calculado.
 * @param {string} userId
 * @returns {Promise<{ ok: true, proyectos: object[] } | { ok: false, status: number, errors: string[] }>}
 */
export async function listarProyectosDeUsuario(userId) {
  if (!userId) {
    return { ok: false, status: 401, errors: ["Sesión inválida."] };
  }

  const proyectos = await listarProyectosPorUsuario(userId);

  const proyectosConAvance = proyectos.map((proyecto) => ({
    _id: proyecto._id,
    nombre: proyecto.nombre,
    descripcion: proyecto.descripcion,
    fechaLimite: proyecto.fechaLimite,
    creadorId: proyecto.creadorId,
    integrantes: proyecto.integrantes,
    porcentajeAvance: calcularAvance(proyecto._id),
  }));

  return { ok: true, proyectos: proyectosConAvance };
}

/**
 * Obtiene el detalle de un proyecto del usuario autenticado (con avance).
 * @param {string} userId
 * @param {string} proyectoId
 */
export async function obtenerProyectoDeUsuario(userId, proyectoId) {
  if (!userId) {
    return { ok: false, status: 401, errors: ["Sesión inválida."] };
  }

  const proyecto = await obtenerProyectoPorId(proyectoId);

  if (!proyecto || proyecto.creadorId !== userId) {
    return { ok: false, status: 404, errors: ["El proyecto no existe."] };
  }

  return {
    ok: true,
    proyecto: { ...proyecto, porcentajeAvance: calcularAvance(proyecto._id) },
  };
}

/**
 * Calcula el porcentaje de avance de un proyecto: (tareas completadas / tareas totales) * 100.
 * @param {string} proyectoId
 * @returns {number} entero entre 0 y 100
 */
export function calcularAvance(proyectoId) {
  const tareas = db.tasks.filter((tarea) => tarea.proyectoId === proyectoId);

  if (tareas.length === 0) {
    return 0;
  }

  const tareasCompletadas = tareas.filter((tarea) => tarea.estado === "completada").length;

  return Math.round((tareasCompletadas / tareas.length) * 100);
}
