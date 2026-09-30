# API — endpoints reales

Todos los endpoints viven bajo `app/api/` (Next.js Route Handlers). La
sesión se maneja con una cookie httpOnly (`token`, JWT); no se usa un
header `Authorization`. Todas las respuestas de error tienen la forma
`{ "error": "mensaje" }`.

## Autenticación

| Método | Ruta | Body | Respuesta OK | Errores |
|---|---|---|---|---|
| POST | `/api/auth/login` | `{ email, password }` | 200 `{ usuario: { id, nombre, email, rol } }` + cookie `token` | 400 body inválido, 400 campos vacíos, 401 credenciales incorrectas, 429 demasiados intentos fallidos (5 / 10 min) |
| POST | `/api/auth/logout` | — | 200 `{ ok: true }` (borra la cookie) | — |
| GET | `/api/auth/me` | — | 200 `{ usuario: { id, nombre, email, rol } }` | 401 sin sesión |

## Proyectos

| Método | Ruta | Body | Respuesta OK | Errores |
|---|---|---|---|---|
| POST | `/api/projects` | `{ nombre, descripcion, fechaLimite }` | 201 `{ proyecto }` | 401 sin sesión, 400 validación (nombre/descripción/fecha) |
| GET | `/api/projects` | — | 200 `{ proyectos: [...] }` (solo los del usuario autenticado, con `porcentajeAvance`) | 401 sin sesión |
| GET | `/api/projects/:id` | — | 200 `{ proyecto }` | 401 sin sesión, 403 no es el dueño, 404 no existe |

## Integrantes

| Método | Ruta | Body | Respuesta OK | Errores |
|---|---|---|---|---|
| POST | `/api/projects/:id/members` | `{ nombre, email?, rol? }` | 201 `{ integrante }` | 401 sin sesión, 403 no es el dueño del proyecto, 400 nombre obligatorio |
| GET | `/api/projects/:id/members` | — | 200 `{ integrantes: [...] }` | 401 sin sesión, 403 no es el dueño, 404 no existe |

## Tareas

| Método | Ruta | Body | Respuesta OK | Errores |
|---|---|---|---|---|
| POST | `/api/projects/:id/tasks` | `{ titulo, descripcion, responsableId? }` | 201 `{ tarea }` | 401 sin sesión, 403 no es el dueño, 400 validación, 400 `responsableId` no pertenece al proyecto |
| GET | `/api/projects/:id/tasks` | — | 200 `{ tareas: [...] }` | 401 sin sesión, 403 no es el dueño |
| PATCH | `/api/projects/:id/tasks/:taskId` | `{ estado?, responsableId? }` | 200 `{ tarea }` | 401 sin sesión, 403 no es el dueño, 400 estado inválido, 404 tarea no existe |
| DELETE | `/api/projects/:id/tasks/:taskId` | — | 200 `{ ok: true }` | 401 sin sesión, **403 si el usuario no tiene rol `admin`**, 403 no es el dueño, 404 no existe |

## Notas

- Todos los endpoints (excepto login/logout/me) exigen sesión válida y que
  el proyecto pertenezca al usuario autenticado (`creadorId`).
- `DELETE` de tareas es el único endpoint con una segunda capa de
  autorización por **rol** (`esAdmin(user)`, ver `lib/auth.js`), además de
  la autorización por dueño del proyecto.
- El body JSON inválido siempre devuelve `400 { error: "El cuerpo de la
  petición no es un JSON válido." }` — lógica centralizada en
  `lib/httpController.js` (`parseJsonBody`) y reutilizada por los 3
  controladores.
- Ver `docs/evidencias/` para capturas de estos flujos desde la UI, y el
  diagrama de secuencia en `docs/arquitectura/03-diagrama-secuencia.pdf`
  para el detalle interno de `POST /api/auth/login` y
  `POST /api/projects/:id/tasks`.
