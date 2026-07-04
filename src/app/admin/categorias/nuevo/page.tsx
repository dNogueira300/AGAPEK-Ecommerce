import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CategoriaForm } from "@/components/admin/categoria-form";

export const metadata: Metadata = { title: "Nueva categoría" };

export default function NuevaCategoria() {
  return (
    <div>
      <Link href="/admin/categorias" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ChevronLeft className="size-4" /> Categorías
      </Link>
      <h1 className="mt-2 mb-6 font-display text-2xl font-semibold text-foreground sm:text-3xl">Nueva categoría</h1>
      <CategoriaForm />
    </div>
  );
}
