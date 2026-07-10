import { EstadoPedido, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatFecha } from "@/lib/date";
import { ESTADO_LABEL } from "@/lib/pedido-labels";

/*
  Datos de reportes con filtros (rango de fechas + estado), compartidos por la
  página /admin/reportes y la ruta de exportación (Excel/PDF).
*/

export interface FiltrosReporte {
  desde: Date;
  hasta: Date; // inclusive (fin de día)
  estado?: EstadoPedido;
  /** Valores para repoblar los inputs del formulario / querystring. */
  qs: { desde: string; hasta: string; estado: string };
}

const ESTADOS = Object.values(EstadoPedido);

/** Interpreta searchParams (?desde&hasta&estado). Default: últimos 6 meses. */
export function parseFiltros(sp: {
  desde?: string;
  hasta?: string;
  estado?: string;
}): FiltrosReporte {
  const hoy = new Date();
  const defDesde = new Date(hoy);
  defDesde.setMonth(defDesde.getMonth() - 5);
  defDesde.setDate(1);

  const parse = (s: string | undefined, def: Date) => {
    if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return def;
    const d = new Date(`${s}T00:00:00-05:00`); // día en hora Lima
    return isNaN(d.getTime()) ? def : d;
  };

  let desde = parse(sp.desde, defDesde);
  let hasta = parse(sp.hasta, hoy);
  if (desde > hasta) [desde, hasta] = [hasta, desde];
  // fin de día (Lima) para que "hasta" sea inclusivo
  const hastaFin = new Date(hasta.getTime() + 86400000 - 1);

  const estado = ESTADOS.includes(sp.estado as EstadoPedido)
    ? (sp.estado as EstadoPedido)
    : undefined;

  return {
    desde,
    hasta: hastaFin,
    estado,
    qs: {
      desde: formatFecha(desde, "yyyy-MM-dd"),
      hasta: formatFecha(hasta, "yyyy-MM-dd"),
      estado: estado ?? "",
    },
  };
}

export interface ReporteData {
  kpis: { totalVentas: number; totalPedidos: number; ticket: number };
  ventasMes: { label: string; total: number }[];
  estados: { label: string; cantidad: number }[];
  topProductos: { nombre: string; cantidad: number }[];
  pedidos: {
    codigo: string;
    fecha: string;
    cliente: string;
    estado: string;
    total: number;
  }[];
}

export async function getReporteData(f: FiltrosReporte): Promise<ReporteData> {
  const rango = { gte: f.desde, lte: f.hasta };
  // Para montos: si no se filtra estado, se excluyen cancelados.
  const whereMonto: Prisma.PedidoWhereInput = {
    createdAt: rango,
    ...(f.estado ? { estado: f.estado } : { estado: { notIn: ["CANCELADO"] } }),
  };
  const whereEstados: Prisma.PedidoWhereInput = {
    createdAt: rango,
    ...(f.estado ? { estado: f.estado } : {}),
  };

  const [agg, porEstado, topItems, ventas, pedidosRaw] = await Promise.all([
    prisma.pedido.aggregate({
      _sum: { total: true },
      _count: { _all: true },
      where: whereMonto,
    }),
    prisma.pedido.groupBy({
      by: ["estado"],
      _count: { _all: true },
      where: whereEstados,
    }),
    prisma.pedidoItem.groupBy({
      by: ["productoId"],
      _sum: { cantidad: true },
      orderBy: { _sum: { cantidad: "desc" } },
      take: 8,
      where: { pedido: { is: whereMonto } },
    }),
    prisma.pedido.findMany({
      where: whereMonto,
      select: { total: true, createdAt: true },
    }),
    prisma.pedido.findMany({
      where: whereEstados,
      orderBy: { createdAt: "desc" },
      take: 2000,
      select: {
        codigo: true,
        createdAt: true,
        estado: true,
        total: true,
        perfil: { select: { nombre: true } },
      },
    }),
  ]);

  const totalVentas = Number(agg._sum.total ?? 0);
  const totalPedidos = agg._count._all;

  // Serie mensual dentro del rango (máx. 24 meses).
  const meses: { key: string; label: string }[] = [];
  const cursor = new Date(f.desde.getFullYear(), f.desde.getMonth(), 1);
  while (cursor <= f.hasta && meses.length < 24) {
    meses.push({
      key: formatFecha(cursor, "yyyy-MM"),
      label: formatFecha(cursor, "MM/yyyy"),
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  const sumMes = new Map<string, number>();
  for (const v of ventas) {
    const k = formatFecha(v.createdAt, "yyyy-MM");
    sumMes.set(k, (sumMes.get(k) ?? 0) + Number(v.total));
  }

  const nombres = new Map(
    (
      await prisma.producto.findMany({
        where: { id: { in: topItems.map((t) => t.productoId) } },
        select: { id: true, nombre: true },
      })
    ).map((p) => [p.id, p.nombre]),
  );

  return {
    kpis: {
      totalVentas,
      totalPedidos,
      ticket: totalPedidos ? totalVentas / totalPedidos : 0,
    },
    ventasMes: meses.map((m) => ({ label: m.label, total: sumMes.get(m.key) ?? 0 })),
    estados: porEstado.map((e) => ({
      label: ESTADO_LABEL[e.estado] ?? e.estado,
      cantidad: e._count._all,
    })),
    topProductos: topItems.map((t) => ({
      nombre: nombres.get(t.productoId) ?? "—",
      cantidad: t._sum.cantidad ?? 0,
    })),
    pedidos: pedidosRaw.map((p) => ({
      codigo: p.codigo,
      fecha: formatFecha(p.createdAt),
      cliente: p.perfil.nombre,
      estado: ESTADO_LABEL[p.estado] ?? p.estado,
      total: Number(p.total),
    })),
  };
}
