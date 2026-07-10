import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DollarSign, FileSpreadsheet, FileText, Receipt, TrendingUp } from "lucide-react";
import { EstadoPedido } from "@prisma/client";
import { getPerfil } from "@/lib/auth";
import { ESTADO_LABEL } from "@/lib/pedido-labels";
import { getReporteData, parseFiltros } from "@/lib/reportes";
import {
  EstadoDoughnut,
  TopProductosBar,
  VentasMesBar,
} from "@/components/admin/report-charts";

export const metadata: Metadata = { title: "Reportes" };
export const dynamic = "force-dynamic";

const soles = (n: number) => `S/ ${n.toFixed(2)}`;

const inputClass =
  "h-10 rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none focus-visible:border-ring";

export default async function AdminReportes({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; hasta?: string; estado?: string }>;
}) {
  const data = await getPerfil();
  if (!data) redirect("/login?redirect=/admin/reportes");
  if (data.perfil.rol === "VENDEDOR") redirect("/admin");

  const filtros = parseFiltros(await searchParams);
  const reporte = await getReporteData(filtros);

  const kpis = [
    {
      label: filtros.qs.estado ? "Ventas (estado filtrado)" : "Ventas (no anuladas)",
      value: soles(reporte.kpis.totalVentas),
      icon: DollarSign,
    },
    { label: "Pedidos", value: reporte.kpis.totalPedidos, icon: Receipt },
    { label: "Ticket promedio", value: soles(reporte.kpis.ticket), icon: TrendingUp },
  ];

  const exportQs = new URLSearchParams({
    desde: filtros.qs.desde,
    hasta: filtros.qs.hasta,
    ...(filtros.qs.estado ? { estado: filtros.qs.estado } : {}),
  }).toString();

  return (
    <div>
      <h1 className="font-display text-foreground text-2xl font-semibold sm:text-3xl">
        Reportes
      </h1>

      {/* Filtros + exportación */}
      <div className="border-border bg-card mt-6 flex flex-wrap items-end gap-3 rounded-2xl border p-4">
        <form method="GET" className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <label
              htmlFor="desde"
              className="text-muted-foreground block text-xs font-medium"
            >
              Desde
            </label>
            <input
              id="desde"
              type="date"
              name="desde"
              defaultValue={filtros.qs.desde}
              className={inputClass}
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor="hasta"
              className="text-muted-foreground block text-xs font-medium"
            >
              Hasta
            </label>
            <input
              id="hasta"
              type="date"
              name="hasta"
              defaultValue={filtros.qs.hasta}
              className={inputClass}
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor="estado"
              className="text-muted-foreground block text-xs font-medium"
            >
              Estado
            </label>
            <select
              id="estado"
              name="estado"
              defaultValue={filtros.qs.estado}
              className={inputClass}
            >
              <option value="">Todos</option>
              {Object.values(EstadoPedido).map((e) => (
                <option key={e} value={e}>
                  {ESTADO_LABEL[e] ?? e}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="bg-primary text-primary-foreground h-10 rounded-full px-5 text-sm font-semibold shadow-sm transition-transform hover:-translate-y-0.5"
          >
            Aplicar
          </button>
        </form>

        <div className="ml-auto flex gap-2">
          <a
            href={`/api/admin/reportes/export?formato=excel&${exportQs}`}
            className="border-border bg-card text-foreground hover:bg-secondary inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors"
          >
            <FileSpreadsheet className="size-4 text-[color:var(--chart-5)]" />
            Excel
          </a>
          <a
            href={`/api/admin/reportes/export?formato=pdf&${exportQs}`}
            className="border-border bg-card text-foreground hover:bg-secondary inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors"
          >
            <FileText className="text-destructive size-4" />
            PDF
          </a>
        </div>
      </div>

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
            labels={reporte.ventasMes.map((m) => m.label)}
            data={reporte.ventasMes.map((m) => m.total)}
          />
        </section>

        <section className="border-border bg-card rounded-2xl border p-5">
          <h2 className="font-display text-foreground mb-4 text-lg font-semibold">
            Pedidos por estado
          </h2>
          {reporte.estados.length > 0 ? (
            <EstadoDoughnut
              labels={reporte.estados.map((e) => e.label)}
              data={reporte.estados.map((e) => e.cantidad)}
            />
          ) : (
            <p className="text-muted-foreground py-16 text-center text-sm">
              No hay pedidos en el rango seleccionado.
            </p>
          )}
        </section>

        <section className="border-border bg-card rounded-2xl border p-5 lg:col-span-2">
          <h2 className="font-display text-foreground mb-4 text-lg font-semibold">
            Productos más vendidos
          </h2>
          {reporte.topProductos.length > 0 ? (
            <TopProductosBar
              labels={reporte.topProductos.map((t) => t.nombre)}
              data={reporte.topProductos.map((t) => t.cantidad)}
            />
          ) : (
            <p className="text-muted-foreground py-16 text-center text-sm">
              No hay ventas en el rango seleccionado.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
