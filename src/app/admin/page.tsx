import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Clock, DollarSign, Package, ShoppingCart } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatFecha } from "@/lib/date";
import { SalesChart } from "@/components/admin/sales-chart";

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

  // Serie de ventas de los últimos 7 días (hora Lima).
  const dias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000);
    return { key: formatFecha(d, "yyyy-MM-dd"), label: formatFecha(d, "dd/MM") };
  });
  const ventas7 = await prisma.pedido.findMany({
    where: {
      createdAt: { gte: new Date(Date.now() - 7 * 86400000) },
      estado: { notIn: ["CANCELADO"] },
    },
    select: { total: true, createdAt: true },
  });
  const sumByKey = new Map<string, number>();
  for (const v of ventas7) {
    const k = formatFecha(v.createdAt, "yyyy-MM-dd");
    sumByKey.set(k, (sumByKey.get(k) ?? 0) + Number(v.total));
  }
  const chartLabels = dias.map((d) => d.label);
  const chartData = dias.map((d) => sumByKey.get(d.key) ?? 0);

  const stats = [
    {
      label: "Productos activos",
      value: productos,
      icon: Package,
      href: "/admin/productos",
    },
    {
      label: "Pedidos por atender",
      value: pendientes,
      icon: Clock,
      href: "/admin/pedidos",
    },
    {
      label: "Ingresos (no anulados)",
      value: soles(Number(ingresos._sum.total ?? 0)),
      icon: DollarSign,
    },
    {
      label: "Bajo stock",
      value: bajoStock,
      icon: AlertTriangle,
      href: "/admin/productos",
    },
  ];

  return (
    <div>
      <h1 className="font-display text-foreground text-2xl font-semibold sm:text-3xl">
        Dashboard
      </h1>
      <p className="text-muted-foreground mt-1 text-sm">Resumen de tu tienda.</p>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => {
          const card = (
            <div className="border-border bg-card rounded-2xl border p-5">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">{s.label}</span>
                <s.icon className="text-primary size-5" />
              </div>
              <p className="font-display text-foreground mt-3 text-2xl font-semibold">
                {s.value}
              </p>
            </div>
          );
          return s.href ? (
            <Link
              key={s.label}
              href={s.href}
              className="transition-transform hover:-translate-y-0.5"
            >
              {card}
            </Link>
          ) : (
            <div key={s.label}>{card}</div>
          );
        })}
      </div>

      {/* Gráfico de ventas */}
      <section className="border-border bg-card mt-6 rounded-2xl border p-5">
        <h2 className="font-display text-foreground mb-4 text-lg font-semibold">
          Ventas de los últimos 7 días
        </h2>
        <SalesChart labels={chartLabels} data={chartData} />
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Pedidos recientes */}
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-foreground text-lg font-semibold">
              Pedidos recientes
            </h2>
            <Link
              href="/admin/pedidos"
              className="text-primary text-sm font-medium hover:underline"
            >
              Ver todos
            </Link>
          </div>
          <div className="border-border bg-card overflow-hidden rounded-2xl border">
            {recientes.length === 0 ? (
              <p className="text-muted-foreground p-6 text-sm">Aún no hay pedidos.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-border text-muted-foreground border-b text-left text-xs tracking-wide uppercase">
                  <tr>
                    <th className="px-4 py-3 font-medium">Código</th>
                    <th className="px-4 py-3 font-medium">Cliente</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                    <th className="px-4 py-3 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {recientes.map((p) => (
                    <tr key={p.id} className="hover:bg-secondary/40">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/pedidos/${p.codigo}`}
                          className="text-primary font-mono text-xs font-medium hover:underline"
                        >
                          {p.codigo}
                        </Link>
                        <div className="text-muted-foreground text-xs">
                          {formatFecha(p.createdAt, "dd/MM HH:mm")}
                        </div>
                      </td>
                      <td className="text-foreground/80 px-4 py-3">{p.perfil.nombre}</td>
                      <td className="px-4 py-3">
                        <span className="bg-secondary text-foreground inline-flex rounded-full px-2.5 py-1 text-xs font-medium">
                          {ESTADO_LABEL[p.estado]}
                        </span>
                      </td>
                      <td className="text-foreground px-4 py-3 text-right font-medium">
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
          <h2 className="font-display text-foreground mb-3 text-lg font-semibold">
            Alertas de stock
          </h2>
          <div className="border-border bg-card rounded-2xl border p-4">
            {lowStockList.length === 0 ? (
              <p className="text-muted-foreground text-sm">Todo con buen stock. 🎉</p>
            ) : (
              <ul className="space-y-3">
                {lowStockList.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3">
                    <span className="text-foreground/80 truncate text-sm">
                      {p.nombre}
                    </span>
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
