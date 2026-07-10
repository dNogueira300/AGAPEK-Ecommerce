import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { RutinaForm } from "@/components/admin/rutina-form";

export const metadata: Metadata = { title: "Nueva rutina" };
export const dynamic = "force-dynamic";

export default async function NuevaRutina() {
  const productos = await prisma.producto.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
    select: { id: true, nombre: true, marca: { select: { nombre: true } } },
  });

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Link
        href="/admin/rutinas"
        className="text-muted-foreground hover:text-primary inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="size-4" /> Rutinas
      </Link>
      <h1 className="font-display text-foreground mt-2 mb-6 text-2xl font-semibold sm:text-3xl">
        Nueva rutina
      </h1>
      <RutinaForm
        productos={productos.map((p) => ({
          id: p.id,
          nombre: p.nombre,
          marca: p.marca.nombre,
        }))}
      />
    </div>
  );
}
