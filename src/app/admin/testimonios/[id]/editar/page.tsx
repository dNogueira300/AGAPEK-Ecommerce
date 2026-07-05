import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { TestimonioForm } from "@/components/admin/testimonio-form";

export const metadata: Metadata = { title: "Editar testimonio" };
export const dynamic = "force-dynamic";

export default async function EditarTestimonio({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const testimonio = await prisma.testimonio.findUnique({ where: { id } });
  if (!testimonio) notFound();

  return (
    <div>
      <Link href="/admin/testimonios" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ChevronLeft className="size-4" /> Testimonios
      </Link>
      <h1 className="mt-2 mb-6 font-display text-2xl font-semibold text-foreground sm:text-3xl">Editar testimonio</h1>
      <TestimonioForm
        testimonio={{
          id: testimonio.id,
          nombre: testimonio.nombre,
          texto: testimonio.texto,
          rating: testimonio.rating,
          activo: testimonio.activo,
        }}
      />
    </div>
  );
}
