import { crearTokenSesion, verificarToken, getAuthUser, esAdmin, SESSION_COOKIE_NAME } from "./auth";

function fakeRequest(token) {
  return {
    cookies: {
      get: (name) => (name === SESSION_COOKIE_NAME && token ? { value: token } : undefined),
    },
  };
}

describe("lib/auth", () => {
  const usuario = { id: "u1", nombre: "Ana", email: "ana@x.com", rol: "admin" };

  test("crearTokenSesion + verificarToken hacen un round-trip correcto", () => {
    const token = crearTokenSesion(usuario);
    const payload = verificarToken(token);

    expect(payload.userId).toBe(usuario.id);
    expect(payload.nombre).toBe(usuario.nombre);
    expect(payload.email).toBe(usuario.email);
    expect(payload.rol).toBe(usuario.rol);
  });

  test("verificarToken devuelve null para un token inválido", () => {
    expect(verificarToken("esto-no-es-un-jwt")).toBeNull();
  });

  test("verificarToken devuelve null si el payload no trae userId", () => {
    const jwt = require("jsonwebtoken");
    const tokenSinUserId = jwt.sign({ nombre: "sin id" }, "ing-software-demo-secret-local");
    expect(verificarToken(tokenSinUserId)).toBeNull();
  });

  test("getAuthUser devuelve el payload cuando la cookie trae un token válido", () => {
    const token = crearTokenSesion(usuario);
    const payload = getAuthUser(fakeRequest(token));
    expect(payload.userId).toBe(usuario.id);
  });

  test("getAuthUser devuelve null si no hay cookie de sesión", () => {
    expect(getAuthUser(fakeRequest(undefined))).toBeNull();
  });

  test("esAdmin es true solo para rol admin", () => {
    expect(esAdmin({ rol: "admin" })).toBe(true);
    expect(esAdmin({ rol: "usuario" })).toBe(false);
    expect(esAdmin(null)).toBe(false);
  });
});
