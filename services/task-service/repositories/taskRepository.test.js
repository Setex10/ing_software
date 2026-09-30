import { db } from "@/lib/localStore";
import {
  crearTarea,
  listarTareasPorProyecto,
  obtenerTarea,
  actualizarTarea,
  eliminarTarea,
} from "./taskRepository";

beforeEach(() => {
  db.tasks.length = 0;
});

describe("taskRepository", () => {
  test("crearTarea usa responsableId null por defecto y estado pendiente", async () => {
    const tarea = await crearTarea({ proyectoId: "p1", titulo: "T", descripcion: "D" });

    expect(tarea.responsableId).toBeNull();
    expect(tarea.estado).toBe("pendiente");
    expect(db.tasks).toHaveLength(1);
  });

  test("crearTarea respeta el responsableId explícito", async () => {
    const tarea = await crearTarea({ proyectoId: "p1", titulo: "T", descripcion: "D", responsableId: "i1" });
    expect(tarea.responsableId).toBe("i1");
  });

  test("listarTareasPorProyecto filtra por proyectoId", async () => {
    await crearTarea({ proyectoId: "p1", titulo: "A", descripcion: "d" });
    await crearTarea({ proyectoId: "p2", titulo: "B", descripcion: "d" });

    expect(await listarTareasPorProyecto("p1")).toHaveLength(1);
  });

  test("obtenerTarea exige coincidencia de proyectoId y tareaId", async () => {
    const tarea = await crearTarea({ proyectoId: "p1", titulo: "A", descripcion: "d" });

    expect(await obtenerTarea("p1", tarea._id)).not.toBeNull();
    expect(await obtenerTarea("otro-proyecto", tarea._id)).toBeNull();
    expect(await obtenerTarea("p1", "id-inexistente")).toBeNull();
  });

  test("actualizarTarea devuelve null si la tarea no existe", async () => {
    expect(await actualizarTarea("p1", "no-existe", { estado: "completada" })).toBeNull();
  });

  test("actualizarTarea aplica solo los cambios provistos", async () => {
    const tarea = await crearTarea({ proyectoId: "p1", titulo: "A", descripcion: "d", responsableId: "i1" });

    const actualizada = await actualizarTarea("p1", tarea._id, { estado: "completada" });
    expect(actualizada.estado).toBe("completada");
    expect(actualizada.responsableId).toBe("i1"); // no se tocó

    const desasignada = await actualizarTarea("p1", tarea._id, { responsableId: null });
    expect(desasignada.responsableId).toBeNull();
    expect(desasignada.estado).toBe("completada"); // no se tocó
  });

  test("eliminarTarea devuelve false si no existe, true y la quita si existe", async () => {
    const tarea = await crearTarea({ proyectoId: "p1", titulo: "A", descripcion: "d" });

    expect(await eliminarTarea("p1", "no-existe")).toBe(false);
    expect(await eliminarTarea("p1", tarea._id)).toBe(true);
    expect(db.tasks).toHaveLength(0);
  });
});
