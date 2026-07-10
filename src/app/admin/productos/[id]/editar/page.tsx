import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductoForm } from "@/components/admin/producto-form";

export const metadata: Metadata = { title: "Editar producto" };
export const dynamic = "force-dynamic";

export default async function EditarProducto({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [producto, categorias, marcas] = await Promise.all([
    prisma.producto.findUnique({
      where: { id },
      include: { imagenes: { take: 1, orderBy: { orden: "asc" } } },
    }),
    prisma.categoria.findMany({ orderBy: { orden: "asc" } }),
    prisma.marca.findMany({ orderBy: { nombre: "asc" } }),
  ]);
  if (!producto) notFound();

  return (
    <div>
      <Link
        href="/admin/productos"
        className="text-muted-foreground hover:text-primary inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="size-4" /> Productos
      </Link>
      <h1 className="font-display text-foreground mt-2 mb-6 text-2xl font-semibold sm:text-3xl">
        Editar producto
      </h1>
      <ProductoForm
        categorias={categorias.map((c) => ({ id: c.id, nombre: c.nombre }))}
        marcas={marcas.map((m) => ({ id: m.id, nombre: m.nombre }))}
        producto={{
          id: producto.id,
          nombre: producto.nombre,
          descripcionCorta: producto.descripcionCorta,
          descripcion: producto.descripcion,
          modoUso: producto.modoUso,
          precio: Number(producto.precio),
          precioOferta:
            producto.precioOferta != null ? Number(producto.precioOferta) : null,
          stock: producto.stock,
          categoriaId: producto.categoriaId,
          marcaId: producto.marcaId,
          tipoPiel: producto.tipoPiel,
          necesidad: producto.necesidad,
          destacado: producto.destacado,
          nuevo: producto.nuevo,
          activo: producto.activo,
          imagen: producto.imagenes[0]?.url ?? null,
        }}
      />
    </div>
  );
}
