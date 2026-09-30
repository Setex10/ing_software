import { db } from "@/lib/localStore";
import {
  crearProyectoParaUsuario,
  listarProyectosDeUsuario,
  obtenerProyectoDeUsuario,
  calcularAvance,
} from "./projectService";

beforeEach(() => {
  db.projects.length = 0;
  db.tasks.length = 0;
});

describe("crearProyectoParaUsuario", () => {
  test("rechaza sin userId", async () => {
    const result = await crearProyectoParaUsuario(null, {});
    expect(result.ok).toBe(false);
    expect(result.status).toBe(401);
  });

  test("rechaza datos inválidos", async () => {
    const result = await crearProyectoParaUsuario("u1", { nombre: "" });
    expect(result.ok).toBe(false);
    expect(result.status).toBe(400);
  });

  test("crea el proyecto con el creadorId de la sesión, no del body", async () => {
    const result = await crearProyectoParaUsuario("u1", {
      nombre: "Proyecto",
      descripcion: "Desc",
      fechaLimite: "2026-12-31",
      creadorId: "otro-usuario-inyectado",
    });

    expect(result.ok).toBe(true);
    expect(result.proyecto.creadorId).toBe("u1");
  });
});

describe("listarProyectosDeUsuario", () => {
  test("rechaza sin userId", async () => {
    const result = await listarProyectosDeUsuario(null);
    expect(result.ok).toBe(false);
    expect(result.status).toBe(401);
  });

  test("incluye conteos de integrantes/tareas y % de avance", async () => {
    const { proyecto } = await crearProyectoParaUsuario("u1", {
      nombre: "P",
      descripcion: "D",
      fechaLimite: "2026-12-31",
    });
    proyecto.integrantes.push({ id: "i1", nombre: "Ana" });
    db.tasks.push(
      { _id: "t1", proyectoId: proyecto._id, estado: "completada" },
      { _id: "t2", proyectoId: proyecto._id, estado: "pendiente" }
    );

    const result = await listarProyectosDeUsuario("u1");

    expect(result.ok).toBe(true);
    expect(result.proyectos).toHaveLength(1);
    expect(result.proyectos[0].totalIntegrantes).toBe(1);
    expect(result.proyectos[0].totalTareas).toBe(2);
    expect(result.proyectos[0].tareasCompletadas).toBe(1);
    expect(result.proyectos[0].porcentajeAvance).toBe(50);
  });

  test("un proyecto sin tareas tiene 0% de avance", async () => {
    await crearProyectoParaUsuario("u1", { nombre: "P", descripcion: "D", fechaLimite: "2026-12-31" });

    const result = await listarProyectosDeUsuario("u1");
    expect(result.proyectos[0].porcentajeAvance).toBe(0);
  });
});

describe("obtenerProyectoDeUsuario", () => {
  test("rechaza sin userId", async () => {
    const result = await obtenerProyectoDeUsuario(null, "algo");
    expect(result.status).toBe(401);
  });

  test("devuelve 404 si el proyecto no existe", async () => {
    const result = await obtenerProyectoDeUsuario("u1", "id-inexistente");
    expect(result.ok).toBe(false);
    expect(result.status).toBe(404);
  });

  test("devuelve 404 si el usuario no es el creador", async () => {
    const { proyecto } = await crearProyectoParaUsuario("u1", {
      nombre: "P",
      descripcion: "D",
      fechaLimite: "2026-12-31",
    });

    const result = await obtenerProyectoDeUsuario("u2", proyecto._id);
    expect(result.ok).toBe(false);
    expect(result.status).toBe(404);
  });

  test("devuelve el proyecto con su avance para el creador", async () => {
    const { proyecto } = await crearProyectoParaUsuario("u1", {
      nombre: "P",
      descripcion: "D",
      fechaLimite: "2026-12-31",
    });

    const result = await obtenerProyectoDeUsuario("u1", proyecto._id);
    expect(result.ok).toBe(true);
    expect(result.proyecto.porcentajeAvance).toBe(0);
  });
});

describe("calcularAvance", () => {
  test("redondea el porcentaje de tareas completadas", () => {
    db.tasks.push(
      { proyectoId: "p1", estado: "completada" },
      { proyectoId: "p1", estado: "completada" },
      { proyectoId: "p1", estado: "pendiente" }
    );

    expect(calcularAvance("p1")).toBe(67);
  });

  test("devuelve 0 si no hay tareas", () => {
    expect(calcularAvance("sin-tareas")).toBe(0);
  });
});
