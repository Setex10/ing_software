// app/api/projects/route.js
//
// Punto de entrada HTTP del Project Service dentro del monorepo Next.js.
// Solo delega al controlador; así, si el equipo decide separar este módulo
// como microservicio real, todo el código de negocio (services/project-service)
// se mueve tal cual y solo cambia este archivo de "adaptador".

import {
  handleCreateProject,
  handleListProjects,
} from "@/services/project-service/controllers/projectController.js";

export async function POST(request) {
  return handleCreateProject(request);
}

export async function GET(request) {
  return handleListProjects(request);
}
