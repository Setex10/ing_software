// services/project-service/repositories/projectRepository.js
//
// Capa de acceso a datos: única capa que toca el almacenamiento local
// (lib/localStore.js) para la colección "projects". No contiene reglas de
// negocio.

import { db, generarId } from "@/lib/localStore";

/**
 * Inserta un nuevo proyecto ya validado y con creadorId confiable (nunca del cliente).
 * @param {{ nombre: string, descripcion: string, fechaLimite: Date, creadorId: string }} proyecto
 * @returns {Promise<object>} el documento insertado (con _id)
 */
export async function crearProyecto({ nombre, descripcion, fechaLimite, creadorId }) {
  const now = new Date();

  const proyecto = {
    _id: generarId(),
    nombre,
    descripcion,
    fechaLimite,
    creadorId,
    integrantes: [],
    creadoEn: now,
    actualizadoEn: now,
  };

  db.projects.push(proyecto);

  return proyecto;
}

/**
 * Lista los proyectos creados por el usuario, ordenados por fecha límite
 * ascendente (la más próxima primero).
 * @param {string} userId
 * @returns {Promise<object[]>}
 */
export async function listarProyectosPorUsuario(userId) {
  return db.projects
    .filter((proyecto) => proyecto.creadorId === userId)
    .sort((a, b) => new Date(a.fechaLimite) - new Date(b.fechaLimite));
}

/**
 * Obtiene un proyecto por su id.
 * @param {string} proyectoId
 */
export async function obtenerProyectoPorId(proyectoId) {
  return db.projects.find((proyecto) => proyecto._id === proyectoId) || null;
}
