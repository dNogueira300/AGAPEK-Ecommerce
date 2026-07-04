import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  Clock,
  DollarSign,
  Package,
  ShoppingCart,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatFecha } from "@/lib/date";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

const soles = (n: number) => `S/ ${n.toFixed(2)}`;

const ESTADO_LABEL: Record<string, string> = {
  PENDIENTE: "Pendiente",
  COMPROBANTE_ENVIADO: "Comprobante enviado",
  PAGO_VALIDADO: "Pago validado",
  EN_PREPARACION: "En preparación",
  LISTO_RECOJO: "Listo para recojo",
  ENVIADO: "Enviado",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

export default async function AdminDashboard() {
  const [productos, pendientes, ingresos, bajoStock, recientes, lowStockList] =
    await Promise.all([
      prisma.producto.count({ where: { activo: true } }),
      prisma.pedido.count({
        where: { estado: { in: ["PENDIENTE", "COMPROBANTE_ENVIADO"] } },
      }),
      prisma.pedido.aggregate({
        _sum: { total: true },
        where: { estado: { notIn: ["CANCELADO"] } },
      }),
      prisma.producto.count({ where: { activo: true, stock: { lte: 5 } } }),
      prisma.pedido.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { perfil: true },
      }),
      prisma.producto.findMany({
        where: { activo: true, stock: { lte: 5 } },
        orderBy: { stock: "asc" },
        take: 6,
      }),
    ]);

  const stats = [
    { label: "Productos activos", value: productos, icon: Package, href: "/admin/productos" },
    { label: "Pedidos por atender", value: pendientes, icon: Clock, href: "/admin/pedidos" },
    { label: "Ingresos (no anulados)", value: soles(Number(ingresos._sum.total ?? 0)), icon: DollarSign },
    { label: "Bajo stock", value: bajoStock, icon: AlertTriangle, href: "/admin/productos" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">Resumen de tu tienda.</p>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => {
          const card = (
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <s.icon className="size-5 text-primary" />
              </div>
              <p className="mt-3 font-display text-2xl font-semibold text-foreground">
                {s.value}
              </p>
            </div>
          );
          return s.href ? (
            <Link key={s.label} href={s.href} className="transition-transform hover:-translate-y-0.5">
              {card}
            </Link>
          ) : (
            <div key={s.label}>{card}</div>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Pedidos recientes */}
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-foreground">
              Pedidos recientes
            </h2>
            <Link href="/admin/pedidos" className="text-sm font-medium text-primary hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            {recientes.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">Aún no hay pedidos.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Código</th>
                    <th className="px-4 py-3 font-medium">Cliente</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                    <th className="px-4 py-3 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recientes.map((p) => (
                    <tr key={p.id} className="hover:bg-secondary/40">
                      <td className="px-4 py-3">
                        <Link href={`/admin/pedidos/${p.codigo}`} className="font-mono text-xs font-medium text-primary hover:underline">
                          {p.codigo}
                        </Link>
                        <div className="text-xs text-muted-foreground">{formatFecha(p.createdAt, "dd/MM HH:mm")}</div>
                      </td>
                      <td className="px-4 py-3 text-foreground/80">{p.perfil.nombre}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-foreground">
                          {ESTADO_LABEL[p.estado]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-foreground">
                        {soles(Number(p.total))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Bajo stock */}
        <section>
          <h2 className="mb-3 font-display text-lg font-semibold text-foreground">
            Alertas de stock
          </h2>
          <div className="rounded-2xl border border-border bg-card p-4">
            {lowStockList.length === 0 ? (
              <p className="text-sm text-muted-foreground">Todo con buen stock. 🎉</p>
            ) : (
              <ul className="space-y-3">
                {lowStockList.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3">
                    <span className="truncate text-sm text-foreground/80">{p.nombre}</span>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${p.stock === 0 ? "bg-destructive/10 text-destructive" : "bg-secondary text-foreground"}`}
                    >
                      {p.stock === 0 ? "Agotado" : `${p.stock} u.`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
