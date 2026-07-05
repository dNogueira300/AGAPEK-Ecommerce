"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toggleFavorito } from "@/lib/favorito-actions";
import { cn } from "@/lib/utils";

function useToggle(productoId: string, inicial: boolean) {
  const router = useRouter();
  const pathname = usePathname();
  const [favorito, setFavorito] = useState(inicial);
  const [pending, start] = useTransition();

  const toggle = () => {
    const previo = favorito;
    setFavorito(!previo); // optimista
    start(async () => {
      const res = await toggleFavorito(productoId);
      if ("error" in res) {
        setFavorito(previo); // revertir
        if (res.error === "AUTH") {
          router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
        }
      } else {
        setFavorito(res.favorito);
      }
    });
  };

  return { favorito, pending, toggle };
}

/** Botón corazón compacto para las cards (esquina de la imagen). */
export function FavoriteIconButton({
  productoId,
  inicial = false,
}: {
  productoId: string;
  inicial?: boolean;
}) {
  const { favorito, pending, toggle } = useToggle(productoId, inicial);

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={favorito}
      aria-label={favorito ? "Quitar de favoritos" : "Guardar en favoritos"}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm backdrop-blur-sm transition-all hover:bg-background hover:scale-105",
        favorito && "text-primary",
      )}
    >
      <Heart className={cn("size-4.5 transition-all", favorito && "fill-primary")} />
    </button>
  );
}

/** Botón corazón con texto para la ficha de producto. */
export function FavoriteWideButton({
  productoId,
  inicial = false,
}: {
  productoId: string;
  inicial?: boolean;
}) {
  const { favorito, pending, toggle } = useToggle(productoId, inicial);

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={favorito}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-full border px-5 text-sm font-semibold transition-colors",
        favorito
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border text-foreground hover:bg-secondary",
      )}
    >
      <Heart className={cn("size-4.5", favorito && "fill-primary")} />
      {favorito ? "En favoritos" : "Guardar"}
    </button>
  );
}
