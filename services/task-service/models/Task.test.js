import { validateTaskInput, ESTADOS_VALIDOS } from "./Task";

describe("validateTaskInput", () => {
  test("acepta título, descripción y responsableId válidos", () => {
    const { valid, sanitized } = validateTaskInput({
      titulo: "  Tarea  ",
      descripcion: "  Desc  ",
      responsableId: "  i1  ",
    });

    expect(valid).toBe(true);
    expect(sanitized).toEqual({ titulo: "Tarea", descripcion: "Desc", responsableId: "i1" });
  });

  test("responsableId es opcional (null si se omite)", () => {
    const { sanitized } = validateTaskInput({ titulo: "T", descripcion: "D" });
    expect(sanitized.responsableId).toBeNull();
  });

  test("responsableId en blanco se normaliza a null", () => {
    const { sanitized } = validateTaskInput({ titulo: "T", descripcion: "D", responsableId: "   " });
    expect(sanitized.responsableId).toBeNull();
  });

  test("responsableId que no es string se ignora", () => {
    const { sanitized } = validateTaskInput({ titulo: "T", descripcion: "D", responsableId: 123 });
    expect(sanitized.responsableId).toBeNull();
  });

  test("rechaza título vacío", () => {
    const { valid, errors } = validateTaskInput({ titulo: "  ", descripcion: "D" });
    expect(valid).toBe(false);
    expect(errors).toContain("El título de la tarea es obligatorio.");
  });

  test("rechaza descripción vacía", () => {
    const { valid, errors } = validateTaskInput({ titulo: "T", descripcion: "" });
    expect(valid).toBe(false);
    expect(errors).toContain("La descripción de la tarea es obligatoria.");
  });

  test("ESTADOS_VALIDOS contiene los 3 estados esperados", () => {
    expect(ESTADOS_VALIDOS).toEqual(["pendiente", "en_progreso", "completada"]);
  });
});
