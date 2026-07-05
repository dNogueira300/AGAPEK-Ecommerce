import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { TestimonioForm } from "@/components/admin/testimonio-form";

export const metadata: Metadata = { title: "Nuevo testimonio" };

export default function NuevoTestimonio() {
  return (
    <div>
      <Link href="/admin/testimonios" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ChevronLeft className="size-4" /> Testimonios
      </Link>
      <h1 className="mt-2 mb-6 font-display text-2xl font-semibold text-foreground sm:text-3xl">Nuevo testimonio</h1>
      <TestimonioForm />
    </div>
  );
}
