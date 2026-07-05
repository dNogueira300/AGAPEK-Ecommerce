import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Plus, Power, Tag, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatFechaCorta } from "@/lib/date";
import { eliminarCupon, toggleActivoCupon } from "@/lib/cupon-actions";

export const metadata: Metadata = { title: "Cupones" };
export const dynamic = "force-dynamic";

const soles = (n: number) => `S/ ${n.toFixed(2)}`;

export default async function AdminCupones() {
  const cupones = await prisma.cupon.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">Cupones</h1>
          <p className="mt-1 text-sm text-muted-foreground">{cupones.length} cupones.</p>
        </div>
        <Link href="/admin/cupones/nuevo" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5">
          <Plus className="size-4" /> Nuevo cupón
        </Link>
      </div>

      {cupones.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
          Aún no hay cupones.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Código</th>
                <th className="px-4 py-3 font-medium">Descuento</th>
                <th className="px-4 py-3 font-medium">Mín.</th>
                <th className="px-4 py-3 font-medium">Usos</th>
                <th className="px-4 py-3 font-medium">Vigencia</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {cupones.map((c) => (
                <tr key={c.id} className="hover:bg-secondary/40">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2 font-mono font-semibold text-foreground">
                      <Tag className="size-3.5 text-primary" />
                      {c.codigo}
                    </span>
                    {c.descripcion && <p className="mt-0.5 text-xs text-muted-foreground">{c.descripcion}</p>}
                  </td>
                  <td className="px-4 py-3 text-foreground/80">
                    {c.tipo === "PORCENTAJE" ? `${Number(c.valor)}%` : soles(Number(c.valor))}
                  </td>
                  <td className="px-4 py-3 text-foreground/80">{Number(c.minCompra) > 0 ? soles(Number(c.minCompra)) : "—"}</td>
                  <td className="px-4 py-3 text-foreground/80">
                    {c.usos}
                    {c.usoMaximo != null ? ` / ${c.usoMaximo}` : ""}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {c.inicioAt || c.finAt
                      ? `${c.inicioAt ? formatFechaCorta(c.inicioAt) : "—"} → ${c.finAt ? formatFechaCorta(c.finAt) : "—"}`
                      : "Sin límite"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${c.activo ? "bg-chart-5/15 text-[color:var(--chart-5)]" : "bg-secondary text-muted-foreground"}`}>
                      {c.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/cupones/${c.id}/editar`} aria-label="Editar" className="inline-flex size-9 items-center justify-center rounded-lg text-foreground/70 hover:bg-secondary hover:text-foreground">
                        <Pencil className="size-4" />
                      </Link>
                      <form action={toggleActivoCupon.bind(null, c.id)}>
                        <button type="submit" aria-label={c.activo ? "Desactivar" : "Activar"} className="inline-flex size-9 items-center justify-center rounded-lg text-foreground/70 hover:bg-secondary hover:text-foreground">
                          <Power className="size-4" />
                        </button>
                      </form>
                      <form action={eliminarCupon.bind(null, c.id)}>
                        <button type="submit" aria-label="Eliminar" className="inline-flex size-9 items-center justify-center rounded-lg text-foreground/70 hover:bg-destructive/10 hover:text-destructive">
                          <Trash2 className="size-4" />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
