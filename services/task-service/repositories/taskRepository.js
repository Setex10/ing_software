// services/task-service/repositories/taskRepository.js
//
// Capa de acceso a datos: única capa que toca el almacenamiento local
// (lib/localStore.js) para la colección "tasks". No contiene reglas de negocio.

import { db, generarId } from "@/lib/localStore";

/**
 * Crea una tarea asociada a un proyecto.
 * @param {{ proyectoId: string, titulo: string, descripcion: string, responsableId: string | null }} datos
 * @returns {Promise<object>} la tarea insertada
 */
export async function crearTarea({ proyectoId, titulo, descripcion, responsableId = null }) {
  const tarea = {
    _id: generarId(),
    proyectoId,
    titulo,
    descripcion,
    estado: "pendiente",
    responsableId,
    creadoEn: new Date(),
  };

  db.tasks.push(tarea);

  return tarea;
}

/**
 * Lista las tareas de un proyecto.
 * @param {string} proyectoId
 * @returns {Promise<object[]>}
 */
export async function listarTareasPorProyecto(proyectoId) {
  return db.tasks.filter((tarea) => tarea.proyectoId === proyectoId);
}

/**
 * Obtiene una tarea por id (solo dentro de su proyecto).
 * @param {string} proyectoId
 * @param {string} tareaId
 */
export async function obtenerTarea(proyectoId, tareaId) {
  return db.tasks.find((t) => t._id === tareaId && t.proyectoId === proyectoId) || null;
}

/**
 * Aplica cambios parciales a una tarea (estado y/o responsableId).
 * @param {string} proyectoId
 * @param {string} tareaId
 * @param {{ estado?: string, responsableId?: string | null }} cambios
 * @returns {Promise<object|null>} la tarea actualizada, o null si no existe
 */
export async function actualizarTarea(proyectoId, tareaId, cambios) {
  const tarea = db.tasks.find((t) => t._id === tareaId && t.proyectoId === proyectoId);
  if (!tarea) return null;

  if (cambios.estado !== undefined) {
    tarea.estado = cambios.estado;
  }
  if (cambios.responsableId !== undefined) {
    tarea.responsableId = cambios.responsableId;
  }

  return tarea;
}

/**
 * Elimina una tarea de un proyecto.
 * @param {string} proyectoId
 * @param {string} tareaId
 * @returns {Promise<boolean>} true si se eliminó, false si no existía
 */
export async function eliminarTarea(proyectoId, tareaId) {
  const indice = db.tasks.findIndex((t) => t._id === tareaId && t.proyectoId === proyectoId);
  if (indice === -1) return false;

  db.tasks.splice(indice, 1);
  return true;
}
