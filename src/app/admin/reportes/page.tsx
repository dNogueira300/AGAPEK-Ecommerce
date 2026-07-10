import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DollarSign, Receipt, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getPerfil } from "@/lib/auth";
import { formatFecha } from "@/lib/date";
import { ESTADO_LABEL } from "@/lib/pedido-labels";
import {
  EstadoDoughnut,
  TopProductosBar,
  VentasMesBar,
} from "@/components/admin/report-charts";

export const metadata: Metadata = { title: "Reportes" };
export const dynamic = "force-dynamic";

const soles = (n: number) => `S/ ${n.toFixed(2)}`;

export default async function AdminReportes() {
  const data = await getPerfil();
  if (!data) redirect("/login?redirect=/admin/reportes");
  if (data.perfil.rol === "VENDEDOR") redirect("/admin");

  const [agg, porEstado, topItems, ventas] = await Promise.all([
    prisma.pedido.aggregate({
      _sum: { total: true },
      _count: { _all: true },
      where: { estado: { notIn: ["CANCELADO"] } },
    }),
    prisma.pedido.groupBy({ by: ["estado"], _count: { _all: true } }),
    prisma.pedidoItem.groupBy({
      by: ["productoId"],
      _sum: { cantidad: true },
      orderBy: { _sum: { cantidad: "desc" } },
      take: 8,
    }),
    prisma.pedido.findMany({
      where: {
        estado: { notIn: ["CANCELADO"] },
        createdAt: { gte: new Date(Date.now() - 183 * 86400000) },
      },
      select: { total: true, createdAt: true },
    }),
  ]);

  const totalVentas = Number(agg._sum.total ?? 0);
  const totalPedidos = agg._count._all;
  const ticket = totalPedidos ? totalVentas / totalPedidos : 0;

  // Ventas por mes (últimos 6 meses, hora Lima)
  const meses = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return { key: formatFecha(d, "yyyy-MM"), label: formatFecha(d, "MM/yyyy") };
  });
  const sumMes = new Map<string, number>();
  for (const v of ventas) {
    const k = formatFecha(v.createdAt, "yyyy-MM");
    sumMes.set(k, (sumMes.get(k) ?? 0) + Number(v.total));
  }

  // Top productos (nombres)
  const nombres = new Map(
    (
      await prisma.producto.findMany({
        where: { id: { in: topItems.map((t) => t.productoId) } },
        select: { id: true, nombre: true },
      })
    ).map((p) => [p.id, p.nombre]),
  );

  const kpis = [
    { label: "Ventas (no anuladas)", value: soles(totalVentas), icon: DollarSign },
    { label: "Pedidos", value: totalPedidos, icon: Receipt },
    { label: "Ticket promedio", value: soles(ticket), icon: TrendingUp },
  ];

  return (
    <div>
      <h1 className="font-display text-foreground text-2xl font-semibold sm:text-3xl">
        Reportes
      </h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {kpis.map((k) => (
          <div key={k.label} className="border-border bg-card rounded-2xl border p-5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">{k.label}</span>
              <k.icon className="text-primary size-5" />
            </div>
            <p className="font-display text-foreground mt-3 text-2xl font-semibold">
              {k.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="border-border bg-card rounded-2xl border p-5">
          <h2 className="font-display text-foreground mb-4 text-lg font-semibold">
            Ventas por mes
          </h2>
          <VentasMesBar
            labels={meses.map((m) => m.label)}
            data={meses.map((m) => sumMes.get(m.key) ?? 0)}
          />
        </section>

        <section className="border-border bg-card rounded-2xl border p-5">
          <h2 className="font-display text-foreground mb-4 text-lg font-semibold">
            Pedidos por estado
          </h2>
          {porEstado.length > 0 ? (
            <EstadoDoughnut
              labels={porEstado.map((e) => ESTADO_LABEL[e.estado] ?? e.estado)}
              data={porEstado.map((e) => e._count._all)}
            />
          ) : (
            <p className="text-muted-foreground py-16 text-center text-sm">
              Aún no hay pedidos.
            </p>
          )}
        </section>

        <section className="border-border bg-card rounded-2xl border p-5 lg:col-span-2">
          <h2 className="font-display text-foreground mb-4 text-lg font-semibold">
            Productos más vendidos
          </h2>
          {topItems.length > 0 ? (
            <TopProductosBar
              labels={topItems.map((t) => nombres.get(t.productoId) ?? "—")}
              data={topItems.map((t) => t._sum.cantidad ?? 0)}
            />
          ) : (
            <p className="text-muted-foreground py-16 text-center text-sm">
              Aún no hay ventas registradas.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
