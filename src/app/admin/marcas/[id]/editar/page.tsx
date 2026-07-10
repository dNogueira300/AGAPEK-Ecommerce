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
    <div className="mx-auto w-full max-w-lg">
      <Link
        href="/admin/marcas"
        className="text-muted-foreground hover:text-primary inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="size-4" /> Marcas
      </Link>
      <h1 className="font-display text-foreground mt-2 mb-6 text-2xl font-semibold sm:text-3xl">
        Editar marca
      </h1>
      <MarcaForm
        marca={{
          id: marca.id,
          nombre: marca.nombre,
          aliada: marca.aliada,
          logoUrl: marca.logoUrl,
        }}
      />
    </div>
  );
}
