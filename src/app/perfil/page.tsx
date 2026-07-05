import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight, LogOut, Mail, Package, ShoppingBag, User } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getPerfil } from "@/lib/auth";
import { signOutAction } from "@/lib/auth-actions";
import { formatFecha } from "@/lib/date";
import { ESTADO_LABEL, estadoBadge } from "@/lib/pedido-labels";
import { ReordenarButton } from "@/components/tienda/reordenar-button";

export const metadata: Metadata = { title: "Mi perfil" };
export const dynamic = "force-dynamic";

const soles = (n: number) => `S/ ${n.toFixed(2)}`;

export default async function PerfilPage() {
  const data = await getPerfil();
  if (!data) redirect("/login?redirect=/perfil");

  const { perfil, email } = data;

  const pedidos = await prisma.pedido.findMany({
    where: { perfilId: perfil.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
        Mi perfil
      </h1>

      <div className="mt-8 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-primary">
            <User className="size-7" />
          </span>
          <div>
            <p className="font-display text-lg font-semibold text-foreground">
              {perfil.nombre}
            </p>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="size-3.5" />
              {email}
            </p>
          </div>
        </div>

        <dl className="mt-6 grid gap-4 border-t border-border pt-6 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Celular
            </dt>
            <dd className="mt-1 text-sm text-foreground">
              {perfil.celular ?? "No registrado"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              DNI
            </dt>
            <dd className="mt-1 text-sm text-foreground">
              {perfil.dni ?? "No registrado"}
            </dd>
          </div>
        </dl>
      </div>

      {/* Mis pedidos */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-foreground">
            <ShoppingBag className="size-5 text-primary" />
            Mis pedidos
          </h2>
          {pedidos.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {pedidos.length} {pedidos.length === 1 ? "pedido" : "pedidos"}
            </span>
          )}
        </div>

        {pedidos.length === 0 ? (
          <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/30 px-6 py-12 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-background text-primary shadow-sm">
              <Package className="size-6" />
            </span>
            <p className="mt-3 text-sm text-muted-foreground">
              Todavía no realizas ningún pedido.
            </p>
            <Link
              href="/catalogo"
              className="mt-4 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5"
            >
              Ir al catálogo
            </Link>
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {pedidos.map((p) => {
              const nItems = p.items.reduce((n, i) => n + i.cantidad, 0);
              const resumen = p.items.map((i) => `${i.cantidad}× ${i.nombreProducto}`).join(" · ");
              return (
                <li
                  key={p.id}
                  className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/30"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-semibold text-foreground">
                          {p.codigo}
                        </span>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${estadoBadge(p.estado)}`}
                        >
                          {ESTADO_LABEL[p.estado] ?? p.estado}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatFecha(p.createdAt)} · {nItems} {nItems === 1 ? "artículo" : "artículos"}
                      </p>
                      <p className="mt-1.5 line-clamp-1 text-sm text-foreground/75">{resumen}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{soles(Number(p.total))}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
                    <Link
                      href={`/pedido/${p.codigo}`}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
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
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
        >
          <LogOut className="size-4" />
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
