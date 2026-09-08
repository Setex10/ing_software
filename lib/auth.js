// lib/auth.js
//
// SUPUESTO: el módulo de autenticación ya generó un JWT (firmado con JWT_SECRET)
// y lo guarda en una cookie httpOnly llamada "token" al hacer login.
// El middleware.js existente ya usa una verificación equivalente a esta para
// proteger rutas. Aquí exponemos la misma lógica como función reutilizable
// para poder usarla también dentro de los Route Handlers (API) del
// Project Service, sin duplicar el secreto ni la forma de leer la cookie.
//
// Si en tu módulo de auth el helper ya existe con otro nombre/ruta,
// simplemente reemplaza el cuerpo de getAuthUser por el import a ese helper.

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Extrae y valida el usuario autenticado a partir de la cookie httpOnly "token".
 * @param {Request} request - Request de un Route Handler de Next.js (App Router)
 * @returns {{ userId: string, correo?: string } | null} el payload del usuario o null si no hay sesión válida
 */
export function getAuthUser(request) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) return null;

    const payload = jwt.verify(token, JWT_SECRET);

    // Se espera que el módulo de auth firme el JWT con al menos { userId }.
    // Ajusta el nombre del campo si en tu implementación se llama distinto (ej. sub, id).
    if (!payload?.userId) return null;

    return payload;
  } catch (err) {
    // Token inválido, expirado o mal formado -> no hay sesión válida
    return null;
  }
}
