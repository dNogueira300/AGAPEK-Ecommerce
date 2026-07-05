import type { ProductCardData } from "@/components/tienda/product-card";
import { urlWhatsApp } from "@/lib/whatsapp";

interface ProductoInput {
  id: string;
  slug: string;
  nombre: string;
  precio: unknown;
  precioOferta: unknown;
  stock: number;
  nuevo: boolean;
  marca: { nombre: string };
  imagenes: { url: string; alt: string | null }[];
}

/** Nº de reseñas placeholder, estable por producto (datos de prueba). */
function pseudoReviews(slug: string): number {
  const sum = [...slug].reduce((a, c) => a + c.charCodeAt(0), 0);
  return (sum % 230) + 20;
}

export function toProductCard(
  p: ProductoInput,
  whatsapp: string | null,
  favorito = false,
): ProductCardData {
  return {
    id: p.id,
    favorito,
    slug: p.slug,
    nombre: p.nombre,
    marca: p.marca.nombre,
    precio: Number(p.precio),
    precioOferta: p.precioOferta != null ? Number(p.precioOferta) : null,
    imagen: p.imagenes[0]?.url ?? "/productos/generico.svg",
    alt: p.imagenes[0]?.alt ?? p.nombre,
    nuevo: p.nuevo,
    agotado: p.stock <= 0,
    stock: p.stock,
    reviews: pseudoReviews(p.slug),
    consultaUrl: whatsapp
      ? urlWhatsApp(whatsapp, `¡Hola AGAPEK! 🌸 Quiero consultar por *${p.nombre}*.`)
      : null,
    rating: 5,
  };
}
