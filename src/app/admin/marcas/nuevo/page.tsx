import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { MarcaForm } from "@/components/admin/marca-form";

export const metadata: Metadata = { title: "Nueva marca" };

export default function NuevaMarca() {
  return (
    <div>
      <Link href="/admin/marcas" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ChevronLeft className="size-4" /> Marcas
      </Link>
      <h1 className="mt-2 mb-6 font-display text-2xl font-semibold text-foreground sm:text-3xl">Nueva marca</h1>
      <MarcaForm />
    </div>
  );
}
