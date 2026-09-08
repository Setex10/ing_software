// services/project-service/services/projectService.js
//
// Reglas de negocio del Project Service: validación de datos, creación
// del proyecto con el creador como responsable/integrante, listado de
// proyectos del usuario y cálculo de porcentaje de avance.

import { ObjectId } from "mongodb";
import { validateProjectInput } from "../models/Project.js";
import {
  crearProyecto as crearProyectoRepo,
  listarProyectosPorUsuario,
  getDbHandle,
} from "../repositories/projectRepository.js";

/**
 * Crea un proyecto para el usuario autenticado.
 * @param {string} userId - id del usuario autenticado (del JWT, nunca del body)
 * @param {any} inputData - datos crudos del body (nombre, descripcion, fechaLimite)
 * @returns {Promise<{ ok: true, proyecto: object } | { ok: false, status: number, errors: string[] }>}
 */
export async function crearProyectoParaUsuario(userId, inputData) {
  if (!userId || !ObjectId.isValid(userId)) {
    return { ok: false, status: 401, errors: ["Sesión inválida."] };
  }

  const { valid, errors, sanitized } = validateProjectInput(inputData);

  if (!valid) {
    return { ok: false, status: 400, errors };
  }

  const creadorId = new ObjectId(userId);

  const proyecto = await crearProyectoRepo({
    nombre: sanitized.nombre,
    descripcion: sanitized.descripcion,
    fechaLimite: sanitized.fechaLimite,
    creadorId,
  });

  return { ok: true, proyecto };
}

/**
 * Lista los proyectos del usuario autenticado (como creador o integrante),
 * cada uno con su porcentaje de avance calculado.
 * @param {string} userId
 * @returns {Promise<{ ok: true, proyectos: object[] } | { ok: false, status: number, errors: string[] }>}
 */
export async function listarProyectosDeUsuario(userId) {
  if (!userId || !ObjectId.isValid(userId)) {
    return { ok: false, status: 401, errors: ["Sesión inválida."] };
  }

  const idUsuario = new ObjectId(userId);
  const proyectos = await listarProyectosPorUsuario(idUsuario);

  const proyectosConAvance = await Promise.all(
    proyectos.map(async (proyecto) => {
      const porcentajeAvance = await calcularAvance(proyecto._id);
      return {
        _id: proyecto._id,
        nombre: proyecto.nombre,
        descripcion: proyecto.descripcion,
        fechaLimite: proyecto.fechaLimite,
        creadorId: proyecto.creadorId,
        integrantes: proyecto.integrantes,
        porcentajeAvance,
      };
    })
  );

  return { ok: true, proyectos: proyectosConAvance };
}

/**
 * Calcula el porcentaje de avance de un proyecto: (tareas completadas / tareas totales) * 100.
 *
 * El módulo de Tareas (HU4a–HU4e) todavía no existe, así que la colección
 * "tasks" puede no existir todavía. Esta función está preparada para
 * funcionar de forma segura en ambos casos:
 *   - Si "tasks" no existe o no hay tareas para el proyecto -> devuelve 0.
 *   - Cuando exista "tasks" con documentos { proyectoId, estado }, el
 *     cálculo ya queda listo para usarlos sin cambios en la firma de la función.
 *
 * Contrato esperado de la futura colección "tasks":
 *   { _id, proyectoId: ObjectId, estado: "pendiente" | "en_progreso" | "completada", ... }
 *
 * @param {import("mongodb").ObjectId} proyectoId
 * @returns {Promise<number>} entero entre 0 y 100
 */
export async function calcularAvance(proyectoId) {
  try {
    const db = await getDbHandle();

    // Verificamos si la colección "tasks" ya existe antes de consultarla,
    // para no romper nada mientras el módulo de Tareas no esté implementado.
    const colecciones = await db
      .listCollections({ name: "tasks" }, { nameOnly: true })
      .toArray();

    const existeColeccionTasks = colecciones.length > 0;

    if (!existeColeccionTasks) {
      return 0;
    }

    // --- Cálculo real, listo para cuando exista la colección "tasks" ---
    const totalTareas = await db
      .collection("tasks")
      .countDocuments({ proyectoId });

    if (totalTareas === 0) {
      return 0;
    }

    const tareasCompletadas = await db
      .collection("tasks")
      .countDocuments({ proyectoId, estado: "completada" });

    return Math.round((tareasCompletadas / totalTareas) * 100);
  } catch (err) {
    // Cualquier error inesperado en el cálculo de avance no debe tumbar
    // la consulta de proyectos: se degrada a 0% de forma segura.
    return 0;
  }
}
