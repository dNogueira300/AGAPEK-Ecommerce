import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CategoriaForm } from "@/components/admin/categoria-form";

export const metadata: Metadata = { title: "Nueva categoría" };

export default function NuevaCategoria() {
  return (
    <div className="mx-auto w-full max-w-lg">
      <Link
        href="/admin/categorias"
        className="text-muted-foreground hover:text-primary inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="size-4" /> Categorías
      </Link>
      <h1 className="font-display text-foreground mt-2 mb-6 text-2xl font-semibold sm:text-3xl">
        Nueva categoría
      </h1>
      <CategoriaForm />
    </div>
  );
}
