"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ReactLenis } from "lenis/react";

/**
 * Smooth scroll (Lenis) solo para la tienda pública.
 * - Se desactiva en /admin (el panel usa scroll nativo, registro product).
 * - Se desactiva por completo con prefers-reduced-motion.
 */
export function SmoothScroll() {
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(!mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (!enabled || pathname.startsWith("/admin")) return null;

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.12,
        wheelMultiplier: 1,
        touchMultiplier: 1.4,
        anchors: true,
      }}
    />
  );
}
