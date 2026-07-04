import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Star } from "lucide-react";
import { AddToCartWide } from "@/components/tienda/add-to-cart-button";

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
  stock: number;
  reviews: number;
  consultaUrl: string | null;
  rating?: number;
}

const soles = (n: number) => `S/ ${n.toFixed(2)}`;

export function ProductCard({ p }: { p: ProductCardData }) {
  const enOferta = p.precioOferta != null && p.precioOferta < p.precio;
  const precioFinal = enOferta ? p.precioOferta! : p.precio;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-md">
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
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {p.nuevo && (
            <span className="w-fit rounded-full bg-chart-5/90 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
              Nuevo
            </span>
          )}
          {enOferta && (
            <span className="w-fit rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground shadow-sm">
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
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {p.marca}
        </span>
        <Link
          href={`/producto/${p.slug}`}
          className="mt-1 line-clamp-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
        >
          {p.nombre}
        </Link>

        {/* Rating */}
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
            ))}
          </span>
          <span className="text-xs text-muted-foreground">({p.reviews})</span>
        </div>

        {/* Precio */}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-semibold text-foreground">
            {soles(precioFinal)}
          </span>
          {enOferta && (
            <span className="text-xs text-muted-foreground line-through">
              {soles(p.precio)}
            </span>
          )}
        </div>

        {/* Acciones */}
        <div className="mt-3 flex flex-col gap-2">
          <AddToCartWide
            producto={{
              slug: p.slug,
              nombre: p.nombre,
              marca: p.marca,
              precio: precioFinal,
              imagen: p.imagen,
              stock: p.stock,
            }}
            agotado={p.agotado}
          />
          {p.consultaUrl && (
            <a
              href={p.consultaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-chart-5/40 text-sm font-semibold text-[color:var(--chart-5)] transition-colors hover:bg-chart-5/10"
            >
              <MessageCircle className="size-4" />
              Consultar WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
