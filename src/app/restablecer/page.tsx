import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import { getUser } from "@/lib/auth";
import { NewPasswordForm } from "@/components/tienda/auth-forms";

export const metadata: Metadata = { title: "Nueva contraseña" };
export const dynamic = "force-dynamic";

export default async function RestablecerPage() {
  const user = await getUser();

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="mb-6 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <KeyRound className="size-6" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-semibold text-foreground">
          Nueva contraseña
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Ingresa tu nueva contraseña para tu cuenta.
        </p>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        {user ? (
          <NewPasswordForm />
        ) : (
          <div className="text-center text-sm text-muted-foreground">
            <p>
              El enlace no es válido o expiró. Solicita uno nuevo desde{" "}
              <Link href="/recuperar" className="font-semibold text-primary hover:underline">
                recuperar contraseña
              </Link>
              .
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
