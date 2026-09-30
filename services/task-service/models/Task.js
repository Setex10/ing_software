// services/task-service/models/Task.js
//
// Define la "forma" de una tarea y valida los datos de entrada para crearla.

/**
 * Estructura esperada de un documento en la colección "tasks":
 * {
 *   _id: string,
 *   proyectoId: string,
 *   titulo: string,
 *   descripcion: string,
 *   estado: "pendiente" | "en_progreso" | "completada",
 *   responsableId: string | null,
 *   creadoEn: Date
 * }
 */

/**
 * Valida y sanitiza los datos de entrada para crear una tarea.
 * HU: "No se permiten tareas sin título."
 * El responsable es opcional aquí: si viene, la pertenencia al proyecto se
 * valida en el service (necesita la lista de integrantes del proyecto).
 *
 * @param {any} data - body crudo recibido en la request
 * @returns {{ valid: boolean, errors: string[], sanitized: { titulo: string, descripcion: string, responsableId: string | null } | null }}
 */
export function validateTaskInput(data) {
  const errors = [];

  const titulo = typeof data?.titulo === "string" ? data.titulo.trim() : "";
  const descripcion =
    typeof data?.descripcion === "string" ? data.descripcion.trim() : "";
  const responsableId =
    typeof data?.responsableId === "string" && data.responsableId.trim()
      ? data.responsableId.trim()
      : null;

  if (!titulo) {
    errors.push("El título de la tarea es obligatorio.");
  }

  if (!descripcion) {
    errors.push("La descripción de la tarea es obligatoria.");
  }

  if (errors.length > 0) {
    return { valid: false, errors, sanitized: null };
  }

  return { valid: true, errors: [], sanitized: { titulo, descripcion, responsableId } };
}

export const ESTADOS_VALIDOS = ["pendiente", "en_progreso", "completada"];
