import { db } from "@/lib/localStore";
import { crearProyecto } from "@/services/project-service/repositories/projectRepository";
import { agregarIntegrante } from "@/services/member-service/repositories/memberRepository";
import {
  crearTareaParaProyecto,
  listarTareasDeProyecto,
  actualizarTareaDeProyecto,
  eliminarTareaDeProyecto,
} from "./taskService";

beforeEach(() => {
  db.projects.length = 0;
  db.tasks.length = 0;
});

async function crearProyectoConIntegrante(creadorId = "u1") {
  const proyecto = await crearProyecto({ nombre: "P", descripcion: "d", fechaLimite: new Date(), creadorId });
  const integrante = await agregarIntegrante(proyecto._id, { nombre: "Ana", email: "", rol: "" });
  return { proyecto, integrante };
}

describe("crearTareaParaProyecto", () => {
  test("404 si el proyecto no existe", async () => {
    const result = await crearTareaParaProyecto("u1", "no-existe", { titulo: "T", descripcion: "D" });
    expect(result.status).toBe(404);
  });

  test("403 si el usuario no es el creador", async () => {
    const { proyecto } = await crearProyectoConIntegrante("u1");
    const result = await crearTareaParaProyecto("u2", proyecto._id, { titulo: "T", descripcion: "D" });
    expect(result.status).toBe(403);
  });

  test("400 si faltan título o descripción", async () => {
    const { proyecto } = await crearProyectoConIntegrante("u1");
    const result = await crearTareaParaProyecto("u1", proyecto._id, { titulo: "" });
    expect(result.status).toBe(400);
  });

  test("400 si el responsable no pertenece al proyecto", async () => {
    const { proyecto } = await crearProyectoConIntegrante("u1");
    const result = await crearTareaParaProyecto("u1", proyecto._id, {
      titulo: "T",
      descripcion: "D",
      responsableId: "integrante-inexistente",
    });
    expect(result.status).toBe(400);
    expect(result.errors[0]).toMatch(/no existe en este proyecto/);
  });

  test("crea la tarea y resuelve el nombre del responsable", async () => {
    const { proyecto, integrante } = await crearProyectoConIntegrante("u1");
    const result = await crearTareaParaProyecto("u1", proyecto._id, {
      titulo: "T",
      descripcion: "D",
      responsableId: integrante.id,
    });

    expect(result.ok).toBe(true);
    expect(result.tarea.responsableNombre).toBe("Ana");
    expect(result.tarea.estado).toBe("pendiente");
  });

  test("crea la tarea sin responsable asignado", async () => {
    const { proyecto } = await crearProyectoConIntegrante("u1");
    const result = await crearTareaParaProyecto("u1", proyecto._id, { titulo: "T", descripcion: "D" });

    expect(result.ok).toBe(true);
    expect(result.tarea.responsableNombre).toBeNull();
  });
});

describe("listarTareasDeProyecto", () => {
  test("controla acceso igual que crear (404/403)", async () => {
    const { proyecto } = await crearProyectoConIntegrante("u1");
    expect((await listarTareasDeProyecto("u1", "no-existe")).status).toBe(404);
    expect((await listarTareasDeProyecto("u2", proyecto._id)).status).toBe(403);
  });

  test("enriquece cada tarea con el nombre del responsable", async () => {
    const { proyecto, integrante } = await crearProyectoConIntegrante("u1");
    await crearTareaParaProyecto("u1", proyecto._id, { titulo: "T1", descripcion: "D", responsableId: integrante.id });
    await crearTareaParaProyecto("u1", proyecto._id, { titulo: "T2", descripcion: "D" });

    const result = await listarTareasDeProyecto("u1", proyecto._id);
    expect(result.ok).toBe(true);
    expect(result.tareas).toHaveLength(2);
    expect(result.tareas.find((t) => t.titulo === "T1").responsableNombre).toBe("Ana");
    expect(result.tareas.find((t) => t.titulo === "T2").responsableNombre).toBeNull();
  });
});

describe("actualizarTareaDeProyecto", () => {
  test("404 si el proyecto no existe", async () => {
    const result = await actualizarTareaDeProyecto("u1", "no-existe", "t1", { estado: "completada" });
    expect(result.status).toBe(404);
  });

  test("403 si el usuario no es el creador", async () => {
    const { proyecto } = await crearProyectoConIntegrante("u1");
    const { tarea } = await crearTareaParaProyecto("u1", proyecto._id, { titulo: "T", descripcion: "D" });

    const result = await actualizarTareaDeProyecto("u2", proyecto._id, tarea._id, { estado: "completada" });
    expect(result.status).toBe(403);
  });

  test("404 si la tarea no existe dentro del proyecto", async () => {
    const { proyecto } = await crearProyectoConIntegrante("u1");
    const result = await actualizarTareaDeProyecto("u1", proyecto._id, "no-existe", { estado: "completada" });
    expect(result.status).toBe(404);
  });

  test("400 si el estado no es válido", async () => {
    const { proyecto } = await crearProyectoConIntegrante("u1");
    const { tarea } = await crearTareaParaProyecto("u1", proyecto._id, { titulo: "T", descripcion: "D" });

    const result = await actualizarTareaDeProyecto("u1", proyecto._id, tarea._id, { estado: "no-valido" });
    expect(result.status).toBe(400);
  });

  test("400 si el nuevo responsable no pertenece al proyecto", async () => {
    const { proyecto } = await crearProyectoConIntegrante("u1");
    const { tarea } = await crearTareaParaProyecto("u1", proyecto._id, { titulo: "T", descripcion: "D" });

    const result = await actualizarTareaDeProyecto("u1", proyecto._id, tarea._id, {
      responsableId: "no-existe",
    });
    expect(result.status).toBe(400);
  });

  test("actualiza el estado correctamente", async () => {
    const { proyecto } = await crearProyectoConIntegrante("u1");
    const { tarea } = await crearTareaParaProyecto("u1", proyecto._id, { titulo: "T", descripcion: "D" });

    const result = await actualizarTareaDeProyecto("u1", proyecto._id, tarea._id, { estado: "en_progreso" });
    expect(result.ok).toBe(true);
    expect(result.tarea.estado).toBe("en_progreso");
  });

  test("permite desasignar el responsable con responsableId null", async () => {
    const { proyecto, integrante } = await crearProyectoConIntegrante("u1");
    const { tarea } = await crearTareaParaProyecto("u1", proyecto._id, {
      titulo: "T",
      descripcion: "D",
      responsableId: integrante.id,
    });

    const result = await actualizarTareaDeProyecto("u1", proyecto._id, tarea._id, { responsableId: null });
    expect(result.ok).toBe(true);
    expect(result.tarea.responsableNombre).toBeNull();
  });
});

describe("eliminarTareaDeProyecto", () => {
  test("404 si el proyecto no existe", async () => {
    const result = await eliminarTareaDeProyecto("u1", "no-existe", "t1");
    expect(result.status).toBe(404);
  });

  test("403 si el usuario no es el creador", async () => {
    const { proyecto } = await crearProyectoConIntegrante("u1");
    const { tarea } = await crearTareaParaProyecto("u1", proyecto._id, { titulo: "T", descripcion: "D" });

    const result = await eliminarTareaDeProyecto("u2", proyecto._id, tarea._id);
    expect(result.status).toBe(403);
  });

  test("404 si la tarea no existe", async () => {
    const { proyecto } = await crearProyectoConIntegrante("u1");
    const result = await eliminarTareaDeProyecto("u1", proyecto._id, "no-existe");
    expect(result.status).toBe(404);
  });

  test("elimina la tarea del creador", async () => {
    const { proyecto } = await crearProyectoConIntegrante("u1");
    const { tarea } = await crearTareaParaProyecto("u1", proyecto._id, { titulo: "T", descripcion: "D" });

    const result = await eliminarTareaDeProyecto("u1", proyecto._id, tarea._id);
    expect(result.ok).toBe(true);
    expect(db.tasks).toHaveLength(0);
  });
});
