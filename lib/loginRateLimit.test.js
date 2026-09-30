import { estaBloqueado, registrarIntentoFallido, limpiarIntentos } from "./loginRateLimit";

describe("lib/loginRateLimit", () => {
  test("un correo sin intentos previos no está bloqueado", () => {
    expect(estaBloqueado("nuevo@proyectos.com").bloqueado).toBe(false);
  });

  test("menos de 5 intentos fallidos no bloquea", () => {
    const email = "pocos-intentos@proyectos.com";
    for (let i = 0; i < 4; i++) registrarIntentoFallido(email);

    expect(estaBloqueado(email).bloqueado).toBe(false);
  });

  test("5 intentos fallidos bloquean el correo con segundos restantes > 0", () => {
    const email = "muchos-intentos@proyectos.com";
    for (let i = 0; i < 5; i++) registrarIntentoFallido(email);

    const resultado = estaBloqueado(email);
    expect(resultado.bloqueado).toBe(true);
    expect(resultado.segundosRestantes).toBeGreaterThan(0);
  });

  test("limpiarIntentos desbloquea el correo", () => {
    const email = "se-limpia@proyectos.com";
    for (let i = 0; i < 5; i++) registrarIntentoFallido(email);
    expect(estaBloqueado(email).bloqueado).toBe(true);

    limpiarIntentos(email);
    expect(estaBloqueado(email).bloqueado).toBe(false);
  });

  test("el bloqueo expira pasada la ventana de tiempo", () => {
    const email = "expira@proyectos.com";
    const ahora = Date.now();
    const spy = jest.spyOn(Date, "now").mockReturnValue(ahora);

    for (let i = 0; i < 5; i++) registrarIntentoFallido(email);
    expect(estaBloqueado(email).bloqueado).toBe(true);

    spy.mockReturnValue(ahora + 11 * 60 * 1000); // 11 minutos después
    expect(estaBloqueado(email).bloqueado).toBe(false);

    spy.mockRestore();
  });

  test("los intentos se reinician si la ventana anterior ya expiró", () => {
    const email = "reinicio@proyectos.com";
    const ahora = Date.now();
    const spy = jest.spyOn(Date, "now").mockReturnValue(ahora);

    for (let i = 0; i < 5; i++) registrarIntentoFallido(email);

    spy.mockReturnValue(ahora + 11 * 60 * 1000);
    registrarIntentoFallido(email); // debería contar como el primer intento de una ventana nueva
    expect(estaBloqueado(email).bloqueado).toBe(false);

    spy.mockRestore();
  });
});
