# Evidencias — capturas de la app

Capturas reales de la aplicación corriendo (`npm run dev`), tomadas con
Playwright contra `localhost:3000` en este mismo entorno.

1. `01-login.png` — pantalla de login, con los dos usuarios de prueba
   (admin/usuario) visibles.
2. `02-login-error.png` — manejo de error: credenciales incorrectas.
3. `03-lista-proyectos.png` — lista de proyectos con % de avance calculado.
4. `04-detalle-proyecto.png` — detalle de un proyecto con tarjetas de
   estadísticas (integrantes, tareas, avance).
5. `05-integrantes.png` — módulo de integrantes (con avatares).
6. `06-tareas.png` — módulo de tareas: creación, asignación y estado.
7. `07-rol-admin-tareas.png` — vista de Tareas con el usuario **admin**:
   se ve el botón "Eliminar".
8. `08-rol-usuario-tareas.png` — la misma vista con el usuario **usuario**
   (dueño del mismo proyecto): no se ve el botón "Eliminar" — la
   autorización por rol también se verificó directamente contra la API
   (ver Punto 6 del informe final, sección de Seguridad).

Más evidencia relacionada:

- `docs/arquitectura/` — diagramas UML (4+1).
- `reportes/seguridad/` — reportes reales de OWASP ZAP (antes/después de
  corregir hallazgos).
- `reportes/sonarqube/` — salida real de ESLint+sonarjs, jscpd y npm audit
  (sustituto de SonarQube).
- `reportes/unit-tests/` — reporte HTML de cobertura de Jest.
