import { db } from "@/lib/localStore";
import { crearProyecto } from "@/services/project-service/repositories/projectRepository";
import { agregarIntegranteAProyecto, listarIntegrantesDeProyecto } from "./memberService";

beforeEach(() => {
  db.projects.length = 0;
});

async function crearProyectoDePrueba(creadorId = "u1") {
  return crearProyecto({ nombre: "P", descripcion: "d", fechaLimite: new Date(), creadorId });
}

describe("agregarIntegranteAProyecto", () => {
  test("404 si el proyecto no existe", async () => {
    const result = await agregarIntegranteAProyecto("u1", "no-existe", { nombre: "Ana" });
    expect(result.ok).toBe(false);
    expect(result.status).toBe(404);
  });

  test("403 si el usuario no es el creador del proyecto", async () => {
    const proyecto = await crearProyectoDePrueba("u1");
    const result = await agregarIntegranteAProyecto("u2", proyecto._id, { nombre: "Ana" });
    expect(result.ok).toBe(false);
    expect(result.status).toBe(403);
  });

  test("400 si el nombre es inválido", async () => {
    const proyecto = await crearProyectoDePrueba("u1");
    const result = await agregarIntegranteAProyecto("u1", proyecto._id, { nombre: "  " });
    expect(result.ok).toBe(false);
    expect(result.status).toBe(400);
  });

  test("agrega el integrante cuando todo es válido", async () => {
    const proyecto = await crearProyectoDePrueba("u1");
    const result = await agregarIntegranteAProyecto("u1", proyecto._id, { nombre: "Ana", email: "a@x.com", rol: "Dev" });

    expect(result.ok).toBe(true);
    expect(result.integrante.nombre).toBe("Ana");
  });
});

describe("listarIntegrantesDeProyecto", () => {
  test("404 si el proyecto no existe", async () => {
    const result = await listarIntegrantesDeProyecto("u1", "no-existe");
    expect(result.status).toBe(404);
  });

  test("403 si el usuario no es el creador", async () => {
    const proyecto = await crearProyectoDePrueba("u1");
    const result = await listarIntegrantesDeProyecto("u2", proyecto._id);
    expect(result.status).toBe(403);
  });

  test("devuelve la lista de integrantes del creador", async () => {
    const proyecto = await crearProyectoDePrueba("u1");
    await agregarIntegranteAProyecto("u1", proyecto._id, { nombre: "Ana" });

    const result = await listarIntegrantesDeProyecto("u1", proyecto._id);
    expect(result.ok).toBe(true);
    expect(result.integrantes).toHaveLength(1);
  });
});
