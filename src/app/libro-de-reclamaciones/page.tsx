import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { LibroReclamacionesForm } from "@/components/tienda/libro-reclamaciones-form";

export const metadata: Metadata = {
  title: "Libro de Reclamaciones",
  description: "Registra tu reclamo o queja. AGAPE FAMILY S.A.C. — conforme a Indecopi.",
};
export const dynamic = "force-dynamic";

export default function LibroReclamacionesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
          <BookOpen className="size-6" />
        </span>
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Libro de Reclamaciones
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Conforme al Código de Protección y Defensa del Consumidor (Indecopi).
          Proveedor: <span className="font-medium text-foreground">AGAPE FAMILY S.A.C.</span> — Iquitos, Perú.
        </p>
      </header>

      <div className="mt-10">
        <LibroReclamacionesForm />
      </div>
    </div>
  );
}
