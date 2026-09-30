// app/proyectos/page.js
//
// Página protegida por el middleware.js existente (que verifica la cookie
// httpOnly de sesión antes de dejar pasar la petición a /proyectos).
// Es un Client Component porque hace fetch a GET /api/projects al cargar,
// tal como pide el requisito.

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./proyectos.module.css";
import LogoutButton from "../components/LogoutButton";

function formatearFecha(fechaISO) {
  const fecha = new Date(fechaISO);
  return fecha.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export default function ProyectosPage() {
  const [proyectos, setProyectos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargarProyectos() {
      try {
        const res = await fetch("/api/projects", {
          method: "GET",
          credentials: "include", // envía la cookie httpOnly de sesión
        });

        if (res.status === 401) {
          setError("Tu sesión expiró. Vuelve a iniciar sesión.");
          setCargando(false);
          return;
        }

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || "No se pudieron cargar tus proyectos.");
          setCargando(false);
          return;
        }

        const data = await res.json();
        setProyectos(data.proyectos || []);
      } catch (err) {
        setError("Error de conexión al cargar tus proyectos.");
      } finally {
        setCargando(false);
      }
    }

    cargarProyectos();
  }, []);

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Mis proyectos</h1>
          <div style={{ display: "flex", gap: 12 }}>
            <Link href="/proyectos/nuevo" className={styles.primaryButton}>
              + Nuevo proyecto
            </Link>
            <LogoutButton className={styles.secondaryButton} />
          </div>
        </div>

        {cargando && <p className={styles.info}>Cargando proyectos...</p>}

        {!cargando && error && <p className={styles.error}>{error}</p>}

        {!cargando && !error && proyectos.length === 0 && (
          <div className={styles.emptyState}>
            <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 6a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6Z" />
            </svg>
            <p className={styles.emptyTitle}>Aún no tienes proyectos</p>
            <p>Crea el primero para empezar a organizar tareas e integrantes.</p>
            <Link href="/proyectos/nuevo" className={styles.primaryButton}>
              Crear mi primer proyecto
            </Link>
          </div>
        )}

        {!cargando && !error && proyectos.length > 0 && (
          <ul className={styles.list}>
            {proyectos.map((proyecto) => (
              <li key={proyecto._id} className={styles.listItem}>
                <Link href={`/proyectos/${proyecto._id}`} style={{ textDecoration: "none" }}>
                  <div className={styles.listItemHeader}>
                    <span className={styles.projectName}>{proyecto.nombre}</span>
                    <span className={styles.dueDate}>
                      Vence: {formatearFecha(proyecto.fechaLimite)}
                    </span>
                  </div>

                  <div className={styles.metaRow}>
                    <span className={styles.metaItem}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="9" cy="8" r="3" />
                        <path d="M3.5 18.5c0-2.8 2.4-5 5.5-5s5.5 2.2 5.5 5" strokeLinecap="round" />
                        <circle cx="17" cy="8.5" r="2.2" />
                        <path d="M15.7 13.6c2.3.3 4 2.1 4 4.4" strokeLinecap="round" />
                      </svg>
                      {proyecto.totalIntegrantes} integrante{proyecto.totalIntegrantes === 1 ? "" : "s"}
                    </span>
                    <span className={styles.metaItem}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="4" y="3" width="16" height="18" rx="2" />
                        <path d="M8 8h8M8 12h8M8 16h5" strokeLinecap="round" />
                      </svg>
                      {proyecto.tareasCompletadas}/{proyecto.totalTareas} tareas
                    </span>
                  </div>

                  <div className={styles.progressRow} style={{ marginTop: 10 }}>
                    <div className={styles.progressBarTrack}>
                      <div
                        className={styles.progressBarFill}
                        style={{ width: `${proyecto.porcentajeAvance}%` }}
                      />
                    </div>
                    <span className={styles.progressLabel}>
                      {proyecto.porcentajeAvance}%
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
