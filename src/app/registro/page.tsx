import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { getUser } from "@/lib/auth";
import { RegisterForm } from "@/components/tienda/auth-forms";

export const metadata: Metadata = { title: "Crear cuenta" };
export const dynamic = "force-dynamic";

export default async function RegistroPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect: to } = await searchParams;
  const destino = to?.startsWith("/") ? to : "/";
  const user = await getUser();
  if (user) redirect(destino);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="mb-6 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Sparkles className="size-6" strokeWidth={2.25} />
        </span>
        <h1 className="mt-4 font-display text-2xl font-semibold text-foreground">
          Crea tu cuenta AGAPEK
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Regístrate para comprar y seguir tus pedidos.
        </p>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <RegisterForm redirect={destino} />
      </div>
    </div>
  );
}
