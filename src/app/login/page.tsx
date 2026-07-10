import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { getUser } from "@/lib/auth";
import { LoginForm } from "@/components/tienda/auth-forms";

export const metadata: Metadata = { title: "Iniciar sesión" };
export const dynamic = "force-dynamic";

const ERRORES: Record<string, string> = {
  confirm:
    "El enlace del correo no es válido o ya expiró. Solicita uno nuevo e inténtalo otra vez.",
  oauth:
    "No pudimos completar el acceso. Si venías de un correo de recuperación, ábrelo en el mismo navegador donde lo solicitaste o pide un enlace nuevo.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const { redirect: to, error } = await searchParams;
  const destino = to?.startsWith("/") ? to : "/";
  const user = await getUser();
  if (user) redirect(destino);
  const mensajeError = error ? ERRORES[error] : undefined;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="mb-6 text-center">
        <span className="bg-primary text-primary-foreground mx-auto flex size-12 items-center justify-center rounded-full">
          <Sparkles className="size-6" strokeWidth={2.25} />
        </span>
        <h1 className="font-display text-foreground mt-4 text-2xl font-semibold">
          Bienvenida de vuelta
        </h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Inicia sesión para continuar tu compra.
        </p>
      </div>
      {mensajeError && (
        <p className="bg-destructive/10 text-destructive mb-4 rounded-xl px-4 py-3 text-sm font-medium">
          {mensajeError}
        </p>
      )}
      <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
        <LoginForm redirect={destino} />
      </div>
    </div>
  );
}
