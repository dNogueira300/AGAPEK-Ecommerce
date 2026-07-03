import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProductCard, type ProductCardData } from "@/components/tienda/product-card";

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Explora productos coreanos de skincare originales en AGAPEK.",
};

// Datos frescos desde la BD en cada request (aún sin caché durante desarrollo).
export const dynamic = "force-dynamic";

export default async function CatalogoPage() {
  const productos = await prisma.producto.findMany({
    where: { activo: true },
    orderBy: [{ destacado: "desc" }, { createdAt: "desc" }],
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
    rating: 5,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Nuestros productos
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {cards.length} producto{cards.length === 1 ? "" : "s"} · skincare coreano original
        </p>
      </header>

      {cards.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
          Aún no hay productos publicados.
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
