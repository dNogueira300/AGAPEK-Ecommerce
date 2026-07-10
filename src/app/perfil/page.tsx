import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Package,
  Search,
  ShoppingBag,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getPerfil, ROLES_ADMIN } from "@/lib/auth";
import { signOutAction } from "@/lib/auth-actions";
import { formatFecha } from "@/lib/date";
import { ESTADO_LABEL, estadoBadge } from "@/lib/pedido-labels";
import { ReordenarButton } from "@/components/tienda/reordenar-button";
import { PerfilDatosCard } from "@/components/tienda/perfil-datos";

export const metadata: Metadata = { title: "Mi perfil" };
export const dynamic = "force-dynamic";

const soles = (n: number) => `S/ ${n.toFixed(2)}`;

export default async function PerfilPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const data = await getPerfil();
  if (!data) redirect("/login?redirect=/perfil");

  const { perfil, email } = data;
  const { q } = await searchParams;
  const busqueda = q?.trim() ?? "";

  const pedidos = await prisma.pedido.findMany({
    where: {
      perfilId: perfil.id,
      ...(busqueda ? { codigo: { contains: busqueda, mode: "insensitive" } } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-foreground text-3xl font-semibold tracking-tight">
        Mi perfil
      </h1>

      {ROLES_ADMIN.includes(perfil.rol) && (
        <Link
          href="/admin"
          className="border-primary/25 bg-primary/5 hover:border-primary/50 hover:bg-primary/10 mt-6 flex items-center gap-4 rounded-2xl border p-5 transition-colors"
        >
          <span className="bg-primary text-primary-foreground flex size-11 items-center justify-center rounded-full shadow-sm">
            <LayoutDashboard className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="text-foreground block text-sm font-semibold">
              Ir al panel administrativo
            </span>
            <span className="text-muted-foreground block text-xs">
              Gestiona productos, pedidos y configuración de la tienda.
            </span>
          </span>
          <ChevronRight className="text-primary size-5 shrink-0" />
        </Link>
      )}

      <PerfilDatosCard
        datos={{
          nombre: perfil.nombre,
          email,
          celular: perfil.celular,
          dni: perfil.dni,
        }}
      />

      {/* Mis pedidos */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-foreground flex items-center gap-2 text-xl font-semibold">
            <ShoppingBag className="text-primary size-5" />
            Mis pedidos
          </h2>
          {pedidos.length > 0 && (
            <span className="text-muted-foreground text-sm">
              {pedidos.length} {pedidos.length === 1 ? "pedido" : "pedidos"}
            </span>
          )}
        </div>

        {/* Buscar por código de seguimiento */}
        <form action="/perfil" className="mt-4">
          <div className="relative max-w-sm">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
            <input
              type="search"
              name="q"
              defaultValue={busqueda}
              placeholder="Buscar por código (ej. AGK-20260710-8YJM)"
              aria-label="Buscar pedido por código de seguimiento"
              className="border-input bg-card text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/30 h-11 w-full rounded-full border pr-4 pl-10 text-sm transition-colors outline-none focus-visible:ring-2"
            />
          </div>
        </form>

        {pedidos.length === 0 ? (
          <div className="border-border bg-secondary/30 mt-4 flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-12 text-center">
            <span className="bg-background text-primary flex size-12 items-center justify-center rounded-full shadow-sm">
              <Package className="size-6" />
            </span>
            <p className="text-muted-foreground mt-3 text-sm">
              {busqueda
                ? `No encontramos pedidos con el código “${busqueda}”.`
                : "Todavía no realizas ningún pedido."}
            </p>
            {busqueda ? (
              <Link
                href="/perfil"
                className="text-primary mt-4 text-sm font-semibold hover:underline"
              >
                Ver todos mis pedidos
              </Link>
            ) : (
              <Link
                href="/catalogo"
                className="bg-primary text-primary-foreground mt-4 inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm transition-transform hover:-translate-y-0.5"
              >
                Ir al catálogo
              </Link>
            )}
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {pedidos.map((p) => {
              const nItems = p.items.reduce((n, i) => n + i.cantidad, 0);
              const resumen = p.items
                .map((i) => `${i.cantidad}× ${i.nombreProducto}`)
                .join(" · ");
              return (
                <li
                  key={p.id}
                  className="border-border bg-card hover:border-primary/30 rounded-2xl border p-5 transition-colors"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-foreground font-mono text-sm font-semibold">
                          {p.codigo}
                        </span>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${estadoBadge(p.estado)}`}
                        >
                          {ESTADO_LABEL[p.estado] ?? p.estado}
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {formatFecha(p.createdAt)} · {nItems}{" "}
                        {nItems === 1 ? "artículo" : "artículos"}
                      </p>
                      <p className="text-foreground/75 mt-1.5 line-clamp-1 text-sm">
                        {resumen}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-foreground font-semibold">
                        {soles(Number(p.total))}
                      </p>
                    </div>
                  </div>

                  <div className="border-border mt-4 flex items-center justify-between gap-3 border-t pt-3">
                    <Link
                      href={`/pedido/${p.codigo}`}
                      className="text-primary inline-flex items-center gap-1 text-sm font-semibold hover:underline"
                    >
                      Ver detalle y seguimiento
                      <ChevronRight className="size-4" />
                    </Link>
                    <ReordenarButton codigo={p.codigo} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <form action={signOutAction} className="mt-10">
        <button
          type="submit"
          className="border-border bg-card text-foreground hover:bg-secondary inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors"
        >
          <LogOut className="size-4" />
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
