// app/proyectos/[id]/page.js
//
// Detalle de un proyecto: datos básicos, avance, y accesos a los módulos
// de Integrantes y Tareas.

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import styles from "../proyectos.module.css";
import LogoutButton from "../../components/LogoutButton";

function formatearFecha(fechaISO) {
  const fecha = new Date(fechaISO);
  return fecha.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export default function ProyectoDetallePage() {
  const { id } = useParams();

  const [proyecto, setProyecto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargarProyecto() {
      try {
        const res = await fetch(`/api/projects/${id}`, {
          method: "GET",
          credentials: "include",
        });

        if (res.status === 401) {
          setError("Tu sesión expiró. Vuelve a iniciar sesión.");
          return;
        }

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || "No se pudo cargar el proyecto.");
          return;
        }

        const data = await res.json();
        setProyecto(data.proyecto);
      } catch (err) {
        setError("Error de conexión al cargar el proyecto.");
      } finally {
        setCargando(false);
      }
    }

    cargarProyecto();
  }, [id]);

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Link href="/proyectos" className={styles.secondaryButton}>
            &larr; Mis proyectos
          </Link>
          <LogoutButton className={styles.secondaryButton} />
        </div>

        {cargando && <p className={styles.info}>Cargando proyecto...</p>}
        {!cargando && error && <p className={styles.error}>{error}</p>}

        {!cargando && !error && proyecto && (
          <>
            <h1 className={styles.title}>{proyecto.nombre}</h1>
            <p className={styles.info}>{proyecto.descripcion}</p>
            <p className={styles.dueDate}>
              Vence: {formatearFecha(proyecto.fechaLimite)}
            </p>

            <div className={styles.progressRow} style={{ margin: "16px 0 24px" }}>
              <div className={styles.progressBarTrack}>
                <div
                  className={styles.progressBarFill}
                  style={{ width: `${proyecto.porcentajeAvance}%` }}
                />
              </div>
              <span className={styles.progressLabel}>{proyecto.porcentajeAvance}%</span>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <Link href={`/proyectos/${id}/integrantes`} className={styles.primaryButton}>
                Integrantes
              </Link>
              <Link href={`/proyectos/${id}/tareas`} className={styles.primaryButton}>
                Tareas
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
