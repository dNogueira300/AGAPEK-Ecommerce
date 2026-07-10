import { revalidateTag, unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

/**
 * Invalida un tag de caché sin tumbar la operación si el runtime lo rechaza
 * (en producción el guardado de configuración devolvía un error de servidor).
 * Si la invalidación falla, las entradas expiran solas por su `revalidate`.
 */
export function invalidarTag(tag: string) {
  try {
    revalidateTag(tag, "max");
  } catch (e) {
    console.error(`invalidarTag("${tag}") falló:`, e);
  }
}

/*
  Lecturas calientes del storefront con caché entre requests (Lighthouse:
  "Document request latency" — el TTFB se iba en repetir las mismas consultas
  en cada visita). Cada helper lleva un tag que las server actions del panel
  invalidan al editar, así el contenido administrable se refleja al instante
  y el `revalidate` queda solo como red de seguridad.

  Ojo: unstable_cache serializa a JSON — no cachear aquí modelos con Decimal
  (productos/pedidos) sin convertir antes.
*/

export const getConfigValor = unstable_cache(
  async (clave: string): Promise<string | null> => {
    const row = await prisma.configuracion.findUnique({ where: { clave } });
    return typeof row?.valor === "string" && row.valor.trim() ? row.valor.trim() : null;
  },
  ["config-valor"],
  { revalidate: 300, tags: ["config"] },
);

export const getConfigValores = unstable_cache(
  async (claves: string[]): Promise<Record<string, unknown>> => {
    const rows = await prisma.configuracion.findMany({
      where: { clave: { in: claves } },
    });
    return Object.fromEntries(rows.map((r) => [r.clave, r.valor]));
  },
  ["config-valores"],
  { revalidate: 300, tags: ["config"] },
);

export const getBannersActivos = unstable_cache(
  async () =>
    prisma.banner.findMany({ where: { activo: true }, orderBy: { orden: "asc" } }),
  ["banners-activos"],
  { revalidate: 300, tags: ["banners"] },
);

export const getMarcasTienda = unstable_cache(
  async () => prisma.marca.findMany({ orderBy: { nombre: "asc" } }),
  ["marcas-tienda"],
  { revalidate: 300, tags: ["marcas"] },
);

export const getMarcasAliadas = unstable_cache(
  async () =>
    prisma.marca.findMany({ where: { aliada: true }, orderBy: { nombre: "asc" } }),
  ["marcas-aliadas"],
  { revalidate: 300, tags: ["marcas"] },
);

export const getCategoriasTienda = unstable_cache(
  async () => prisma.categoria.findMany({ orderBy: { orden: "asc" } }),
  ["categorias-tienda"],
  { revalidate: 300, tags: ["categorias"] },
);

export const getTestimoniosActivos = unstable_cache(
  async () => prisma.testimonio.findMany({ where: { activo: true }, take: 6 }),
  ["testimonios-activos"],
  { revalidate: 300, tags: ["testimonios"] },
);
