# Arquitectura de software — modelo 4+1 + UML

Estilo implementado: **monolito modular en capas** (controller → service →
repository), replicado igual en los 3 módulos de negocio
(`project-service`, `member-service`, `task-service`). No son
microservicios desplegados de forma independiente; el patrón imita a nivel
de código el desacople que promueve una arquitectura orientada a servicios.

## Vistas 4+1

- **Vista lógica** — [`01-diagrama-componentes.png`](01-diagrama-componentes.png):
  los 3 servicios de dominio, la capa de autenticación (`lib/auth.js`,
  `lib/httpController.js`, `lib/loginRateLimit.js`) y el almacenamiento en
  memoria (`lib/localStore.js`).
- **Vista de desarrollo**: misma estructura de carpetas
  (`models/ repositories/ services/ controllers/`) reutilizada en cada
  módulo de negocio (ver el propio diagrama de componentes, agrupado por
  carpeta/módulo).
- **Vista de procesos** — [`03-diagrama-secuencia.pdf`](03-diagrama-secuencia.pdf):
  dos diagramas de secuencia reales (login, y creación de una tarea),
  incluyendo los caminos alternos de error (401/400/403/404/429).
- **Vista física / despliegue** — [`02-diagrama-despliegue.png`](02-diagrama-despliegue.png):
  la app corre en un contenedor Docker (`Dockerfile`, salida `standalone`
  de Next.js) expuesto en el puerto 3000; el escaneo OWASP ZAP se corrió
  contra ese mismo contenedor desde un segundo contenedor
  (`zaproxy/zap-stable`) en la misma red Docker. Ambos se construyeron y
  corrieron realmente en este entorno (ver `reportes/seguridad/`).
- **+1 Escenarios**: los flujos de las Historias de Usuario (login, crear
  proyecto, agregar integrante, crear/asignar/actualizar/eliminar tarea)
  son los casos de uso que validan las otras cuatro vistas — son
  exactamente los que se cubren con pruebas automatizadas (Jest) y
  manuales (curl/Playwright).

## Modelo de datos

No hay una base de datos relacional: los datos viven en memoria
(`lib/localStore.js`, anclado a `globalThis` para sobrevivir a las
recompilaciones de rutas en modo desarrollo). Aun así, las entidades y sus
relaciones tienen una forma clara — ver
[`04-modelo-datos.png`](04-modelo-datos.png): un `Usuario` crea N
`Proyecto`s; cada `Proyecto` tiene N `Integrante`s (embebidos) y N
`Tarea`s; cada `Tarea` puede asignarse a 0 o 1 `Integrante` que debe
pertenecer a ese mismo proyecto.

## Cómo se generaron los diagramas

- `01-diagrama-componentes.png`, `02-diagrama-despliegue.png` y
  `04-modelo-datos.png`: Graphviz (`dot`), a partir de los `.dot` fuente
  (no incluidos en el repo, solo el render final).
- `03-diagrama-secuencia.pdf`: dibujado a mano con reportlab (dos
  diagramas de secuencia apilados: login y creación de tarea).
