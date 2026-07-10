import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { RutinaForm } from "@/components/admin/rutina-form";

export const metadata: Metadata = { title: "Editar rutina" };
export const dynamic = "force-dynamic";

export default async function EditarRutina({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [rutina, productos] = await Promise.all([
    prisma.rutina.findUnique({
      where: { id },
      include: {
        pasos: {
          orderBy: { orden: "asc" },
          include: { productos: { select: { id: true } } },
        },
      },
    }),
    prisma.producto.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
      select: { id: true, nombre: true, marca: { select: { nombre: true } } },
    }),
  ]);
  if (!rutina) notFound();

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Link
        href="/admin/rutinas"
        className="text-muted-foreground hover:text-primary inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="size-4" /> Rutinas
      </Link>
      <h1 className="font-display text-foreground mt-2 mb-6 text-2xl font-semibold sm:text-3xl">
        Editar rutina
      </h1>
      <RutinaForm
        productos={productos.map((p) => ({
          id: p.id,
          nombre: p.nombre,
          marca: p.marca.nombre,
        }))}
        rutina={{
          id: rutina.id,
          titulo: rutina.titulo,
          tipoPiel: rutina.tipoPiel,
          descripcion: rutina.descripcion,
          orden: rutina.orden,
          publicado: rutina.publicado,
          portadaUrl: rutina.portadaUrl,
          pasos: rutina.pasos.map((p) => ({
            titulo: p.titulo,
            descripcion: p.descripcion ?? "",
            momento: p.momento,
            productoIds: p.productos.map((x) => x.id),
          })),
        }}
      />
    </div>
  );
}
