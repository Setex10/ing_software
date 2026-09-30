// lib/httpController.js
//
// Helpers HTTP compartidos por los controladores de los 3 módulos de
// negocio (project/member/task-service). Extraídos tras un hallazgo real
// de duplicación de código tomado con jscpd (~12% de líneas duplicadas
// entre los tres controladores): cada uno repetía el mismo chequeo de
// autenticación, el mismo parseo de body y el mismo mapeo de resultado de
// servicio a respuesta HTTP.

import { NextResponse } from "next/server";

/**
 * @param {{ userId: string } | null} user - resultado de getAuthUser(request)
 * @returns {import("next/server").NextResponse | null} respuesta 401 si no
 *   hay usuario autenticado, o null si puede continuar.
 */
export function requireAuthUser(user) {
  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }
  return null;
}

/**
 * Parsea el body JSON de la petición.
 * @param {Request} request
 * @returns {Promise<{ body: any } | { response: import("next/server").NextResponse }>}
 */
export async function parseJsonBody(request) {
  try {
    return { body: await request.json() };
  } catch (err) {
    return {
      response: NextResponse.json(
        { error: "El cuerpo de la petición no es un JSON válido." },
        { status: 400 }
      ),
    };
  }
}

/**
 * Traduce el resultado uniforme de los *Service ({ ok, errors, status, ... })
 * a una respuesta HTTP: error con su status si ok=false, o el dato bajo
 * `dataKey` con `successStatus` si ok=true.
 * @param {{ ok: boolean, errors?: string[], status?: number }} result
 * @param {string} dataKey - propiedad de `result` a devolver (coincide con
 *   la clave del JSON de respuesta, p. ej. "proyecto", "integrantes").
 * @param {number} successStatus
 */
export function jsonFromResult(result, dataKey, successStatus = 200) {
  if (!result.ok) {
    return NextResponse.json({ error: result.errors.join(" ") }, { status: result.status });
  }
  return NextResponse.json({ [dataKey]: result[dataKey] }, { status: successStatus });
}
