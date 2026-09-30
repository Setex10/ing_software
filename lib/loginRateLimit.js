// lib/loginRateLimit.js
//
// Límite de intentos de login en memoria (por correo), para mitigar ataques
// de fuerza bruta contra el endpoint de autenticación. Igual que el resto
// del almacenamiento del proyecto, vive en memoria y se ancla a globalThis
// para sobrevivir a las recompilaciones de "next dev".

const MAX_INTENTOS = 5;
const VENTANA_MS = 10 * 60 * 1000; // 10 minutos

if (!globalThis.__loginAttempts) {
  globalThis.__loginAttempts = new Map();
}

const intentos = globalThis.__loginAttempts;

function normalizar(email) {
  return String(email || "").trim().toLowerCase();
}

/**
 * Indica si un correo está bloqueado por demasiados intentos fallidos
 * recientes, y cuántos segundos faltan para poder reintentar.
 * @param {string} email
 * @returns {{ bloqueado: boolean, segundosRestantes: number }}
 */
export function estaBloqueado(email) {
  const registro = intentos.get(normalizar(email));
  if (!registro || registro.count < MAX_INTENTOS) {
    return { bloqueado: false, segundosRestantes: 0 };
  }

  const transcurrido = Date.now() - registro.primerIntento;
  if (transcurrido >= VENTANA_MS) {
    intentos.delete(normalizar(email));
    return { bloqueado: false, segundosRestantes: 0 };
  }

  return {
    bloqueado: true,
    segundosRestantes: Math.ceil((VENTANA_MS - transcurrido) / 1000),
  };
}

/**
 * Registra un intento de login fallido para ese correo.
 * @param {string} email
 */
export function registrarIntentoFallido(email) {
  const key = normalizar(email);
  const registro = intentos.get(key);

  if (!registro || Date.now() - registro.primerIntento >= VENTANA_MS) {
    intentos.set(key, { count: 1, primerIntento: Date.now() });
    return;
  }

  registro.count += 1;
}

/**
 * Limpia los intentos fallidos de un correo (tras un login exitoso).
 * @param {string} email
 */
export function limpiarIntentos(email) {
  intentos.delete(normalizar(email));
}
