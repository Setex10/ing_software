// app/login/LoginForm.js
//
// Formulario de login: valida en cliente que los campos no estén vacíos,
// llama a la API de login simulado y muestra los errores del servidor
// (credenciales incorrectas, campos faltantes, error de conexión) sin
// perder lo ya escrito.

"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./login.module.css";

export default function LoginForm({ credencialesDemo }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const destino = searchParams.get("from") || "/proyectos";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  function validarEnCliente() {
    if (!email.trim()) return "El correo es obligatorio.";
    if (!password) return "La contraseña es obligatoria.";
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const errorCliente = validarEnCliente();
    if (errorCliente) {
      setError(errorCliente);
      return;
    }

    setError("");
    setEnviando(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "No se pudo iniciar sesión.");
        setEnviando(false);
        return; // no se pierde lo ya escrito
      }

      router.push(destino);
      router.refresh();
    } catch (err) {
      setError("Error de conexión al iniciar sesión.");
      setEnviando(false);
    }
  }

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Iniciar sesión</h1>
        <p className={styles.hint}>
          Login simulado (sin base de datos real). Usuario de prueba:{" "}
          <strong>{credencialesDemo.email}</strong> /{" "}
          <strong>{credencialesDemo.password}</strong>
        </p>

        {error && <p className={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <label className={styles.label} htmlFor="email">
            Correo
          </label>
          <input
            id="email"
            type="email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className={styles.label} htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className={styles.primaryButton} disabled={enviando}>
            {enviando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </main>
  );
}
