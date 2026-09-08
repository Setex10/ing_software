// app/proyectos/nuevo/page.js
//
// Página protegida por el middleware.js existente. Formulario de creación
// de proyecto con validación en cliente y manejo de errores del servidor
// sin perder lo ya escrito.

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../proyectos.module.css";
import formStyles from "./nuevo.module.css";

export default function NuevoProyectoPage() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaLimite, setFechaLimite] = useState("");
  const [errores, setErrores] = useState([]);
  const [enviando, setEnviando] = useState(false);

  function validarEnCliente() {
    const nuevosErrores = [];
    if (!nombre.trim()) nuevosErrores.push("El nombre del proyecto es obligatorio.");
    if (!descripcion.trim()) nuevosErrores.push("La descripción del proyecto es obligatoria.");
    if (!fechaLimite) nuevosErrores.push("La fecha límite es obligatoria.");
    return nuevosErrores;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrores([]);

    const erroresCliente = validarEnCliente();
    if (erroresCliente.length > 0) {
      setErrores(erroresCliente);
      return;
    }

    setEnviando(true);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        credentials: "include", // envía la cookie httpOnly de sesión
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, descripcion, fechaLimite }),
      });

      if (res.status === 401) {
        setErrores(["Tu sesión expiró. Vuelve a iniciar sesión."]);
        setEnviando(false);
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrores([data.error || "No se pudo crear el proyecto."]);
        setEnviando(false);
        return; // no se pierde lo ya escrito: los estados nombre/descripcion/fechaLimite no se tocan
      }

      router.push("/proyectos");
    } catch (err) {
      setErrores(["Error de conexión al crear el proyecto."]);
      setEnviando(false);
    }
  }

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Nuevo proyecto</h1>
        </div>

        {errores.length > 0 && (
          <div className={styles.error} style={{ marginBottom: 20 }}>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {errores.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className={formStyles.form} noValidate>
          <label className={formStyles.label} htmlFor="nombre">
            Nombre
          </label>
          <input
            id="nombre"
            type="text"
            className={formStyles.input}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />

          <label className={formStyles.label} htmlFor="descripcion">
            Descripción
          </label>
          <textarea
            id="descripcion"
            className={formStyles.textarea}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={4}
            required
          />

          <label className={formStyles.label} htmlFor="fechaLimite">
            Fecha límite
          </label>
          <input
            id="fechaLimite"
            type="date"
            className={formStyles.input}
            value={fechaLimite}
            onChange={(e) => setFechaLimite(e.target.value)}
            required
          />

          <div className={formStyles.actions}>
            <button
              type="submit"
              className={styles.primaryButton}
              disabled={enviando}
            >
              {enviando ? "Creando..." : "Crear proyecto"}
            </button>
            <button
              type="button"
              className={formStyles.secondaryButton}
              onClick={() => router.push("/proyectos")}
              disabled={enviando}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
