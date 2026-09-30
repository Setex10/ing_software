// lib/auth.js
//
// Autenticación local para la simulación: sin servicio externo ni base de
// datos de sesiones. El "login" firma un JWT y lo guarda en una cookie
// httpOnly; este archivo centraliza cómo se firma y cómo se verifica ese
// token, para usarlo tanto en el middleware como en los Route Handlers (API).

import jwt from "jsonwebtoken";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/sessionCookie";

// El secreto se toma de la variable de entorno JWT_SECRET (ver .env.example).
// Si no está definida se usa un valor de desarrollo, y se avisa en consola
// para que nunca pase inadvertido en un despliegue real.
const DEV_FALLBACK_SECRET = "ing-software-demo-secret-local";
const JWT_SECRET = process.env.JWT_SECRET || DEV_FALLBACK_SECRET;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h";

if (!process.env.JWT_SECRET && process.env.NODE_ENV !== "test") {
  console.warn(
    "[auth] JWT_SECRET no está definida en el entorno; usando un secreto de " +
      "desarrollo. Define JWT_SECRET antes de desplegar (ver .env.example)."
  );
}

export { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS };

/**
 * Firma un token de sesión para el usuario autenticado.
 * @param {{ id: string, nombre: string, email: string, rol: string }} usuario
 */
export function crearTokenSesion(usuario) {
  return jwt.sign(
    { userId: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
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
    // Token inválido, expirado o mal formado -> no hay sesión válida.
    // Se deja constancia en consola (nivel debug) para diagnóstico, sin
    // tratarlo como error de servidor: es un caso esperado (token vencido).
    console.debug("[auth] token de sesión inválido:", err.message);
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

/**
 * Indica si el usuario autenticado tiene rol de administrador.
 * @param {{ rol?: string } | null} user - el payload devuelto por getAuthUser
 */
export function esAdmin(user) {
  return user?.rol === "admin";
}
