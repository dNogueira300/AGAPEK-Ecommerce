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
    <div className="mx-auto w-full max-w-lg">
      <Link
        href="/admin/testimonios"
        className="text-muted-foreground hover:text-primary inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="size-4" /> Testimonios
      </Link>
      <h1 className="font-display text-foreground mt-2 mb-6 text-2xl font-semibold sm:text-3xl">
        Editar testimonio
      </h1>
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
