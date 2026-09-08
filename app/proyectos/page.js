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
          <Link href="/proyectos/nuevo" className={styles.primaryButton}>
            + Nuevo proyecto
          </Link>
        </div>

        {cargando && <p className={styles.info}>Cargando proyectos...</p>}

        {!cargando && error && <p className={styles.error}>{error}</p>}

        {!cargando && !error && proyectos.length === 0 && (
          <div className={styles.emptyState}>
            <p>Aún no tienes proyectos.</p>
            <Link href="/proyectos/nuevo" className={styles.primaryButton}>
              Crear mi primer proyecto
            </Link>
          </div>
        )}

        {!cargando && !error && proyectos.length > 0 && (
          <ul className={styles.list}>
            {proyectos.map((proyecto) => (
              <li key={proyecto._id} className={styles.listItem}>
                <div className={styles.listItemHeader}>
                  <span className={styles.projectName}>{proyecto.nombre}</span>
                  <span className={styles.dueDate}>
                    Vence: {formatearFecha(proyecto.fechaLimite)}
                  </span>
                </div>

                <div className={styles.progressRow}>
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
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
