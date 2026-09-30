import { validateProjectInput } from "./Project";

describe("validateProjectInput", () => {
  test("acepta datos válidos y recorta espacios", () => {
    const { valid, errors, sanitized } = validateProjectInput({
      nombre: "  Proyecto X  ",
      descripcion: "  Una descripción  ",
      fechaLimite: "2026-12-31",
    });

    expect(valid).toBe(true);
    expect(errors).toEqual([]);
    expect(sanitized.nombre).toBe("Proyecto X");
    expect(sanitized.descripcion).toBe("Una descripción");
    expect(sanitized.fechaLimite).toBeInstanceOf(Date);
  });

  test("rechaza nombre vacío", () => {
    const { valid, errors } = validateProjectInput({
      nombre: "   ",
      descripcion: "desc",
      fechaLimite: "2026-12-31",
    });

    expect(valid).toBe(false);
    expect(errors).toContain("El nombre del proyecto es obligatorio.");
  });

  test("rechaza descripción vacía", () => {
    const { valid, errors } = validateProjectInput({
      nombre: "Proyecto",
      descripcion: "",
      fechaLimite: "2026-12-31",
    });

    expect(valid).toBe(false);
    expect(errors).toContain("La descripción del proyecto es obligatoria.");
  });

  test("rechaza fecha límite ausente", () => {
    const { valid, errors } = validateProjectInput({ nombre: "Proyecto", descripcion: "desc" });

    expect(valid).toBe(false);
    expect(errors).toContain("La fecha límite es obligatoria.");
  });

  test("rechaza fecha límite inválida", () => {
    const { valid, errors } = validateProjectInput({
      nombre: "Proyecto",
      descripcion: "desc",
      fechaLimite: "no-es-una-fecha",
    });

    expect(valid).toBe(false);
    expect(errors).toContain("La fecha límite no es una fecha válida.");
  });

  test("acumula todos los errores cuando faltan varios campos", () => {
    const { valid, errors } = validateProjectInput({});

    expect(valid).toBe(false);
    expect(errors).toHaveLength(3);
  });
});
