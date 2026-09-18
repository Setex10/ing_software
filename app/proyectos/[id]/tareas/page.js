// app/proyectos/[id]/tareas/page.js
//
// HU: como usuario, quiero crear tareas para dividir el trabajo del
// proyecto. Permite crear tareas (título + descripción), quedan asociadas
// al proyecto y se pueden marcar como completadas. No permite tareas sin
// título.

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import styles from "../../proyectos.module.css";
import formStyles from "../../nuevo/nuevo.module.css";

export default function TareasPage() {
  const { id } = useParams();

  const [tareas, setTareas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [erroresForm, setErroresForm] = useState([]);
  const [enviando, setEnviando] = useState(false);

  async function cargarTareas() {
    try {
      const res = await fetch(`/api/projects/${id}/tasks`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "No se pudieron cargar las tareas.");
        return;
      }

      const data = await res.json();
      setTareas(data.tareas || []);
      setError("");
    } catch (err) {
      setError("Error de conexión al cargar las tareas.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarTareas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErroresForm([]);

    const erroresCliente = [];
    if (!titulo.trim()) erroresCliente.push("El título de la tarea es obligatorio.");
    if (!descripcion.trim()) erroresCliente.push("La descripción de la tarea es obligatoria.");
    if (erroresCliente.length > 0) {
      setErroresForm(erroresCliente);
      return;
    }

    setEnviando(true);

    try {
      const res = await fetch(`/api/projects/${id}/tasks`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo, descripcion }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErroresForm([data.error || "No se pudo crear la tarea."]);
        return; // no se pierde lo ya escrito
      }

      setTitulo("");
      setDescripcion("");
      await cargarTareas();
    } catch (err) {
      setErroresForm(["Error de conexión al crear la tarea."]);
    } finally {
      setEnviando(false);
    }
  }

  async function alternarCompletada(tarea) {
    const nuevoEstado = tarea.estado === "completada" ? "pendiente" : "completada";

    try {
      const res = await fetch(`/api/projects/${id}/tasks/${tarea._id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "No se pudo actualizar la tarea.");
        return;
      }

      await cargarTareas();
    } catch (err) {
      setError("Error de conexión al actualizar la tarea.");
    }
  }

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Tareas</h1>
          <Link href={`/proyectos/${id}`} className={styles.secondaryButton}>
            &larr; Volver al proyecto
          </Link>
        </div>

        {erroresForm.length > 0 && (
          <div className={styles.error} style={{ marginBottom: 20 }}>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {erroresForm.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className={formStyles.form}
          noValidate
          style={{ marginBottom: 24 }}
        >
          <label className={formStyles.label} htmlFor="titulo">
            Título
          </label>
          <input
            id="titulo"
            type="text"
            className={formStyles.input}
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
          />

          <label className={formStyles.label} htmlFor="descripcion">
            Descripción
          </label>
          <textarea
            id="descripcion"
            className={formStyles.textarea}
            rows={3}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
          />

          <div className={formStyles.actions}>
            <button type="submit" className={styles.primaryButton} disabled={enviando}>
              {enviando ? "Creando..." : "Crear tarea"}
            </button>
          </div>
        </form>

        {cargando && <p className={styles.info}>Cargando tareas...</p>}
        {!cargando && error && <p className={styles.error}>{error}</p>}

        {!cargando && !error && tareas.length === 0 && (
          <p className={styles.info}>Este proyecto aún no tiene tareas.</p>
        )}

        {!cargando && !error && tareas.length > 0 && (
          <ul className={styles.list}>
            {tareas.map((tarea) => (
              <li key={tarea._id} className={styles.listItem}>
                <div className={styles.listItemHeader}>
                  <label
                    className={styles.projectName}
                    style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
                  >
                    <input
                      type="checkbox"
                      checked={tarea.estado === "completada"}
                      onChange={() => alternarCompletada(tarea)}
                    />
                    {tarea.titulo}
                  </label>
                </div>
                <span className={styles.info}>{tarea.descripcion}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
