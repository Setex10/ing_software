import { requireAuthUser, parseJsonBody, jsonFromResult } from "./httpController";

describe("requireAuthUser", () => {
  it("devuelve una respuesta 401 si no hay usuario", async () => {
    const res = requireAuthUser(null);
    expect(res).not.toBeNull();
    expect(res.status).toBe(401);
    expect((await res.json()).error).toBe("No autenticado.");
  });

  it("devuelve null si hay usuario", () => {
    expect(requireAuthUser({ userId: "u1" })).toBeNull();
  });
});

describe("parseJsonBody", () => {
  it("devuelve el body cuando el JSON es válido", async () => {
    const request = { json: () => Promise.resolve({ a: 1 }) };
    const { body, response } = await parseJsonBody(request);
    expect(response).toBeUndefined();
    expect(body).toEqual({ a: 1 });
  });

  it("devuelve una respuesta 400 cuando el JSON es inválido", async () => {
    const request = { json: () => Promise.reject(new Error("bad json")) };
    const { body, response } = await parseJsonBody(request);
    expect(body).toBeUndefined();
    expect(response.status).toBe(400);
    expect((await response.json()).error).toBe(
      "El cuerpo de la petición no es un JSON válido."
    );
  });
});

describe("jsonFromResult", () => {
  it("devuelve el error con su status si ok=false", async () => {
    const result = { ok: false, errors: ["a", "b"], status: 422 };
    const res = jsonFromResult(result, "proyecto", 201);
    expect(res.status).toBe(422);
    expect((await res.json()).error).toBe("a b");
  });

  it("devuelve el dato bajo dataKey con successStatus si ok=true", async () => {
    const result = { ok: true, proyecto: { id: "p1" } };
    const res = jsonFromResult(result, "proyecto", 201);
    expect(res.status).toBe(201);
    expect((await res.json()).proyecto).toEqual({ id: "p1" });
  });
});
