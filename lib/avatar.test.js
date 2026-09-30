import { getInitials, getAvatarColor } from "./avatar";

describe("lib/avatar", () => {
  test("getInitials con un solo nombre toma las 2 primeras letras", () => {
    expect(getInitials("Ana")).toBe("AN");
  });

  test("getInitials con nombre y apellido usa la primera letra de cada uno", () => {
    expect(getInitials("Ana Pérez")).toBe("AP");
  });

  test("getInitials con varios nombres usa el primero y el último", () => {
    expect(getInitials("Ana María Pérez")).toBe("AP");
  });

  test("getInitials con nombre vacío devuelve '?'", () => {
    expect(getInitials("")).toBe("?");
    expect(getInitials(undefined)).toBe("?");
    expect(getInitials("   ")).toBe("?");
  });

  test("getAvatarColor es determinístico para el mismo nombre", () => {
    expect(getAvatarColor("Ana Pérez")).toBe(getAvatarColor("Ana Pérez"));
  });

  test("getAvatarColor siempre devuelve un color hexadecimal de la paleta", () => {
    const color = getAvatarColor("Cualquier Nombre");
    expect(color).toMatch(/^#[0-9a-f]{6}$/i);
  });
});
