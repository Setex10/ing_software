# Sistema de Gestión de Proyectos y Tareas

Proyecto integrador — Ingeniería en Desarrollo de Software.
Next.js (App Router). Módulos incluidos en esta versión: **Proyectos**, **Integrantes** y **Tareas**.

Esta versión es una **simulación 100% local**: no depende de ninguna base de
datos externa ni de ningún servicio de autenticación externo.

- **Autenticación simulada**: hay un único usuario de prueba definido en el
  propio código (`lib/authUsers.js`). El login valida sus credenciales,
  firma un JWT y lo guarda en una cookie httpOnly; no hay registro de
  usuarios ni persistencia de sesiones fuera de esa cookie.
- **Datos en memoria, dentro del código**: los proyectos, integrantes y
  tareas se guardan en `lib/localStore.js`, un almacenamiento en memoria
  (no en una base de datos). Los datos viven mientras el proceso de
  Next.js esté corriendo y se reinician si el servidor se reinicia.

## Requisitos previos

- **Node.js 18 o superior** (recomendado 20 LTS). Verifica con: `node -v`

No se necesita ninguna base de datos ni variable de entorno para correr el proyecto.

## 1. Instalar dependencias

Las dependencias **no están incluidas en el proyecto ni se suben a git** (carpeta `node_modules` ignorada). Se descargan con:

```bash
npm install
```

Esto instalará automáticamente: `next`, `react`, `react-dom`, `jsonwebtoken` y `bcryptjs` (definidos en `package.json`).

## 2. Ejecutar la aplicación en desarrollo

```bash
npm run dev
```

Abre tu navegador en **http://localhost:3000**.

Usuario de prueba (login simulado, definido en `lib/authUsers.js`):

- **Correo:** `demo@proyectos.com`
- **Contraseña:** `Demo1234`

Rutas principales:

- `/` → redirige a `/login` o `/proyectos` según haya sesión
- `/login` → inicio de sesión simulado (muestra los errores del login: campos vacíos, credenciales incorrectas, error de conexión)
- `/proyectos` → lista de proyectos del usuario autenticado
- `/proyectos/nuevo` → formulario para crear un proyecto
- `/proyectos/[id]` → detalle de un proyecto (avance, accesos a Integrantes y Tareas)
- `/proyectos/[id]/integrantes` → agregar y listar integrantes del proyecto
- `/proyectos/[id]/tareas` → crear tareas, consultarlas, asignarlas a un integrante, cambiar su estado (pendiente / en progreso / completada) y eliminarlas
- `/api/projects`, `/api/projects/[id]`, `/api/projects/[id]/members`, `/api/projects/[id]/tasks`, `/api/projects/[id]/tasks/[taskId]` → API (esta última soporta `PATCH` para actualizar estado/responsable y `DELETE` para eliminar la tarea)

## 3. Compilar para producción (opcional)

```bash
npm run build
npm start
```

## Estructura del proyecto

```
app/
  layout.js, globals.css, page.js         -> shell de la app (Next.js App Router)
  login/                                  -> página de login simulado
  components/LogoutButton.js              -> botón de cerrar sesión
  api/auth/login, api/auth/logout         -> endpoints de autenticación simulada
  api/projects/route.js                   -> endpoints POST/GET de proyectos
  api/projects/[id]/route.js              -> detalle de un proyecto
  api/projects/[id]/members/route.js      -> integrantes de un proyecto
  api/projects/[id]/tasks/route.js        -> tareas de un proyecto
  api/projects/[id]/tasks/[taskId]/route.js -> actualizar (estado/responsable) o eliminar una tarea
  proyectos/page.js                       -> lista de proyectos (con conteo de integrantes/tareas)
  proyectos/nuevo/page.js                 -> formulario de creación
  proyectos/[id]/page.js                  -> detalle de un proyecto (con tarjetas de estadísticas)
  proyectos/[id]/integrantes/page.js      -> módulo de integrantes (con avatares)
  proyectos/[id]/tareas/page.js           -> módulo de tareas (asignación, estado, eliminar)
middleware.js                             -> protege /proyectos si no hay sesión
lib/
  localStore.js                           -> almacenamiento en memoria (reemplaza a la base de datos)
  authUsers.js                            -> usuario de prueba para el login simulado
  auth.js                                 -> firma/verifica el JWT de sesión
  sessionCookie.js                        -> nombre de la cookie de sesión (usado también por el middleware)
  avatar.js                               -> iniciales y color de avatar a partir de un nombre
services/project-service/
  models/Project.js                       -> validación de datos de entrada
  repositories/projectRepository.js       -> acceso a los proyectos en memoria
  services/projectService.js              -> reglas de negocio + cálculo de avance
  controllers/projectController.js        -> traduce HTTP <-> lógica de negocio
services/member-service/
  models/Member.js, repositories/, services/, controllers/ -> módulo de integrantes
services/task-service/
  models/Task.js, repositories/, services/, controllers/   -> módulo de tareas
```

## Notas sobre la simulación

- El progreso de un proyecto (`porcentajeAvance`) se calcula a partir de sus
  tareas: `tareas completadas / tareas totales * 100`.
- Una tarea puede asignarse a un integrante ya registrado en el proyecto
  (`responsableId`); no se puede asignar a un integrante que no exista en
  ese proyecto.
- Solo el creador de un proyecto puede ver y administrar sus integrantes y
  tareas (no hay multiusuario real: todo se hace con el único usuario de prueba).
- Al reiniciar el servidor (`npm run dev` / `npm start`), todos los datos
  creados (proyectos, integrantes, tareas) se pierden, porque viven en
  memoria y no en un archivo o base de datos.
