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
    <div className="mx-auto w-full max-w-lg">
      <Link
        href="/admin/categorias"
        className="text-muted-foreground hover:text-primary inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="size-4" /> Categorías
      </Link>
      <h1 className="font-display text-foreground mt-2 mb-6 text-2xl font-semibold sm:text-3xl">
        Editar categoría
      </h1>
      <CategoriaForm
        categoria={{ id: categoria.id, nombre: categoria.nombre, orden: categoria.orden }}
      />
    </div>
  );
}
