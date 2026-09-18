// app/api/projects/[id]/route.js
//
// Punto de entrada HTTP para el detalle de un proyecto. Solo delega al
// controlador del Project Service.

import { handleGetProject } from "@/services/project-service/controllers/projectController.js";

export async function GET(request, { params }) {
  return handleGetProject(request, params.id);
}
