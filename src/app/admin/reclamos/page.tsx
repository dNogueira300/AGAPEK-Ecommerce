import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatFecha } from "@/lib/date";

export const metadata: Metadata = { title: "Reclamos" };
export const dynamic = "force-dynamic";

export default async function AdminReclamos() {
  const reclamos = await prisma.reclamo.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  const pendientes = reclamos.filter((r) => !r.atendido).length;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">Libro de Reclamaciones</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {reclamos.length} registros · {pendientes} por atender.
      </p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Código</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Consumidor</th>
              <th className="px-4 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {reclamos.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Sin reclamos.</td></tr>
            ) : (
              reclamos.map((r) => (
                <tr key={r.id} className="hover:bg-secondary/40">
                  <td className="px-4 py-3">
                    <Link href={`/admin/reclamos/${r.codigo}`} className="font-mono text-xs font-medium text-primary hover:underline">{r.codigo}</Link>
                    <div className="text-xs text-muted-foreground">{formatFecha(r.createdAt, "dd/MM HH:mm")}</div>
                  </td>
                  <td className="px-4 py-3 text-foreground/80">{r.tipo === "RECLAMO" ? "Reclamo" : "Queja"}</td>
                  <td className="px-4 py-3">
                    <p className="text-foreground/80">{r.nombre}</p>
                    <p className="text-xs text-muted-foreground">{r.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${r.atendido ? "bg-chart-5/15 text-[color:var(--chart-5)]" : "bg-amber-100 text-amber-700"}`}>
                      {r.atendido ? "Atendido" : "Pendiente"}
                    </span>
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
