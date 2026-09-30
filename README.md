# Sistema de Gestión de Proyectos y Tareas

Proyecto integrador — Ingeniería en Desarrollo de Software.
Next.js (App Router). Módulos incluidos en esta versión: **Proyectos**, **Integrantes** y **Tareas**.

Esta versión es una **simulación 100% local**: no depende de ninguna base de
datos externa ni de ningún servicio de autenticación externo.

- **Autenticación simulada con roles**: hay dos usuarios de prueba definidos
  en el propio código (`lib/authUsers.js`), uno con rol `admin` y otro con
  rol `usuario`. El login valida sus credenciales, aplica un límite de
  intentos fallidos (`lib/loginRateLimit.js`) y, si son correctas, firma un
  JWT (con el rol incluido, secreto configurable por variable de entorno) y
  lo guarda en una cookie httpOnly; no hay registro de usuarios ni
  persistencia de sesiones fuera de esa cookie.
- **Datos en memoria, dentro del código**: los proyectos, integrantes y
  tareas se guardan en `lib/localStore.js`, un almacenamiento en memoria
  (no en una base de datos). Los datos viven mientras el proceso de
  Next.js esté corriendo y se reinician si el servidor se reinicia.

## Requisitos previos

- **Node.js 18 o superior** (recomendado 20 LTS). Verifica con: `node -v`
- Opcional, para correr en contenedor: **Docker**.

No se necesita ninguna base de datos para correr el proyecto.

## 1. Instalar dependencias

Las dependencias **no están incluidas en el proyecto ni se suben a git** (carpeta `node_modules` ignorada). Se descargan con:

```bash
npm install
```

Esto instalará automáticamente: `next`, `react`, `react-dom`, `jsonwebtoken`, `bcryptjs` y las dependencias de desarrollo (`jest`, `eslint`, `eslint-plugin-sonarjs`, `jscpd`) definidas en `package.json`.

## 2. Variables de entorno (opcional)

```bash
cp .env.example .env.local
```

La app corre sin este paso (usa un secreto de desarrollo por defecto), pero
`JWT_SECRET` y `JWT_EXPIRES_IN` deben definirse antes de cualquier
despliegue real (ver `.env.example`).

## 3. Ejecutar la aplicación en desarrollo

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

Documentación completa de la API (endpoints, body, respuestas, errores) en
[`docs/api/README.md`](docs/api/README.md).

## 4. Pruebas unitarias

```bash
npm test              # corre la suite de Jest
npm run test:coverage # corre la suite con reporte de cobertura
```

La suite cubre los modelos de validación, los repositorios y las reglas de
negocio de los tres módulos (`project-service`, `member-service`,
`task-service`) y las utilidades de `lib/` (auth, usuarios demo, rate
limiting, avatares, helpers HTTP compartidos). El umbral configurado en
`jest.config.js` exige **≥80% de cobertura** (statements/branches/functions/lines)
sobre esos archivos; al momento de escribir esto la suite está en **99.06%
statements / 95.29% branches / 100% functions / 99.65% lines** (98 pruebas,
14 suites). Los controladores (glue HTTP) y las páginas de React no tienen
pruebas unitarias — se validaron manualmente end-to-end (curl y Playwright).
Reporte HTML exportado en `reportes/unit-tests/` (ver más abajo).

## 5. Lint y calidad de código

```bash
npm run lint
```

Usa `eslint-config-next` **+ `eslint-plugin-sonarjs`** (el mismo motor de
reglas que usa SonarQube para JS/TS) como sustituto real de un análisis de
SonarQube, que no se pudo ejecutar en este entorno por no contar con acceso
a un servidor Sonar/SonarCloud. También se usa `jscpd` para medir
duplicación de código (equivalente a la métrica "Duplications" de
SonarQube). Detalle completo, con hallazgos reales corregidos, en
[`reportes/sonarqube/README.md`](reportes/sonarqube/README.md) (no incluido
en este repo git — se genera aparte, ver esa carpeta en el ZIP de entrega).

## 6. Integración continua (CI)

`.github/workflows/ci.yml` corre en cada push/PR a `main`: instala
dependencias, ejecuta la suite de pruebas con cobertura, corre el lint,
hace el build de producción y construye la imagen Docker. No incluye un
paso de despliegue automático: no hay un entorno de hosting configurado
para este proyecto (sí se verificó el despliegue en un contenedor Docker
local — ver el punto siguiente).

## 7. Docker

```bash
docker build -t ing-software .
docker run -p 3000:3000 --env-file .env.local ing-software
# o bien:
docker compose up --build
```

El `Dockerfile` usa la salida `standalone` de Next.js (imagen final
liviana, sin `node_modules` completo) y corre como usuario sin privilegios.
Se construyó y corrió realmente en este entorno, incluyendo un escaneo
OWASP ZAP baseline contra el contenedor — ver
[`docs/arquitectura/02-diagrama-despliegue.png`](docs/arquitectura/02-diagrama-despliegue.png)
y `reportes/seguridad/`.

## 8. Compilar para producción sin Docker (opcional)

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
  auth.js                                 -> firma/verifica el JWT de sesión (secreto por env var), helper esAdmin()
  sessionCookie.js                        -> nombre de la cookie de sesión (usado también por el middleware)
  loginRateLimit.js                       -> límite de intentos fallidos de login (mitiga fuerza bruta)
  httpController.js                       -> helpers HTTP compartidos por los 3 controladores (auth, parseo de body, mapeo de resultado)
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
docs/
  arquitectura/                           -> diagramas UML (4+1): componentes, despliegue, secuencia, modelo de datos
  api/README.md                           -> documentación de todos los endpoints
  evidencias/                             -> capturas de la app (login, roles, CRUD)
.github/workflows/ci.yml                  -> pipeline de CI (test + lint + build + docker build)
Dockerfile, docker-compose.yml, .dockerignore -> imagen y orquestación local
.env.example                              -> variables de entorno documentadas (JWT_SECRET, etc.)
jest.config.js, .eslintrc.json            -> configuración de pruebas y lint (+ sonarjs)
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
  ventana de 10 minutos (`lib/loginRateLimit.js`).
- Cabeceras de seguridad (`X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, `Content-Security-Policy`) configuradas en
  `next.config.mjs`, ajustadas tras un escaneo real de **OWASP ZAP**
  baseline contra la app dockerizada (se corrigieron los hallazgos
  "X-Powered-By" y "CSP Header Not Set" — ver `reportes/seguridad/`). La
  CSP es más permisiva en desarrollo (`next dev` necesita `unsafe-eval`
  para su Fast Refresh) y más estricta en producción.
- Al reiniciar el servidor (`npm run dev` / `npm start` / el contenedor),
  todos los datos creados (proyectos, integrantes, tareas) se pierden,
  porque viven en memoria y no en un archivo o base de datos.
