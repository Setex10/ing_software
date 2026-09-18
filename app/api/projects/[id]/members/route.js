// app/api/projects/[id]/members/route.js
//
// Punto de entrada HTTP del Member Service. Solo delega al controlador.

import {
  handleAddMember,
  handleListMembers,
} from "@/services/member-service/controllers/memberController.js";

export async function GET(request, { params }) {
  return handleListMembers(request, params.id);
}

export async function POST(request, { params }) {
  return handleAddMember(request, params.id);
}
