// services/member-service/repositories/memberRepository.js
//
// Capa de acceso a datos: los integrantes viven embebidos dentro del
// proyecto (proyecto.integrantes), en el mismo almacenamiento local
// (lib/localStore.js) que usa el Project Service. No contiene reglas de negocio.

import { db, generarId } from "@/lib/localStore";

export async function obtenerProyecto(proyectoId) {
  return db.projects.find((proyecto) => proyecto._id === proyectoId) || null;
}

/**
 * Agrega un integrante a un proyecto existente.
 * @param {string} proyectoId
 * @param {{ nombre: string, email: string, rol: string }} datos
 * @returns {Promise<object|null>} el integrante insertado, o null si el proyecto no existe
 */
export async function agregarIntegrante(proyectoId, { nombre, email, rol }) {
  const proyecto = db.projects.find((p) => p._id === proyectoId);
  if (!proyecto) return null;

  const integrante = {
    id: generarId(),
    nombre,
    email,
    rol,
    agregadoEn: new Date(),
  };

  proyecto.integrantes.push(integrante);
  proyecto.actualizadoEn = new Date();

  return integrante;
}

/**
 * Lista los integrantes de un proyecto.
 * @param {string} proyectoId
 * @returns {Promise<object[]|null>} null si el proyecto no existe
 */
export async function listarIntegrantes(proyectoId) {
  const proyecto = db.projects.find((p) => p._id === proyectoId);
  return proyecto ? proyecto.integrantes : null;
}
