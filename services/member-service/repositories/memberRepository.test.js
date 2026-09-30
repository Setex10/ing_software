import { db } from "@/lib/localStore";
import { crearProyecto } from "@/services/project-service/repositories/projectRepository";
import { obtenerProyecto, agregarIntegrante, listarIntegrantes } from "./memberRepository";

beforeEach(() => {
  db.projects.length = 0;
});

describe("memberRepository", () => {
  test("obtenerProyecto encuentra o no el proyecto", async () => {
    const proyecto = await crearProyecto({ nombre: "P", descripcion: "d", fechaLimite: new Date(), creadorId: "u1" });

    expect((await obtenerProyecto(proyecto._id))._id).toBe(proyecto._id);
    expect(await obtenerProyecto("no-existe")).toBeNull();
  });

  test("agregarIntegrante devuelve null si el proyecto no existe", async () => {
    expect(await agregarIntegrante("no-existe", { nombre: "Ana", email: "", rol: "" })).toBeNull();
  });

  test("agregarIntegrante agrega el integrante al proyecto", async () => {
    const proyecto = await crearProyecto({ nombre: "P", descripcion: "d", fechaLimite: new Date(), creadorId: "u1" });

    const integrante = await agregarIntegrante(proyecto._id, { nombre: "Ana", email: "ana@x.com", rol: "Dev" });

    expect(integrante.id).toBeTruthy();
    expect(integrante.agregadoEn).toBeInstanceOf(Date);
    expect(proyecto.integrantes).toHaveLength(1);
    expect(proyecto.integrantes[0].nombre).toBe("Ana");
  });

  test("listarIntegrantes devuelve null si el proyecto no existe, o la lista si existe", async () => {
    const proyecto = await crearProyecto({ nombre: "P", descripcion: "d", fechaLimite: new Date(), creadorId: "u1" });
    await agregarIntegrante(proyecto._id, { nombre: "Ana", email: "", rol: "" });

    expect(await listarIntegrantes("no-existe")).toBeNull();
    expect(await listarIntegrantes(proyecto._id)).toHaveLength(1);
  });
});
