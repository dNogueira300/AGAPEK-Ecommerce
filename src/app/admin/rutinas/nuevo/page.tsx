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
    <div>
      <Link href="/admin/rutinas" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ChevronLeft className="size-4" /> Rutinas
      </Link>
      <h1 className="mt-2 mb-6 font-display text-2xl font-semibold text-foreground sm:text-3xl">Nueva rutina</h1>
      <RutinaForm
        productos={productos.map((p) => ({ id: p.id, nombre: p.nombre, marca: p.marca.nombre }))}
      />
    </div>
  );
}
