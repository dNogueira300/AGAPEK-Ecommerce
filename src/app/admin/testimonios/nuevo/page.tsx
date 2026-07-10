import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { TestimonioForm } from "@/components/admin/testimonio-form";

export const metadata: Metadata = { title: "Nuevo testimonio" };

export default function NuevoTestimonio() {
  return (
    <div className="mx-auto w-full max-w-lg">
      <Link
        href="/admin/testimonios"
        className="text-muted-foreground hover:text-primary inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="size-4" /> Testimonios
      </Link>
      <h1 className="font-display text-foreground mt-2 mb-6 text-2xl font-semibold sm:text-3xl">
        Nuevo testimonio
      </h1>
      <TestimonioForm />
    </div>
  );
}
