import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Pencil, Plus, Power, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { eliminarProducto, toggleActivoProducto } from "@/lib/producto-actions";

export const metadata: Metadata = { title: "Productos" };
export const dynamic = "force-dynamic";

const soles = (n: number) => `S/ ${n.toFixed(2)}`;

export default async function AdminProductos() {
  const productos = await prisma.producto.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      marca: true,
      categoria: true,
      imagenes: { take: 1, orderBy: { orden: "asc" } },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-foreground text-2xl font-semibold sm:text-3xl">
            Productos
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {productos.length} productos en total.
          </p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm transition-transform hover:-translate-y-0.5"
        >
          <Plus className="size-4" />
          Nuevo producto
        </Link>
      </div>

      <div className="border-border bg-card mt-6 overflow-x-auto rounded-2xl border">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-border text-muted-foreground border-b text-left text-xs tracking-wide uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Producto</th>
              <th className="px-4 py-3 font-medium">Marca</th>
              <th className="px-4 py-3 font-medium">Precio</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {productos.map((p) => (
              <tr key={p.id} className="hover:bg-secondary/40">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="bg-secondary relative size-11 shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={p.imagenes[0]?.url ?? "/productos/generico.svg"}
                        alt={p.nombre}
                        fill
                        sizes="44px"
                        unoptimized={(p.imagenes[0]?.url ?? "").endsWith(".svg")}
                        className="object-cover"
                      />
                    </span>
                    <div className="min-w-0">
                      <p className="text-foreground truncate font-medium">{p.nombre}</p>
                      <p className="text-muted-foreground truncate text-xs">
                        {p.categoria.nombre}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="text-foreground/80 px-4 py-3">{p.marca.nombre}</td>
                <td className="px-4 py-3">
                  {p.precioOferta ? (
                    <span>
                      <span className="text-muted-foreground line-through">
                        {soles(Number(p.precio))}
                      </span>{" "}
                      <span className="text-foreground font-medium">
                        {soles(Number(p.precioOferta))}
                      </span>
                    </span>
                  ) : (
                    <span className="text-foreground font-medium">
                      {soles(Number(p.precio))}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      p.stock === 0 ? "text-destructive font-medium" : "text-foreground"
                    }
                  >
                    {p.stock}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${p.activo ? "bg-chart-5/15 text-[color:var(--chart-5)]" : "bg-secondary text-muted-foreground"}`}
                  >
                    {p.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/productos/${p.id}/editar`}
                      aria-label="Editar"
                      className="text-foreground/70 hover:bg-secondary hover:text-foreground inline-flex size-9 items-center justify-center rounded-lg"
                    >
                      <Pencil className="size-4" />
                    </Link>
                    <form action={toggleActivoProducto.bind(null, p.id)}>
                      <button
                        type="submit"
                        aria-label={p.activo ? "Desactivar" : "Activar"}
                        className="text-foreground/70 hover:bg-secondary hover:text-foreground inline-flex size-9 items-center justify-center rounded-lg"
                      >
                        <Power className="size-4" />
                      </button>
                    </form>
                    <form action={eliminarProducto.bind(null, p.id)}>
                      <button
                        type="submit"
                        aria-label="Eliminar"
                        className="text-foreground/70 hover:bg-destructive/10 hover:text-destructive inline-flex size-9 items-center justify-center rounded-lg"
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
