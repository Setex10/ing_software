// app/components/LogoutButton.js
//
// Botón reutilizable para cerrar la sesión simulada.

"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton({ className }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button type="button" className={className} onClick={handleLogout}>
      Cerrar sesión
    </button>
  );
}
