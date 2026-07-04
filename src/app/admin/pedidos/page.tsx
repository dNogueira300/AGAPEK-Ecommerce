import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatFecha } from "@/lib/date";
import {
  ESTADO_LABEL,
  ESTADO_ORDEN,
  ESTADO_PAGO_LABEL,
  estadoBadge,
} from "@/lib/pedido-labels";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Pedidos" };
export const dynamic = "force-dynamic";

const soles = (n: number) => `S/ ${n.toFixed(2)}`;

export default async function AdminPedidos({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const filtro = estado && ESTADO_ORDEN.includes(estado as never) ? estado : undefined;

  const where: Prisma.PedidoWhereInput = filtro
    ? { estado: filtro as never }
    : {};

  const pedidos = await prisma.pedido.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { perfil: true, _count: { select: { items: true } } },
    take: 100,
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">Pedidos</h1>
      <p className="mt-1 text-sm text-muted-foreground">{pedidos.length} pedidos.</p>

      {/* Filtros por estado */}
      <nav className="mt-5 flex flex-wrap gap-2">
        <Link
          href="/admin/pedidos"
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
            !filtro ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground/80 hover:bg-secondary",
          )}
        >
          Todos
        </Link>
        {ESTADO_ORDEN.map((e) => (
          <Link
            key={e}
            href={`/admin/pedidos?estado=${e}`}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              filtro === e ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground/80 hover:bg-secondary",
            )}
          >
            {ESTADO_LABEL[e]}
          </Link>
        ))}
      </nav>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Código</th>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Pago</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pedidos.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No hay pedidos {filtro ? "con este estado" : ""}.
                </td>
              </tr>
            ) : (
              pedidos.map((p) => (
                <tr key={p.id} className="hover:bg-secondary/40">
                  <td className="px-4 py-3">
                    <Link href={`/admin/pedidos/${p.codigo}`} className="font-mono text-xs font-medium text-primary hover:underline">
                      {p.codigo}
                    </Link>
                    <div className="text-xs text-muted-foreground">{formatFecha(p.createdAt, "dd/MM HH:mm")}</div>
                  </td>
                  <td className="px-4 py-3 text-foreground/80">{p.perfil.nombre}</td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", estadoBadge(p.estado))}>
                      {ESTADO_LABEL[p.estado]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {ESTADO_PAGO_LABEL[p.estadoPago]}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-foreground">
                    {soles(Number(p.total))}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
