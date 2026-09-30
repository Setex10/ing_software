import {
  buscarUsuarioPorEmail,
  verificarPassword,
  CREDENCIALES_DEMO,
  CREDENCIALES_DEMO_USUARIO,
} from "./authUsers";

describe("authUsers", () => {
  test("encuentra al usuario admin por correo exacto", () => {
    const usuario = buscarUsuarioPorEmail(CREDENCIALES_DEMO.email);
    expect(usuario).not.toBeNull();
    expect(usuario.rol).toBe("admin");
  });

  test("la búsqueda no distingue mayúsculas/minúsculas ni espacios", () => {
    const usuario = buscarUsuarioPorEmail("  DEMO@PROYECTOS.COM  ");
    expect(usuario).not.toBeNull();
    expect(usuario.email).toBe(CREDENCIALES_DEMO.email);
  });

  test("encuentra al usuario estándar (rol usuario)", () => {
    const usuario = buscarUsuarioPorEmail(CREDENCIALES_DEMO_USUARIO.email);
    expect(usuario).not.toBeNull();
    expect(usuario.rol).toBe("usuario");
  });

  test("devuelve null si el correo no existe", () => {
    expect(buscarUsuarioPorEmail("no-existe@proyectos.com")).toBeNull();
  });

  test("verificarPassword acepta la contraseña correcta", () => {
    const usuario = buscarUsuarioPorEmail(CREDENCIALES_DEMO.email);
    expect(verificarPassword(usuario, CREDENCIALES_DEMO.password)).toBe(true);
  });

  test("verificarPassword rechaza una contraseña incorrecta", () => {
    const usuario = buscarUsuarioPorEmail(CREDENCIALES_DEMO.email);
    expect(verificarPassword(usuario, "otra-cosa")).toBe(false);
  });
});
