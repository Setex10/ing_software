// lib/auth.js
//
// Autenticación local para la simulación: sin servicio externo ni base de
// datos de sesiones. El "login" firma un JWT (con un secreto fijo definido
// aquí mismo) y lo guarda en una cookie httpOnly; este archivo centraliza
// cómo se firma y cómo se verifica ese token, para usarlo tanto en el
// middleware como en los Route Handlers (API).

import jwt from "jsonwebtoken";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/sessionCookie";

const JWT_SECRET = "ing-software-demo-secret-local";
const EXPIRES_IN = "8h";

export { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS };

/**
 * Firma un token de sesión para el usuario autenticado.
 * @param {{ id: string, nombre: string, email: string }} usuario
 */
export function crearTokenSesion(usuario) {
  return jwt.sign(
    { userId: usuario.id, nombre: usuario.nombre, email: usuario.email },
    JWT_SECRET,
    { expiresIn: EXPIRES_IN }
  );
}

/**
 * Verifica un token de sesión y devuelve su payload, o null si no es válido.
 * @param {string} token
 */
export function verificarToken(token) {
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (!payload?.userId) return null;
    return payload;
  } catch (err) {
    // Token inválido, expirado o mal formado -> no hay sesión válida
    return null;
  }
}

/**
 * Extrae y valida el usuario autenticado a partir de la cookie httpOnly
 * "token" de un Request de un Route Handler de Next.js (App Router).
 * @param {Request} request
 * @returns {{ userId: string, nombre?: string, email?: string } | null}
 */
export function getAuthUser(request) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verificarToken(token);
}
