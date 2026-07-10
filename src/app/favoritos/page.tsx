import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getConfigValor } from "@/lib/cache";
import { getPerfil } from "@/lib/auth";
import { ProductCard } from "@/components/tienda/product-card";
import { toProductCard } from "@/lib/product-card";

export const metadata: Metadata = { title: "Mis favoritos" };
export const dynamic = "force-dynamic";

export default async function FavoritosPage() {
  const data = await getPerfil();
  if (!data) redirect("/login?redirect=/favoritos");

  const [productos, whatsapp] = await Promise.all([
    prisma.producto.findMany({
      where: { activo: true, favoritoDe: { some: { id: data.perfil.id } } },
      orderBy: { createdAt: "desc" },
      include: { marca: true, imagenes: { orderBy: { orden: "asc" }, take: 1 } },
    }),
    getConfigValor("whatsapp"),
  ]);
  const cards = productos.map((p) => toProductCard(p, whatsapp, true));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="border-border border-b pb-6">
        <p className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">
          Tu selección
        </p>
        <h1 className="font-display text-foreground mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Mis favoritos
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
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
        <div className="border-border bg-secondary/30 mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-16 text-center">
          <span className="bg-background text-primary flex size-14 items-center justify-center rounded-full shadow-sm">
            <Heart className="size-7" />
          </span>
          <h2 className="font-display text-foreground mt-4 text-lg font-semibold">
            Tu lista está vacía
          </h2>
          <p className="text-muted-foreground mt-1.5 max-w-sm text-sm">
            Toca el corazón en cualquier producto para guardarlo aquí y encontrarlo
            fácilmente.
          </p>
          <Link
            href="/catalogo"
            className="bg-primary text-primary-foreground mt-5 inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold shadow-sm transition-transform hover:-translate-y-0.5"
          >
            Explorar catálogo
          </Link>
        </div>
      )}
    </div>
  );
}
