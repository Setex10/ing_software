import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        textAlign: "center",
        padding: 24,
      }}
    >
      <h1>Sistema de Gestión de Proyectos y Tareas</h1>
      <p>
        Esta página de inicio es un punto de partida temporal. Cuando agregues
        el módulo de autenticación (login), reemplázala o redirige aquí a{" "}
        <code>/login</code>.
      </p>
      <Link href="/proyectos">Ir a Mis proyectos</Link>
    </main>
  );
}
