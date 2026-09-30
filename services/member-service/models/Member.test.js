import { validateMemberInput } from "./Member";

describe("validateMemberInput", () => {
  test("acepta nombre, correo y rol válidos", () => {
    const { valid, sanitized } = validateMemberInput({
      nombre: "  Ana Pérez  ",
      email: "ana@x.com",
      rol: "Diseñadora",
    });

    expect(valid).toBe(true);
    expect(sanitized).toEqual({ nombre: "Ana Pérez", email: "ana@x.com", rol: "Diseñadora" });
  });

  test("correo y rol son opcionales", () => {
    const { valid, sanitized } = validateMemberInput({ nombre: "Ana" });
    expect(valid).toBe(true);
    expect(sanitized.email).toBe("");
    expect(sanitized.rol).toBe("");
  });

  test("rechaza nombre vacío o solo espacios", () => {
    expect(validateMemberInput({ nombre: "" }).valid).toBe(false);
    expect(validateMemberInput({ nombre: "   " }).valid).toBe(false);
    expect(validateMemberInput({}).errors).toContain("El nombre del integrante es obligatorio.");
  });
});
