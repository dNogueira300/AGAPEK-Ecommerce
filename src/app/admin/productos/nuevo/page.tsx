import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductoForm } from "@/components/admin/producto-form";

export const metadata: Metadata = { title: "Nuevo producto" };
export const dynamic = "force-dynamic";

export default async function NuevoProducto() {
  const [categorias, marcas] = await Promise.all([
    prisma.categoria.findMany({ orderBy: { orden: "asc" } }),
    prisma.marca.findMany({ orderBy: { nombre: "asc" } }),
  ]);

  return (
    <div>
      <Link
        href="/admin/productos"
        className="text-muted-foreground hover:text-primary inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="size-4" /> Productos
      </Link>
      <h1 className="font-display text-foreground mt-2 mb-6 text-2xl font-semibold sm:text-3xl">
        Nuevo producto
      </h1>
      <ProductoForm
        categorias={categorias.map((c) => ({ id: c.id, nombre: c.nombre }))}
        marcas={marcas.map((m) => ({ id: m.id, nombre: m.nombre }))}
      />
    </div>
  );
}
