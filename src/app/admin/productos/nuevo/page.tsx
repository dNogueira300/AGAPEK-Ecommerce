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
      <Link href="/admin/productos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ChevronLeft className="size-4" /> Productos
      </Link>
      <h1 className="mt-2 mb-6 font-display text-2xl font-semibold text-foreground sm:text-3xl">
        Nuevo producto
      </h1>
      <ProductoForm
        categorias={categorias.map((c) => ({ id: c.id, nombre: c.nombre }))}
        marcas={marcas.map((m) => ({ id: m.id, nombre: m.nombre }))}
      />
    </div>
  );
}
