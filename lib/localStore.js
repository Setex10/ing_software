// lib/localStore.js
//
// Almacenamiento 100% local, dentro del propio código (sin base de datos
// externa como MongoDB). Los datos viven en memoria mientras el proceso de
// Next.js esté corriendo: es el reemplazo intencional de la base de datos
// para esta simulación del sistema.
//
// Se guarda en "globalThis" (mismo patrón que usaba lib/mongodb.js para el
// cliente de Mongo) para que sobreviva a las recompilaciones on-demand de
// "next dev": cada ruta nueva que se visita por primera vez se compila por
// separado, y sin este anclaje al objeto global cada una obtendría su
// propia copia vacía de "db", perdiendo los datos ya creados.

import { randomUUID } from "crypto";

if (!globalThis.__localStore) {
  globalThis.__localStore = {
    projects: [],
    tasks: [],
  };
}

export const db = globalThis.__localStore;

export function generarId() {
  return randomUUID();
}
