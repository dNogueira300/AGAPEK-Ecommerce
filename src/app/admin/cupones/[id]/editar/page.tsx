import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatFecha } from "@/lib/date";
import { CuponForm } from "@/components/admin/cupon-form";

export const metadata: Metadata = { title: "Editar cupón" };
export const dynamic = "force-dynamic";

export default async function EditarCupon({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cupon = await prisma.cupon.findUnique({ where: { id } });
  if (!cupon) notFound();

  return (
    <div>
      <Link href="/admin/cupones" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ChevronLeft className="size-4" /> Cupones
      </Link>
      <h1 className="mt-2 mb-6 font-display text-2xl font-semibold text-foreground sm:text-3xl">Editar cupón</h1>
      <CuponForm
        cupon={{
          id: cupon.id,
          codigo: cupon.codigo,
          descripcion: cupon.descripcion,
          tipo: cupon.tipo,
          valor: Number(cupon.valor),
          minCompra: Number(cupon.minCompra),
          usoMaximo: cupon.usoMaximo,
          activo: cupon.activo,
          inicioAt: cupon.inicioAt ? formatFecha(cupon.inicioAt, "yyyy-MM-dd") : null,
          finAt: cupon.finAt ? formatFecha(cupon.finAt, "yyyy-MM-dd") : null,
        }}
      />
    </div>
  );
}
