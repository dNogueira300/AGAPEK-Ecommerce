import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { eliminarCategoria } from "@/lib/categoria-actions";

export const metadata: Metadata = { title: "Categorías" };
export const dynamic = "force-dynamic";

export default async function AdminCategorias() {
  const categorias = await prisma.categoria.findMany({
    orderBy: { orden: "asc" },
    include: { _count: { select: { productos: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-foreground text-2xl font-semibold sm:text-3xl">
            Categorías
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {categorias.length} categorías.
          </p>
        </div>
        <Link
          href="/admin/categorias/nuevo"
          className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm transition-transform hover:-translate-y-0.5"
        >
          <Plus className="size-4" /> Nueva categoría
        </Link>
      </div>

      <div className="border-border bg-card mt-6 overflow-x-auto rounded-2xl border">
        <table className="w-full min-w-[520px] text-sm">
          <thead className="border-border text-muted-foreground border-b text-left text-xs tracking-wide uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Orden</th>
              <th className="px-4 py-3 font-medium">Productos</th>
              <th className="px-4 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {categorias.map((c) => (
              <tr key={c.id} className="hover:bg-secondary/40">
                <td className="px-4 py-3">
                  <p className="text-foreground font-medium">{c.nombre}</p>
                  <p className="text-muted-foreground text-xs">/{c.slug}</p>
                </td>
                <td className="text-foreground/80 px-4 py-3">{c.orden}</td>
                <td className="text-foreground/80 px-4 py-3">{c._count.productos}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/categorias/${c.id}/editar`}
                      aria-label="Editar"
                      className="text-foreground/70 hover:bg-secondary hover:text-foreground inline-flex size-9 items-center justify-center rounded-lg"
                    >
                      <Pencil className="size-4" />
                    </Link>
                    <form action={eliminarCategoria.bind(null, c.id)}>
                      <button
                        type="submit"
                        disabled={c._count.productos > 0}
                        aria-label="Eliminar"
                        title={
                          c._count.productos > 0
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
