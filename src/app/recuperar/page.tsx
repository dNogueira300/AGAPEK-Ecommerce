import type { Metadata } from "next";
import { KeyRound } from "lucide-react";
import { ResetRequestForm } from "@/components/tienda/auth-forms";

export const metadata: Metadata = { title: "Recuperar contraseña" };
export const dynamic = "force-dynamic";

export default function RecuperarPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="mb-6 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <KeyRound className="size-6" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-semibold text-foreground">
          Recupera tu contraseña
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Te enviaremos un enlace a tu correo para restablecerla.
        </p>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <ResetRequestForm />
      </div>
    </div>
  );
}
