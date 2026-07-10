import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Pencil, Plus, Store, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { eliminarMarca } from "@/lib/marca-actions";

export const metadata: Metadata = { title: "Marcas" };
export const dynamic = "force-dynamic";

export default async function AdminMarcas() {
  const marcas = await prisma.marca.findMany({
    orderBy: { nombre: "asc" },
    include: { _count: { select: { productos: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-foreground text-2xl font-semibold sm:text-3xl">
            Marcas
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">{marcas.length} marcas.</p>
        </div>
        <Link
          href="/admin/marcas/nuevo"
          className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm transition-transform hover:-translate-y-0.5"
        >
          <Plus className="size-4" /> Nueva marca
        </Link>
      </div>

      <div className="border-border bg-card mt-6 overflow-x-auto rounded-2xl border">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="border-border text-muted-foreground border-b text-left text-xs tracking-wide uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Marca</th>
              <th className="px-4 py-3 font-medium">Aliada</th>
              <th className="px-4 py-3 font-medium">Productos</th>
              <th className="px-4 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {marcas.map((m) => (
              <tr key={m.id} className="hover:bg-secondary/40">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="border-border bg-secondary flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border">
                      {m.logoUrl ? (
                        <Image
                          src={m.logoUrl}
                          alt={m.nombre}
                          width={40}
                          height={40}
                          className="object-contain p-1"
                        />
                      ) : (
                        <Store className="text-muted-foreground size-4" />
                      )}
                    </span>
                    <div>
                      <p className="text-foreground font-medium">{m.nombre}</p>
                      <p className="text-muted-foreground text-xs">/{m.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${m.aliada ? "bg-chart-5/15 text-[color:var(--chart-5)]" : "bg-secondary text-muted-foreground"}`}
                  >
                    {m.aliada ? "Sí" : "No"}
                  </span>
                </td>
                <td className="text-foreground/80 px-4 py-3">{m._count.productos}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/marcas/${m.id}/editar`}
                      aria-label="Editar"
                      className="text-foreground/70 hover:bg-secondary hover:text-foreground inline-flex size-9 items-center justify-center rounded-lg"
                    >
                      <Pencil className="size-4" />
                    </Link>
                    <form action={eliminarMarca.bind(null, m.id)}>
                      <button
                        type="submit"
                        disabled={m._count.productos > 0}
                        aria-label="Eliminar"
                        title={
                          m._count.productos > 0
                            ? "Tiene productos asociados"
                            : "Eliminar"
                        }
                        className="text-foreground/70 hover:bg-destructive/10 hover:text-destructive inline-flex size-9 items-center justify-center rounded-lg disabled:cursor-not-allowed disabled:opacity-30"
                      >
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
    </div>
  );
}
