"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";

/*
  Transición de entrada entre rutas de la tienda.
  - NO anima la carga inicial (el HTML del servidor queda visible de inmediato:
    protege LCP y a usuarios sin JS); solo navegaciones posteriores.
  - Se omite en /admin.
*/
let hasNavigated = false;

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  // Se evalúa una sola vez al montar (cada navegación monta un nuevo template).
  const [isFirstLoad] = useState(() => !hasNavigated);

  useEffect(() => {
    hasNavigated = true;
  }, []);

  if (isFirstLoad || pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
