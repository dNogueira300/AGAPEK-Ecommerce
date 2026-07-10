import { NextResponse } from "next/server";
import { requireRoles } from "@/lib/auth";
import { getReporteData, parseFiltros, type ReporteData } from "@/lib/reportes";

const soles = (n: number) => `S/ ${n.toFixed(2)}`;

/** Exporta el reporte filtrado a Excel o PDF (solo ADMIN/TECNICO). */
export async function GET(request: Request) {
  try {
    await requireRoles(["ADMIN", "TECNICO"]);
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filtros = parseFiltros({
    desde: searchParams.get("desde") ?? undefined,
    hasta: searchParams.get("hasta") ?? undefined,
    estado: searchParams.get("estado") ?? undefined,
  });
  const data = await getReporteData(filtros);
  const rango = `${filtros.qs.desde}_${filtros.qs.hasta}`;
  const formato = searchParams.get("formato");

  if (formato === "excel") {
    const buffer = await generarExcel(data, filtros.qs);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="reporte-agapek-${rango}.xlsx"`,
      },
    });
  }

  if (formato === "pdf") {
    const buffer = await generarPdf(data, filtros.qs);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="reporte-agapek-${rango}.pdf"`,
      },
    });
  }

  return NextResponse.json({ error: "Formato inválido (excel|pdf)" }, { status: 400 });
}

async function generarExcel(
  data: ReporteData,
  qs: { desde: string; hasta: string; estado: string },
): Promise<ArrayBuffer> {
  const { default: ExcelJS } = await import("exceljs");
  const wb = new ExcelJS.Workbook();
  wb.creator = "AGAPEK";

  const resumen = wb.addWorksheet("Resumen");
  resumen.columns = [{ width: 28 }, { width: 22 }];
  resumen.addRows([
    ["Reporte de ventas AGAPEK"],
    ["Rango", `${qs.desde} a ${qs.hasta}`],
    ["Estado", qs.estado || "Todos (sin cancelados en montos)"],
    [],
    ["Ventas totales", data.kpis.totalVentas],
    ["Pedidos", data.kpis.totalPedidos],
    ["Ticket promedio", Number(data.kpis.ticket.toFixed(2))],
  ]);
  resumen.getRow(1).font = { bold: true, size: 14 };

  const meses = wb.addWorksheet("Ventas por mes");
  meses.columns = [
    { header: "Mes", key: "label", width: 14 },
    { header: "Ventas (S/)", key: "total", width: 16 },
  ];
  meses.addRows(data.ventasMes);
  meses.getRow(1).font = { bold: true };

  const estados = wb.addWorksheet("Pedidos por estado");
  estados.columns = [
    { header: "Estado", key: "label", width: 24 },
    { header: "Pedidos", key: "cantidad", width: 12 },
  ];
  estados.addRows(data.estados);
  estados.getRow(1).font = { bold: true };

  const top = wb.addWorksheet("Top productos");
  top.columns = [
    { header: "Producto", key: "nombre", width: 44 },
    { header: "Unidades", key: "cantidad", width: 12 },
  ];
  top.addRows(data.topProductos);
  top.getRow(1).font = { bold: true };

  const pedidos = wb.addWorksheet("Pedidos");
  pedidos.columns = [
    { header: "Código", key: "codigo", width: 20 },
    { header: "Fecha", key: "fecha", width: 18 },
    { header: "Cliente", key: "cliente", width: 28 },
    { header: "Estado", key: "estado", width: 22 },
    { header: "Total (S/)", key: "total", width: 12 },
  ];
  pedidos.addRows(data.pedidos);
  pedidos.getRow(1).font = { bold: true };

  return wb.xlsx.writeBuffer() as Promise<ArrayBuffer>;
}

async function generarPdf(
  data: ReporteData,
  qs: { desde: string; hasta: string; estado: string },
): Promise<ArrayBuffer> {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const rosa: [number, number, number] = [194, 60, 124]; // #c23c7c

  doc.setFontSize(18).setTextColor(...rosa);
  doc.text("AGAPEK — Reporte de ventas", 40, 48);
  doc.setFontSize(10).setTextColor(60);
  doc.text(`Rango: ${qs.desde} a ${qs.hasta} · Estado: ${qs.estado || "Todos"}`, 40, 66);
  doc.text(
    `Ventas: ${soles(data.kpis.totalVentas)} · Pedidos: ${data.kpis.totalPedidos} · Ticket promedio: ${soles(data.kpis.ticket)}`,
    40,
    82,
  );

  const tabla = (
    titulo: string,
    head: string[],
    body: (string | number)[][],
    startY?: number,
  ) => {
    const y =
      startY ??
      (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable!.finalY +
        28;
    doc.setFontSize(12).setTextColor(20);
    doc.text(titulo, 40, y);
    autoTable(doc, {
      startY: y + 8,
      head: [head],
      body,
      margin: { left: 40, right: 40 },
      styles: { fontSize: 9 },
      headStyles: { fillColor: rosa },
    });
  };

  tabla(
    "Ventas por mes",
    ["Mes", "Ventas (S/)"],
    data.ventasMes.map((m) => [m.label, m.total.toFixed(2)]),
    108,
  );
  tabla(
    "Pedidos por estado",
    ["Estado", "Pedidos"],
    data.estados.map((e) => [e.label, e.cantidad]),
  );
  tabla(
    "Productos más vendidos",
    ["Producto", "Unidades"],
    data.topProductos.map((t) => [t.nombre, t.cantidad]),
  );
  tabla(
    "Pedidos del rango",
    ["Código", "Fecha", "Cliente", "Estado", "Total (S/)"],
    data.pedidos.map((p) => [p.codigo, p.fecha, p.cliente, p.estado, p.total.toFixed(2)]),
  );

  return doc.output("arraybuffer");
}
