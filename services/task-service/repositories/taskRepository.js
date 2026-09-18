// services/task-service/repositories/taskRepository.js
//
// Capa de acceso a datos: única capa que toca el almacenamiento local
// (lib/localStore.js) para la colección "tasks". No contiene reglas de negocio.

import { db, generarId } from "@/lib/localStore";

/**
 * Crea una tarea asociada a un proyecto.
 * @param {{ proyectoId: string, titulo: string, descripcion: string }} datos
 * @returns {Promise<object>} la tarea insertada
 */
export async function crearTarea({ proyectoId, titulo, descripcion }) {
  const tarea = {
    _id: generarId(),
    proyectoId,
    titulo,
    descripcion,
    estado: "pendiente",
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
 * Actualiza el estado de una tarea.
 * @param {string} tareaId
 * @param {string} estado
 * @returns {Promise<object|null>} la tarea actualizada, o null si no existe
 */
export async function actualizarEstadoTarea(tareaId, estado) {
  const tarea = db.tasks.find((t) => t._id === tareaId);
  if (!tarea) return null;

  tarea.estado = estado;

  return tarea;
}
