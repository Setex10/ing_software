# Sistema de Gestión de Proyectos y Tareas

Proyecto integrador — Ingeniería en Desarrollo de Software.
Next.js (App Router). Módulos incluidos en esta versión: **Proyectos**, **Integrantes** y **Tareas**.

Esta versión es una **simulación 100% local**: no depende de ninguna base de
datos externa ni de ningún servicio de autenticación externo.

- **Autenticación simulada con roles**: hay dos usuarios de prueba definidos
  en el propio código (`lib/authUsers.js`), uno con rol `admin` y otro con
  rol `usuario`. El login valida sus credenciales, aplica un límite de
  intentos fallidos (`lib/loginRateLimit.js`) y, si son correctas, firma un
  JWT (con el rol incluido) y lo guarda en una cookie httpOnly; no hay
  registro de usuarios ni persistencia de sesiones fuera de esa cookie.
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

Esto instalará automáticamente: `next`, `react`, `react-dom`, `jsonwebtoken`, `bcryptjs` y las dependencias de desarrollo (`jest`, `eslint`) definidas en `package.json`.

## 2. Ejecutar la aplicación en desarrollo

```bash
npm run dev
```

Abre tu navegador en **http://localhost:3000**.

Usuarios de prueba (login simulado, definidos en `lib/authUsers.js`):

| Rol       | Correo                  | Contraseña |
|-----------|--------------------------|------------|
| admin     | `demo@proyectos.com`     | `Demo1234` |
| usuario   | `usuario@proyectos.com`  | `Demo1234` |

Solo el rol **admin** puede eliminar tareas; el rol **usuario** puede hacer
todo lo demás (crear/consultar proyectos, integrantes y tareas, asignarlas,
cambiar su estado) pero no ve el botón de eliminar y recibe `403` si llama
al endpoint directamente.

Rutas principales:

- `/` → redirige a `/login` o `/proyectos` según haya sesión
- `/login` → inicio de sesión simulado (muestra los errores del login: campos vacíos, credenciales incorrectas, demasiados intentos, error de conexión)
- `/proyectos` → lista de proyectos del usuario autenticado
- `/proyectos/nuevo` → formulario para crear un proyecto
- `/proyectos/[id]` → detalle de un proyecto (avance, accesos a Integrantes y Tareas)
- `/proyectos/[id]/integrantes` → agregar y listar integrantes del proyecto
- `/proyectos/[id]/tareas` → crear tareas, consultarlas, asignarlas a un integrante, cambiar su estado (pendiente / en progreso / completada) y eliminarlas (solo admin)
- `/api/auth/login`, `/api/auth/logout`, `/api/auth/me` → sesión simulada (login/logout y "quién soy")
- `/api/projects`, `/api/projects/[id]`, `/api/projects/[id]/members`, `/api/projects/[id]/tasks`, `/api/projects/[id]/tasks/[taskId]` → API (esta última soporta `PATCH` para actualizar estado/responsable y `DELETE` — restringido a rol admin — para eliminar la tarea)

## 3. Pruebas unitarias

```bash
npm test              # corre la suite de Jest
npm run test:coverage # corre la suite con reporte de cobertura
```

La suite cubre los modelos de validación, los repositorios y las reglas de
negocio de los tres módulos (`project-service`, `member-service`,
`task-service`) y las utilidades de `lib/` (auth, usuarios demo, rate
limiting, avatares). El umbral configurado en `jest.config.js` exige
**≥80% de cobertura** (statements/branches/functions/lines) sobre esos
archivos; al momento de escribir esto la suite está en ~99% statements /
~96% branches. Los controladores (glue HTTP) y las páginas de React no
tienen pruebas unitarias — se validaron manualmente end-to-end (ver más
abajo).

## 4. Lint

```bash
npm run lint
```

Usa `eslint-config-next` (`.eslintrc.json`). Sustituye a un análisis de
SonarQube, que no se pudo ejecutar en este entorno por no contar con acceso
a un servidor Sonar/SonarCloud.

## 5. Integración continua (CI)

`.github/workflows/ci.yml` corre en cada push/PR a `main`: instala
dependencias, ejecuta la suite de pruebas con cobertura, corre el lint y
hace el build de producción. No incluye un paso de despliegue automático:
no hay un entorno de hosting configurado para este proyecto.

## 6. Compilar para producción (opcional)

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
  api/auth/me/route.js                    -> usuario autenticado actual (incluye rol)
  api/projects/route.js                   -> endpoints POST/GET de proyectos
  api/projects/[id]/route.js              -> detalle de un proyecto
  api/projects/[id]/members/route.js      -> integrantes de un proyecto
  api/projects/[id]/tasks/route.js        -> tareas de un proyecto
  api/projects/[id]/tasks/[taskId]/route.js -> actualizar (estado/responsable) o eliminar (solo admin) una tarea
  proyectos/page.js                       -> lista de proyectos (con conteo de integrantes/tareas)
  proyectos/nuevo/page.js                 -> formulario de creación
  proyectos/[id]/page.js                  -> detalle de un proyecto (con tarjetas de estadísticas)
  proyectos/[id]/integrantes/page.js      -> módulo de integrantes (con avatares)
  proyectos/[id]/tareas/page.js           -> módulo de tareas (asignación, estado, eliminar solo admin)
middleware.js                             -> protege /proyectos si no hay sesión
lib/
  localStore.js                           -> almacenamiento en memoria (reemplaza a la base de datos)
  authUsers.js                            -> usuarios de prueba (admin/usuario) para el login simulado
  auth.js                                 -> firma/verifica el JWT de sesión, helper esAdmin()
  sessionCookie.js                        -> nombre de la cookie de sesión (usado también por el middleware)
  loginRateLimit.js                       -> límite de intentos fallidos de login (mitiga fuerza bruta)
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
.github/workflows/ci.yml                  -> pipeline de CI (test + lint + build)
jest.config.js, .eslintrc.json            -> configuración de pruebas y lint
```

## Notas sobre la simulación

- El progreso de un proyecto (`porcentajeAvance`) se calcula a partir de sus
  tareas: `tareas completadas / tareas totales * 100`.
- Una tarea puede asignarse a un integrante ya registrado en el proyecto
  (`responsableId`); no se puede asignar a un integrante que no exista en
  ese proyecto.
- Solo el creador de un proyecto puede ver y administrar sus integrantes y
  tareas; dentro de eso, **eliminar una tarea** requiere además el rol
  `admin` (autorización por rol, además de por dueño del proyecto).
- El login aplica un límite de 5 intentos fallidos por correo en una
  ventana de 10 minutos (`lib/loginRateLimit.js`), y las respuestas HTTP
  incluyen cabeceras de seguridad básicas (`X-Content-Type-Options`,
  `X-Frame-Options`, `Referrer-Policy`) configuradas en `next.config.mjs`.
  No se ejecutó un escaneo dinámico (OWASP ZAP) contra la aplicación: este
  entorno no tiene acceso a Docker en ejecución para levantarlo.
- Al reiniciar el servidor (`npm run dev` / `npm start`), todos los datos
  creados (proyectos, integrantes, tareas) se pierden, porque viven en
  memoria y no en un archivo o base de datos.
