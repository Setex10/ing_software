// app/api/projects/[id]/tasks/[taskId]/route.js
//
// Punto de entrada HTTP para actualizar (estado / responsable) o eliminar
// una tarea puntual.

import {
  handleUpdateTask,
  handleDeleteTask,
} from "@/services/task-service/controllers/taskController.js";

export async function PATCH(request, { params }) {
  return handleUpdateTask(request, params.id, params.taskId);
}

export async function DELETE(request, { params }) {
  return handleDeleteTask(request, params.id, params.taskId);
}
