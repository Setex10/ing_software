// app/proyectos/[id]/integrantes/page.js
//
// HU: como usuario, quiero registrar integrantes en un proyecto para
// asignarles trabajo. Permite agregar integrantes (nombre + datos básicos)
// y muestra la lista de integrantes del proyecto. No permite nombres vacíos.

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import styles from "../../proyectos.module.css";
import formStyles from "../../nuevo/nuevo.module.css";
import { getInitials, getAvatarColor } from "@/lib/avatar";

export default function IntegrantesPage() {
  const { id } = useParams();

  const [integrantes, setIntegrantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState("");
  const [erroresForm, setErroresForm] = useState([]);
  const [enviando, setEnviando] = useState(false);

  async function cargarIntegrantes() {
    try {
      const res = await fetch(`/api/projects/${id}/members`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "No se pudieron cargar los integrantes.");
        return;
      }

      const data = await res.json();
      setIntegrantes(data.integrantes || []);
      setError("");
    } catch (err) {
      setError("Error de conexión al cargar los integrantes.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarIntegrantes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErroresForm([]);

    if (!nombre.trim()) {
      setErroresForm(["El nombre del integrante es obligatorio."]);
      return;
    }

    setEnviando(true);

    try {
      const res = await fetch(`/api/projects/${id}/members`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, rol }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErroresForm([data.error || "No se pudo agregar el integrante."]);
        return; // no se pierde lo ya escrito
      }

      setNombre("");
      setEmail("");
      setRol("");
      await cargarIntegrantes();
    } catch (err) {
      setErroresForm(["Error de conexión al agregar el integrante."]);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Integrantes</h1>
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

          <label className={formStyles.label} htmlFor="email">
            Correo (opcional)
          </label>
          <input
            id="email"
            type="email"
            className={formStyles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className={formStyles.label} htmlFor="rol">
            Rol (opcional)
          </label>
          <input
            id="rol"
            type="text"
            className={formStyles.input}
            value={rol}
            onChange={(e) => setRol(e.target.value)}
          />

          <div className={formStyles.actions}>
            <button type="submit" className={styles.primaryButton} disabled={enviando}>
              {enviando ? "Agregando..." : "Agregar integrante"}
            </button>
          </div>
        </form>

        {cargando && <p className={styles.info}>Cargando integrantes...</p>}
        {!cargando && error && <p className={styles.error}>{error}</p>}

        {!cargando && !error && integrantes.length === 0 && (
          <div className={styles.emptyState}>
            <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="9" cy="8" r="3.2" />
              <path d="M3.5 19c0-3 2.5-5.2 5.5-5.2s5.5 2.2 5.5 5.2" strokeLinecap="round" />
              <circle cx="17" cy="8.5" r="2.4" />
              <path d="M15.5 13.7c2.6.2 4.6 2.2 4.6 4.8" strokeLinecap="round" />
            </svg>
            <p className={styles.emptyTitle}>Este proyecto aún no tiene integrantes</p>
            <p>Agrega el primero arriba para poder asignarle tareas.</p>
          </div>
        )}

        {!cargando && !error && integrantes.length > 0 && (
          <ul className={styles.list}>
            {integrantes.map((integrante) => (
              <li key={integrante.id} className={styles.listItem}>
                <div className={styles.listItemHeader} style={{ marginBottom: integrante.email ? 6 : 0 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span
                      className={styles.avatar}
                      style={{ backgroundColor: getAvatarColor(integrante.nombre) }}
                    >
                      {getInitials(integrante.nombre)}
                    </span>
                    <span className={styles.projectName}>{integrante.nombre}</span>
                  </span>
                  {integrante.rol && <span className={styles.dueDate}>{integrante.rol}</span>}
                </div>
                {integrante.email && (
                  <span className={styles.info} style={{ marginLeft: 40 }}>
                    {integrante.email}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
