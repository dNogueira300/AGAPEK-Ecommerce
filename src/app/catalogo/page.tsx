import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ProductCard, type ProductCardData } from "@/components/tienda/product-card";
import {
  CatalogFilters,
  FILTROS_NECESIDAD,
} from "@/components/tienda/catalog-filters";
import { CatalogToolbar } from "@/components/tienda/catalog-toolbar";

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Explora productos coreanos de skincare originales en AGAPEK.",
};

// Datos frescos desde la BD en cada request (aún sin caché durante desarrollo).
export const dynamic = "force-dynamic";

const NECESIDADES = FILTROS_NECESIDAD.map((f) => f.value);

const ORDEN: Record<string, Prisma.ProductoOrderByWithRelationInput[]> = {
  relevancia: [{ destacado: "desc" }, { createdAt: "desc" }],
  nuevo: [{ createdAt: "desc" }],
  "precio-asc": [{ precio: "asc" }],
  "precio-desc": [{ precio: "desc" }],
};

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{
    n?: string;
    q?: string;
    cat?: string;
    marca?: string;
    sort?: string;
    disp?: string;
  }>;
}) {
  const sp = await searchParams;
  const necesidad = sp.n && NECESIDADES.includes(sp.n as never) ? sp.n : "todos";
  const busqueda = sp.q?.trim() ?? "";
  const cat = sp.cat ?? "todas";
  const marca = sp.marca ?? "todas";
  const sort = sp.sort && sp.sort in ORDEN ? sp.sort : "relevancia";
  const soloDisponibles = sp.disp === "1";

  const [categorias, marcas] = await Promise.all([
    prisma.categoria.findMany({ orderBy: { orden: "asc" } }),
    prisma.marca.findMany({ orderBy: { nombre: "asc" } }),
  ]);

  const where: Prisma.ProductoWhereInput = {
    activo: true,
    ...(necesidad !== "todos" ? { necesidad: { has: necesidad } } : {}),
    ...(cat !== "todas" ? { categoria: { is: { slug: cat } } } : {}),
    ...(marca !== "todas" ? { marca: { is: { slug: marca } } } : {}),
    ...(soloDisponibles ? { stock: { gt: 0 } } : {}),
    ...(busqueda
      ? {
          OR: [
            { nombre: { contains: busqueda, mode: "insensitive" } },
            { descripcionCorta: { contains: busqueda, mode: "insensitive" } },
            { marca: { is: { nombre: { contains: busqueda, mode: "insensitive" } } } },
          ],
        }
      : {}),
  };

  const productos = await prisma.producto.findMany({
    where,
    orderBy: ORDEN[sort] ?? ORDEN.relevancia,
    include: {
      marca: true,
      imagenes: { orderBy: { orden: "asc" }, take: 1 },
    },
  });

  const cards: ProductCardData[] = productos.map((p) => ({
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
    rating: 5,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {busqueda ? `Resultados para “${busqueda}”` : "Nuestros productos"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {cards.length} producto{cards.length === 1 ? "" : "s"} · skincare coreano original
        </p>
      </header>

      <div className="mb-6">
        <CatalogFilters active={necesidad} />
      </div>
      <div className="mb-8 border-b border-border pb-6">
        <CatalogToolbar
          categorias={categorias.map((c) => ({ value: c.slug, label: c.nombre }))}
          marcas={marcas.map((m) => ({ value: m.slug, label: m.nombre }))}
          actual={{ cat, marca, sort, disp: soloDisponibles }}
        />
      </div>

      {cards.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
          {busqueda
            ? `No encontramos productos para “${busqueda}”.`
            : "No hay productos para este filtro por ahora."}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {cards.map((p) => (
            <ProductCard key={p.slug} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}
