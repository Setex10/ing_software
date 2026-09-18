// app/api/projects/[id]/tasks/route.js
//
// Punto de entrada HTTP del Task Service. Solo delega al controlador.

import {
  handleCreateTask,
  handleListTasks,
} from "@/services/task-service/controllers/taskController.js";

export async function GET(request, { params }) {
  return handleListTasks(request, params.id);
}

export async function POST(request, { params }) {
  return handleCreateTask(request, params.id);
}
