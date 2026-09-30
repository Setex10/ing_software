/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Salida standalone: permite una imagen Docker liviana (solo copia lo que
  // el servidor necesita para correr, sin arrastrar node_modules completo).
  output: "standalone",
  // Oculta la cabecera "X-Powered-By: Next.js" (hallazgo real de un escaneo
  // OWASP ZAP: revelar el framework facilita a un atacante buscar exploits
  // conocidos de esa versión).
  poweredByHeader: false,
  async headers() {
    // Cabeceras de seguridad recomendadas por OWASP para mitigar clickjacking,
    // sniffing de MIME type, fuga de información en el header Referer y
    // ejecución de scripts/recursos no autorizados (CSP). La CSP se agregó
    // tras un hallazgo real de OWASP ZAP ("CSP Header Not Set").
    //
    // En desarrollo, "next dev" necesita 'unsafe-eval' para su Fast Refresh
    // (usa eval() internamente); sin eso el navegador bloquea la hidratación
    // de React y ningún botón/formulario responde. En producción ("next
    // build" + "next start", que es lo que corre en Docker) no hace falta:
    // ahí la CSP queda más estricta, sin 'unsafe-eval'.
    const scriptSrc =
      process.env.NODE_ENV === "production"
        ? "script-src 'self' 'unsafe-inline'"
        : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";

    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Content-Security-Policy",
            value:
              `default-src 'self'; ${scriptSrc}; ` +
              "style-src 'self' 'unsafe-inline'; img-src 'self' data:; " +
              "font-src 'self'; connect-src 'self'; form-action 'self'; " +
              "frame-src 'none'; object-src 'none'; base-uri 'self'; " +
              "frame-ancestors 'none'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
