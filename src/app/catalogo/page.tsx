import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/tienda/product-card";
import { toProductCard } from "@/lib/product-card";
import { getFavoritoIds } from "@/lib/favorito-actions";
import { CatalogSidebar } from "@/components/tienda/catalog-sidebar";
import { CatalogSort } from "@/components/tienda/catalog-sort";
import { Stagger, StaggerItem } from "@/components/tienda/motion";

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Explora productos coreanos de skincare originales en AGAPEK.",
};

export const dynamic = "force-dynamic";

const ORDEN: Record<string, Prisma.ProductoOrderByWithRelationInput[]> = {
  relevancia: [{ destacado: "desc" }, { createdAt: "desc" }],
  nuevo: [{ createdAt: "desc" }],
  "precio-asc": [{ precio: "asc" }],
  "precio-desc": [{ precio: "desc" }],
};

const lista = (v?: string) => (v ? v.split(",").filter(Boolean) : []);

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    sort?: string;
    cat?: string;
    marca?: string;
    piel?: string;
    nec?: string;
    min?: string;
    max?: string;
  }>;
}) {
  const sp = await searchParams;
  const busqueda = sp.q?.trim() ?? "";
  const sort = sp.sort && sp.sort in ORDEN ? sp.sort : "relevancia";
  const cats = lista(sp.cat);
  const marcasF = lista(sp.marca);
  const piel = lista(sp.piel);
  const nec = lista(sp.nec);
  const min = sp.min ? Number(sp.min) : undefined;
  const max = sp.max ? Number(sp.max) : undefined;

  const [categorias, marcas, cfg] = await Promise.all([
    prisma.categoria.findMany({ orderBy: { orden: "asc" } }),
    prisma.marca.findMany({ orderBy: { nombre: "asc" } }),
    prisma.configuracion.findUnique({ where: { clave: "whatsapp" } }),
  ]);
  const whatsapp = typeof cfg?.valor === "string" ? cfg.valor : null;

  const precioFilter: Prisma.DecimalFilter | undefined =
    min !== undefined || max !== undefined
      ? {
          ...(min !== undefined ? { gte: min } : {}),
          ...(max !== undefined ? { lte: max } : {}),
        }
      : undefined;

  const where: Prisma.ProductoWhereInput = {
    activo: true,
    ...(cats.length ? { categoria: { is: { slug: { in: cats } } } } : {}),
    ...(marcasF.length ? { marca: { is: { slug: { in: marcasF } } } } : {}),
    ...(piel.length ? { tipoPiel: { hasSome: piel } } : {}),
    ...(nec.length ? { necesidad: { hasSome: nec } } : {}),
    ...(precioFilter ? { precio: precioFilter } : {}),
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
    include: { marca: true, imagenes: { orderBy: { orden: "asc" }, take: 1 } },
  });
  const favIds = await getFavoritoIds();
  const cards = productos.map((p) => toProductCard(p, whatsapp, favIds.has(p.id)));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Encabezado */}
      <div className="border-border flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-muted-foreground text-xs">Inicio / Catálogo</p>
          <h1 className="font-display text-foreground mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
            {busqueda ? `Resultados para “${busqueda}”` : "Catálogo"}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {cards.length} producto{cards.length === 1 ? "" : "s"}
          </p>
        </div>
        <CatalogSort value={sort} />
      </div>

      {/* Contenido */}
      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:gap-8">
        <CatalogSidebar
          categorias={categorias.map((c) => ({ value: c.slug, label: c.nombre }))}
          marcas={marcas.map((m) => ({ value: m.slug, label: m.nombre }))}
        />

        <div className="flex-1">
          {cards.length === 0 ? (
            <p className="border-border bg-card text-muted-foreground rounded-2xl border border-dashed p-10 text-center">
              No encontramos productos con esos filtros.
            </p>
          ) : (
            <Stagger className="grid grid-cols-2 gap-4 md:grid-cols-3" stagger={0.05}>
              {cards.map((p) => (
                <StaggerItem key={p.slug}>
                  <ProductCard p={p} />
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </div>
      </div>
    </div>
  );
}
