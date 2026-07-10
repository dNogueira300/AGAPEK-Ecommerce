import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { MarcaForm } from "@/components/admin/marca-form";

export const metadata: Metadata = { title: "Nueva marca" };

export default function NuevaMarca() {
  return (
    <div className="mx-auto w-full max-w-lg">
      <Link
        href="/admin/marcas"
        className="text-muted-foreground hover:text-primary inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="size-4" /> Marcas
      </Link>
      <h1 className="font-display text-foreground mt-2 mb-6 text-2xl font-semibold sm:text-3xl">
        Nueva marca
      </h1>
      <MarcaForm />
    </div>
  );
}
