import { db } from "@/lib/localStore";
import {
  crearProyecto,
  listarProyectosPorUsuario,
  obtenerProyectoPorId,
} from "./projectRepository";

beforeEach(() => {
  db.projects.length = 0;
  db.tasks.length = 0;
});

describe("projectRepository", () => {
  test("crearProyecto inserta un proyecto con integrantes vacíos y fechas", async () => {
    const proyecto = await crearProyecto({
      nombre: "Proyecto A",
      descripcion: "Desc",
      fechaLimite: new Date("2026-01-01"),
      creadorId: "u1",
    });

    expect(proyecto._id).toBeTruthy();
    expect(proyecto.integrantes).toEqual([]);
    expect(proyecto.creadoEn).toBeInstanceOf(Date);
    expect(db.projects).toHaveLength(1);
  });

  test("listarProyectosPorUsuario solo devuelve los del creador, ordenados por fecha", async () => {
    await crearProyecto({ nombre: "B", descripcion: "d", fechaLimite: new Date("2026-06-01"), creadorId: "u1" });
    await crearProyecto({ nombre: "A", descripcion: "d", fechaLimite: new Date("2026-01-01"), creadorId: "u1" });
    await crearProyecto({ nombre: "Otro", descripcion: "d", fechaLimite: new Date("2026-01-01"), creadorId: "u2" });

    const proyectos = await listarProyectosPorUsuario("u1");

    expect(proyectos).toHaveLength(2);
    expect(proyectos[0].nombre).toBe("A");
    expect(proyectos[1].nombre).toBe("B");
  });

  test("obtenerProyectoPorId devuelve el proyecto o null", async () => {
    const creado = await crearProyecto({ nombre: "A", descripcion: "d", fechaLimite: new Date(), creadorId: "u1" });

    expect((await obtenerProyectoPorId(creado._id))._id).toBe(creado._id);
    expect(await obtenerProyectoPorId("id-inexistente")).toBeNull();
  });
});
