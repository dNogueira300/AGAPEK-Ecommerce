import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getPerfil } from "@/lib/auth";
import { ProductCard } from "@/components/tienda/product-card";
import { toProductCard } from "@/lib/product-card";

export const metadata: Metadata = { title: "Mis favoritos" };
export const dynamic = "force-dynamic";

export default async function FavoritosPage() {
  const data = await getPerfil();
  if (!data) redirect("/login?redirect=/favoritos");

  const [productos, cfg] = await Promise.all([
    prisma.producto.findMany({
      where: { activo: true, favoritoDe: { some: { id: data.perfil.id } } },
      orderBy: { createdAt: "desc" },
      include: { marca: true, imagenes: { orderBy: { orden: "asc" }, take: 1 } },
    }),
    prisma.configuracion.findUnique({ where: { clave: "whatsapp" } }),
  ]);
  const whatsapp = typeof cfg?.valor === "string" ? cfg.valor : null;
  const cards = productos.map((p) => toProductCard(p, whatsapp, true));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="border-b border-border pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Tu selección</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Mis favoritos
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {cards.length > 0
            ? `${cards.length} ${cards.length === 1 ? "producto guardado" : "productos guardados"}.`
            : "Aún no has guardado productos."}
        </p>
      </header>

      {cards.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {cards.map((c) => (
            <ProductCard key={c.id} p={c} />
          ))}
        </div>
      ) : (
        <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/30 px-6 py-16 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-background text-primary shadow-sm">
            <Heart className="size-7" />
          </span>
          <h2 className="mt-4 font-display text-lg font-semibold text-foreground">
            Tu lista está vacía
          </h2>
          <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
            Toca el corazón en cualquier producto para guardarlo aquí y encontrarlo fácilmente.
          </p>
          <Link
            href="/catalogo"
            className="mt-5 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5"
          >
            Explorar catálogo
          </Link>
        </div>
      )}
    </div>
  );
}
