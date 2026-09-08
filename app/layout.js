import "./globals.css";

export const metadata = {
  title: "Sistema de Gestión de Proyectos y Tareas",
  description: "Proyecto integrador - Ingeniería en Desarrollo de Software",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
