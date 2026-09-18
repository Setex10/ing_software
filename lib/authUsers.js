// lib/authUsers.js
//
// "Base de datos" de usuarios, simulada dentro del propio código: un único
// usuario de prueba con el que se puede iniciar sesión. No hay registro ni
// persistencia real; es suficiente para simular el login del sistema.

import bcrypt from "bcryptjs";

const DEMO_PASSWORD = "Demo1234";

const USERS = [
  {
    id: "u-demo-1",
    nombre: "Usuario Demo",
    email: "demo@proyectos.com",
    passwordHash: bcrypt.hashSync(DEMO_PASSWORD, 10),
  },
];

export const CREDENCIALES_DEMO = { email: USERS[0].email, password: DEMO_PASSWORD };

export function buscarUsuarioPorEmail(email) {
  const emailNormalizado = String(email).trim().toLowerCase();
  return USERS.find((u) => u.email.toLowerCase() === emailNormalizado) || null;
}

export function verificarPassword(usuario, password) {
  return bcrypt.compareSync(password, usuario.passwordHash);
}
