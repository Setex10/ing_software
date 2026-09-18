// lib/sessionCookie.js
//
// Nombre y duración de la cookie de sesión, en un archivo aparte para que
// middleware.js (que corre en Edge Runtime) los pueda usar sin tener que
// cargar jsonwebtoken, que depende de APIs de Node no soportadas en Edge.

export const SESSION_COOKIE_NAME = "token";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;
