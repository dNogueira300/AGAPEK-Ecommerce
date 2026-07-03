import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LogOut, Mail, User } from "lucide-react";
import { getPerfil } from "@/lib/auth";
import { signOutAction } from "@/lib/auth-actions";

export const metadata: Metadata = { title: "Mi perfil" };
export const dynamic = "force-dynamic";

export default async function PerfilPage() {
  const data = await getPerfil();
  if (!data) redirect("/login?redirect=/perfil");

  const { perfil, email } = data;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
        Mi perfil
      </h1>

      <div className="mt-8 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-primary">
            <User className="size-7" />
          </span>
          <div>
            <p className="font-display text-lg font-semibold text-foreground">
              {perfil.nombre}
            </p>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="size-3.5" />
              {email}
            </p>
          </div>
        </div>

        <dl className="mt-6 grid gap-4 border-t border-border pt-6 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Celular
            </dt>
            <dd className="mt-1 text-sm text-foreground">
              {perfil.celular ?? "No registrado"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              DNI
            </dt>
            <dd className="mt-1 text-sm text-foreground">
              {perfil.dni ?? "No registrado"}
            </dd>
          </div>
        </dl>
      </div>

      <form action={signOutAction} className="mt-6">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
        >
          <LogOut className="size-4" />
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
