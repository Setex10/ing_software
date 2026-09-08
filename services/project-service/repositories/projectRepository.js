// services/project-service/repositories/projectRepository.js
//
// Capa de acceso a datos: única capa que habla directamente con MongoDB
// para la colección "projects". No contiene reglas de negocio.

import clientPromise from "@/lib/mongodb";

const COLLECTION = "projects";

async function getDb() {
  const client = await clientPromise;
  return client.db(); // usa la DB por defecto de la connection string, igual que el módulo de auth
}

/**
 * Inserta un nuevo proyecto ya validado y con creadorId confiable (nunca del cliente).
 * @param {{ nombre: string, descripcion: string, fechaLimite: Date, creadorId: ObjectId }} proyecto
 * @returns {Promise<object>} el documento insertado (con _id)
 */
export async function crearProyecto({ nombre, descripcion, fechaLimite, creadorId }) {
  const db = await getDb();
  const now = new Date();

  const doc = {
    nombre,
    descripcion,
    fechaLimite,
    creadorId,
    integrantes: [creadorId],
    creadoEn: now,
    actualizadoEn: now,
  };

  const result = await db.collection(COLLECTION).insertOne(doc);

  return { _id: result.insertedId, ...doc };
}

/**
 * Lista los proyectos donde el usuario es creador o integrante,
 * ordenados por fecha límite ascendente (la más próxima primero).
 * @param {ObjectId} userId
 * @returns {Promise<object[]>}
 */
export async function listarProyectosPorUsuario(userId) {
  const db = await getDb();

  return db
    .collection(COLLECTION)
    .find({
      $or: [{ creadorId: userId }, { integrantes: userId }],
    })
    .sort({ fechaLimite: 1 })
    .toArray();
}

/**
 * Obtiene un proyecto por su id. Útil para el cálculo de avance y para
 * futuras validaciones (ej. módulo de Integrantes/Tareas).
 * @param {ObjectId} proyectoId
 */
export async function obtenerProyectoPorId(proyectoId) {
  const db = await getDb();
  return db.collection(COLLECTION).findOne({ _id: proyectoId });
}

export async function getDbHandle() {
  // Expuesto para que la capa de services pueda consultar otras colecciones
  // (ej. "tasks" para el cálculo de avance) sin duplicar la conexión.
  return getDb();
}
