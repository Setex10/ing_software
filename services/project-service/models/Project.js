// services/project-service/models/Project.js
//
// No usamos un ODM (mongoose); trabajamos con el driver nativo de MongoDB
// (igual que se asume para el resto del sistema). Este archivo define la
// "forma" del documento Proyecto y su validación de entrada, para mantener
// la consistencia del esquema aunque MongoDB no la imponga por sí solo.

/**
 * Estructura esperada de un documento en la colección "projects":
 * {
 *   _id: ObjectId,
 *   nombre: string,
 *   descripcion: string,
 *   fechaLimite: Date,
 *   creadorId: ObjectId,
 *   integrantes: ObjectId[],
 *   creadoEn: Date,
 *   actualizadoEn: Date
 * }
 */

/**
 * Valida y sanitiza los datos de entrada para crear un proyecto.
 * No confía en nada que no sea nombre/descripcion/fechaLimite: el resto
 * de los campos (creadorId, integrantes) se calculan siempre en el servicio.
 *
 * @param {any} data - body crudo recibido en la request
 * @returns {{ valid: boolean, errors: string[], sanitized: { nombre: string, descripcion: string, fechaLimite: Date } | null }}
 */
export function validateProjectInput(data) {
  const errors = [];

  const nombre = typeof data?.nombre === "string" ? data.nombre.trim() : "";
  const descripcion =
    typeof data?.descripcion === "string" ? data.descripcion.trim() : "";
  const fechaLimiteRaw = data?.fechaLimite;

  if (!nombre) {
    errors.push("El nombre del proyecto es obligatorio.");
  }

  if (!descripcion) {
    errors.push("La descripción del proyecto es obligatoria.");
  }

  let fechaLimite = null;
  if (!fechaLimiteRaw) {
    errors.push("La fecha límite es obligatoria.");
  } else {
    const parsed = new Date(fechaLimiteRaw);
    if (isNaN(parsed.getTime())) {
      errors.push("La fecha límite no es una fecha válida.");
    } else {
      fechaLimite = parsed;
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors, sanitized: null };
  }

  return {
    valid: true,
    errors: [],
    sanitized: { nombre, descripcion, fechaLimite },
  };
}
