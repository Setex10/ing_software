// app/api/projects/[id]/tasks/[taskId]/route.js
//
// Punto de entrada HTTP para actualizar el estado de una tarea puntual.

import { handleUpdateTaskStatus } from "@/services/task-service/controllers/taskController.js";

export async function PATCH(request, { params }) {
  return handleUpdateTaskStatus(request, params.id, params.taskId);
}
