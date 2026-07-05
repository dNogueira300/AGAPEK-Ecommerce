import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CuponForm } from "@/components/admin/cupon-form";

export const metadata: Metadata = { title: "Nuevo cupón" };

export default function NuevoCupon() {
  return (
    <div>
      <Link href="/admin/cupones" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ChevronLeft className="size-4" /> Cupones
      </Link>
      <h1 className="mt-2 mb-6 font-display text-2xl font-semibold text-foreground sm:text-3xl">Nuevo cupón</h1>
      <CuponForm />
    </div>
  );
}
