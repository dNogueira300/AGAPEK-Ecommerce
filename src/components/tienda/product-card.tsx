import Image from "next/image";
import Link from "next/link";
import { Plus, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProductCardData {
  slug: string;
  nombre: string;
  marca: string;
  precio: number;
  precioOferta: number | null;
  imagen: string;
  alt: string;
  nuevo: boolean;
  agotado: boolean;
  rating?: number;
}

const soles = (n: number) => `S/ ${n.toFixed(2)}`;

export function ProductCard({ p }: { p: ProductCardData }) {
  const enOferta = p.precioOferta != null && p.precioOferta < p.precio;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-md">
      <Link
        href={`/producto/${p.slug}`}
        className="relative block aspect-square overflow-hidden bg-secondary"
      >
        <Image
          src={p.imagen}
          alt={p.alt}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          unoptimized={p.imagen.endsWith(".svg")}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex gap-1.5">
          {p.nuevo && (
            <span className="rounded-full bg-card/90 px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-sm backdrop-blur">
              Nuevo
            </span>
          )}
          {enOferta && (
            <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground shadow-sm">
              Oferta
            </span>
          )}
        </div>
        {p.agotado && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/55 backdrop-blur-[1px]">
            <span className="rounded-full bg-foreground/85 px-3 py-1.5 text-xs font-semibold text-background">
              Agotado
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {p.marca}
          </span>
          {p.rating != null && (
            <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-foreground">
              <Star className="size-3.5 fill-primary text-primary" />
              {p.rating.toFixed(1)}
            </span>
          )}
        </div>

        <Link
          href={`/producto/${p.slug}`}
          className="mt-1 line-clamp-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
        >
          {p.nombre}
        </Link>

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div className="flex flex-col leading-tight">
            {enOferta && (
              <span className="text-xs text-muted-foreground line-through">
                {soles(p.precio)}
              </span>
            )}
            <span className="text-base font-semibold text-foreground">
              {soles(enOferta ? p.precioOferta! : p.precio)}
            </span>
          </div>
          <button
            type="button"
            aria-label={p.agotado ? "Consultar por WhatsApp" : `Agregar ${p.nombre} al carrito`}
            disabled={p.agotado}
            className={cn(
              "inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md",
              p.agotado && "cursor-not-allowed opacity-40 hover:translate-y-0 hover:shadow-sm",
            )}
          >
            <Plus className="size-4.5" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
