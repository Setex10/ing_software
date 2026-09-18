// services/member-service/models/Member.js
//
// Define la "forma" de un integrante dentro de un proyecto y valida los
// datos de entrada para agregarlo.

/**
 * Estructura esperada de un integrante dentro de proyecto.integrantes:
 * {
 *   id: string,
 *   nombre: string,
 *   email: string,
 *   rol: string,
 *   agregadoEn: Date
 * }
 */

/**
 * Valida y sanitiza los datos de entrada para agregar un integrante.
 * Solo el nombre es obligatorio (HU: "No se permiten nombres vacíos.");
 * email y rol son datos básicos opcionales.
 *
 * @param {any} data - body crudo recibido en la request
 * @returns {{ valid: boolean, errors: string[], sanitized: { nombre: string, email: string, rol: string } | null }}
 */
export function validateMemberInput(data) {
  const errors = [];

  const nombre = typeof data?.nombre === "string" ? data.nombre.trim() : "";
  const email = typeof data?.email === "string" ? data.email.trim() : "";
  const rol = typeof data?.rol === "string" ? data.rol.trim() : "";

  if (!nombre) {
    errors.push("El nombre del integrante es obligatorio.");
  }

  if (errors.length > 0) {
    return { valid: false, errors, sanitized: null };
  }

  return { valid: true, errors: [], sanitized: { nombre, email, rol } };
}
