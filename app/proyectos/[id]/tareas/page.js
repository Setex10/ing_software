// app/proyectos/[id]/tareas/page.js
//
// HU4b: consultar tareas del proyecto (con su información básica).
// HU4c: asignar una tarea a un integrante para distribuir responsabilidades.
// HU4d: actualizar el estado de una tarea (pendiente / en progreso / completada).
// HU4e: eliminar una tarea (con confirmación).
// También cubre la HU original de creación: título + descripción obligatorios.

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import styles from "../../proyectos.module.css";
import formStyles from "../../nuevo/nuevo.module.css";
import { getInitials, getAvatarColor } from "@/lib/avatar";

const ESTADO_LABEL = {
  pendiente: "Pendiente",
  en_progreso: "En progreso",
  completada: "Completada",
};

const ESTADO_CLASS = {
  pendiente: styles.statusPendiente,
  en_progreso: styles.statusEnProgreso,
  completada: styles.statusCompletada,
};

export default function TareasPage() {
  const { id } = useParams();

  const [tareas, setTareas] = useState([]);
  const [integrantes, setIntegrantes] = useState([]);
  const [esAdmin, setEsAdmin] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [responsableId, setResponsableId] = useState("");
  const [erroresForm, setErroresForm] = useState([]);
  const [enviando, setEnviando] = useState(false);

  async function cargarDatos() {
    try {
      const [resTareas, resIntegrantes, resUsuario] = await Promise.all([
        fetch(`/api/projects/${id}/tasks`, { method: "GET", credentials: "include" }),
        fetch(`/api/projects/${id}/members`, { method: "GET", credentials: "include" }),
        fetch("/api/auth/me", { method: "GET", credentials: "include" }),
      ]);

      if (!resTareas.ok) {
        const data = await resTareas.json().catch(() => ({}));
        setError(data.error || "No se pudieron cargar las tareas.");
        return;
      }

      const dataTareas = await resTareas.json();
      setTareas(dataTareas.tareas || []);

      if (resIntegrantes.ok) {
        const dataIntegrantes = await resIntegrantes.json();
        setIntegrantes(dataIntegrantes.integrantes || []);
      }

      if (resUsuario.ok) {
        const dataUsuario = await resUsuario.json();
        setEsAdmin(dataUsuario.usuario?.rol === "admin");
      }

      setError("");
    } catch (err) {
      setError("Error de conexión al cargar las tareas.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
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
        body: JSON.stringify({ titulo, descripcion, responsableId: responsableId || null }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErroresForm([data.error || "No se pudo crear la tarea."]);
        return; // no se pierde lo ya escrito
      }

      setTitulo("");
      setDescripcion("");
      setResponsableId("");
      await cargarDatos();
    } catch (err) {
      setErroresForm(["Error de conexión al crear la tarea."]);
    } finally {
      setEnviando(false);
    }
  }

  async function cambiarEstado(tarea, estado) {
    try {
      const res = await fetch(`/api/projects/${id}/tasks/${tarea._id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "No se pudo actualizar la tarea.");
        return;
      }

      await cargarDatos();
    } catch (err) {
      setError("Error de conexión al actualizar la tarea.");
    }
  }

  async function eliminarTarea(tarea) {
    const confirmado = window.confirm(
      `¿Eliminar la tarea "${tarea.titulo}"? Esta acción no se puede deshacer.`
    );
    if (!confirmado) return;

    try {
      const res = await fetch(`/api/projects/${id}/tasks/${tarea._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "No se pudo eliminar la tarea.");
        return;
      }

      await cargarDatos();
    } catch (err) {
      setError("Error de conexión al eliminar la tarea.");
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

          <label className={formStyles.label} htmlFor="responsable">
            Asignar a (opcional)
          </label>
          <select
            id="responsable"
            className={formStyles.select}
            value={responsableId}
            onChange={(e) => setResponsableId(e.target.value)}
          >
            <option value="">Sin asignar</option>
            {integrantes.map((integrante) => (
              <option key={integrante.id} value={integrante.id}>
                {integrante.nombre}
              </option>
            ))}
          </select>

          <div className={formStyles.actions}>
            <button type="submit" className={styles.primaryButton} disabled={enviando}>
              {enviando ? "Creando..." : "Crear tarea"}
            </button>
          </div>
        </form>

        {cargando && <p className={styles.info}>Cargando tareas...</p>}
        {!cargando && error && <p className={styles.error}>{error}</p>}

        {!cargando && !error && tareas.length === 0 && (
          <div className={styles.emptyState}>
            <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="4" y="3" width="16" height="18" rx="2" />
              <path d="M8 8h8M8 12h8M8 16h5" strokeLinecap="round" />
            </svg>
            <p className={styles.emptyTitle}>Este proyecto aún no tiene tareas</p>
            <p>Crea la primera arriba para empezar a dividir el trabajo.</p>
          </div>
        )}

        {!cargando && !error && tareas.length > 0 && (
          <ul className={styles.list}>
            {tareas.map((tarea) => (
              <li key={tarea._id} className={styles.listItem}>
                <div className={styles.taskTop}>
                  <div>
                    <span className={styles.projectName}>{tarea.titulo}</span>
                    <p className={styles.info} style={{ margin: "4px 0 0" }}>
                      {tarea.descripcion}
                    </p>
                  </div>

                  <div className={styles.taskActions}>
                    <select
                      className={`${styles.statusSelect} ${ESTADO_CLASS[tarea.estado]}`}
                      value={tarea.estado}
                      onChange={(e) => cambiarEstado(tarea, e.target.value)}
                    >
                      {Object.entries(ESTADO_LABEL).map(([valor, etiqueta]) => (
                        <option key={valor} value={valor}>
                          {etiqueta}
                        </option>
                      ))}
                    </select>

                    {esAdmin && (
                      <button
                        type="button"
                        className={styles.iconButton}
                        onClick={() => eliminarTarea(tarea)}
                        aria-label={`Eliminar tarea ${tarea.titulo}`}
                        title="Eliminar tarea (solo administradores)"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0-1 13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1L6 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                <div className={styles.metaRow}>
                  {tarea.responsableNombre ? (
                    <span className={styles.metaItem}>
                      <span
                        className={styles.avatar}
                        style={{
                          backgroundColor: getAvatarColor(tarea.responsableNombre),
                          width: 22,
                          height: 22,
                          fontSize: 10,
                        }}
                      >
                        {getInitials(tarea.responsableNombre)}
                      </span>
                      {tarea.responsableNombre}
                    </span>
                  ) : (
                    <span className={styles.metaItem}>Sin asignar</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
