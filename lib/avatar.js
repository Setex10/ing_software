// lib/avatar.js
//
// Utilidades puras (sin dependencias de servidor) para mostrar iniciales y
// un color consistente por nombre, usadas en los avatares de integrantes y
// de tareas asignadas. Se puede importar tanto en Server como en Client
// Components.

const PALETTE = [
  "#eb5a46", // rojo
  "#0079bf", // azul
  "#61bd4f", // verde
  "#ff9f1a", // naranja
  "#c377e0", // morado
  "#00a3a3", // turquesa
];

export function getInitials(nombre) {
  const partes = String(nombre || "").trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

export function getAvatarColor(nombre) {
  const texto = String(nombre || "");
  let hash = 0;
  for (let i = 0; i < texto.length; i++) {
    hash = (hash * 31 + texto.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}
