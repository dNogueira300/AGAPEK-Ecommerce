import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { MarcaForm } from "@/components/admin/marca-form";

export const metadata: Metadata = { title: "Editar marca" };
export const dynamic = "force-dynamic";

export default async function EditarMarca({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const marca = await prisma.marca.findUnique({ where: { id } });
  if (!marca) notFound();

  return (
    <div>
      <Link href="/admin/marcas" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ChevronLeft className="size-4" /> Marcas
      </Link>
      <h1 className="mt-2 mb-6 font-display text-2xl font-semibold text-foreground sm:text-3xl">Editar marca</h1>
      <MarcaForm marca={{ id: marca.id, nombre: marca.nombre, aliada: marca.aliada, logoUrl: marca.logoUrl }} />
    </div>
  );
}
