import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CuponForm } from "@/components/admin/cupon-form";

export const metadata: Metadata = { title: "Nuevo cupón" };

export default function NuevoCupon() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <Link
        href="/admin/cupones"
        className="text-muted-foreground hover:text-primary inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="size-4" /> Cupones
      </Link>
      <h1 className="font-display text-foreground mt-2 mb-6 text-2xl font-semibold sm:text-3xl">
        Nuevo cupón
      </h1>
      <CuponForm />
    </div>
  );
}
