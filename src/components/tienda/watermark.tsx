"use client";

import { usePathname } from "next/navigation";

/**
 * Marca de agua sutil con la estrella del logo (Sparkles) repetida por toda
 * la tienda pública, para que el fondo no sea blanco plano. Se dibuja detrás
 * del contenido (las superficies con fondo propio la cubren) y se omite en /admin.
 */
export function Watermark() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <div aria-hidden className="watermark pointer-events-none fixed inset-0 -z-10" />
  );
}
