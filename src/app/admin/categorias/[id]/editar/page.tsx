import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CategoriaForm } from "@/components/admin/categoria-form";

export const metadata: Metadata = { title: "Editar categoría" };
export const dynamic = "force-dynamic";

export default async function EditarCategoria({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const categoria = await prisma.categoria.findUnique({ where: { id } });
  if (!categoria) notFound();

  return (
    <div>
      <Link href="/admin/categorias" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ChevronLeft className="size-4" /> Categorías
      </Link>
      <h1 className="mt-2 mb-6 font-display text-2xl font-semibold text-foreground sm:text-3xl">Editar categoría</h1>
      <CategoriaForm categoria={{ id: categoria.id, nombre: categoria.nombre, orden: categoria.orden }} />
    </div>
  );
}
