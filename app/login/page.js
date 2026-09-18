// app/login/page.js
//
// Envuelto en Suspense porque LoginForm usa useSearchParams (requerido por
// Next.js App Router para componentes cliente que leen la query string).

import { Suspense } from "react";
import LoginForm from "./LoginForm";
import { CREDENCIALES_DEMO } from "@/lib/authUsers";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm credencialesDemo={CREDENCIALES_DEMO} />
    </Suspense>
  );
}
