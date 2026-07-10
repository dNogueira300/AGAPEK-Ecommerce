import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Star } from "lucide-react";
import { AddToCartWide } from "@/components/tienda/add-to-cart-button";
import { FavoriteIconButton } from "@/components/tienda/favorite-button";

export interface ProductCardData {
  id: string;
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
  favorito?: boolean;
}

const soles = (n: number) => `S/ ${n.toFixed(2)}`;

export function ProductCard({ p }: { p: ProductCardData }) {
  const enOferta = p.precioOferta != null && p.precioOferta < p.precio;
  const precioFinal = enOferta ? p.precioOferta! : p.precio;

  return (
    <div className="group border-border bg-card hover:shadow-primary/5 relative flex flex-col overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link
        href={`/producto/${p.slug}`}
        className="bg-secondary relative block aspect-square overflow-hidden"
      >
        <Image
          src={p.imagen}
          alt={p.alt}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          unoptimized={p.imagen.endsWith(".svg")}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {p.nuevo && (
            <span className="bg-chart-5/90 w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
              Nuevo
            </span>
          )}
          {enOferta && (
            <span className="bg-primary text-primary-foreground w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm">
              Oferta
            </span>
          )}
        </div>
        {p.agotado && (
          <div className="bg-background/55 absolute inset-0 flex items-center justify-center backdrop-blur-[1px]">
            <span className="bg-foreground/85 text-background rounded-full px-3 py-1.5 text-xs font-semibold">
              Agotado
            </span>
          </div>
        )}
      </Link>

      <div className="absolute top-3 right-3 z-10">
        <FavoriteIconButton productoId={p.id} inicial={p.favorito} />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <span className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
          {p.marca}
        </span>
        <Link
          href={`/producto/${p.slug}`}
          className="text-foreground hover:text-primary mt-1 line-clamp-2 text-sm font-medium transition-colors"
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
          <span className="text-muted-foreground text-xs">({p.reviews})</span>
        </div>

        {/* Precio */}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-foreground text-base font-semibold">
            {soles(precioFinal)}
          </span>
          {enOferta && (
            <span className="text-muted-foreground text-xs line-through">
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
              aria-label={`Consultar ${p.nombre} por WhatsApp`}
              className="border-chart-5/40 hover:bg-chart-5/10 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-full border px-2 text-sm font-semibold whitespace-nowrap text-[color:var(--chart-5)] transition-colors"
            >
              <MessageCircle className="size-4 shrink-0" />
              WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
