"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import {
  signInAction,
  signUpAction,
  type AuthState,
} from "@/lib/auth-actions";
import { GoogleButton } from "@/components/tienda/google-button";

const inputClass =
  "h-11 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";
const labelClass = "text-sm font-medium text-foreground";

function Feedback({ state }: { state: AuthState }) {
  if (state.error)
    return (
      <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {state.error}
      </p>
    );
  if (state.message)
    return (
      <p className="rounded-xl bg-secondary px-3 py-2 text-sm text-foreground">
        {state.message}
      </p>
    );
  return null;
}

function SubmitButton({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
    >
      {pending && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <span className="h-px flex-1 bg-border" />o<span className="h-px flex-1 bg-border" />
    </div>
  );
}

export function LoginForm({ redirect = "/" }: { redirect?: string }) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    signInAction,
    {},
  );

  return (
    <div className="space-y-5">
      <GoogleButton redirectTo={redirect} />
      <Divider />
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="redirect" value={redirect} />
        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="email">
            Correo
          </label>
          <input id="email" name="email" type="email" required autoComplete="email" className={inputClass} placeholder="tucorreo@ejemplo.com" />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="password">
            Contraseña
          </label>
          <input id="password" name="password" type="password" required autoComplete="current-password" className={inputClass} placeholder="••••••••" />
        </div>
        <Feedback state={state} />
        <SubmitButton pending={pending}>Iniciar sesión</SubmitButton>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="font-semibold text-primary hover:underline">
          Regístrate
        </Link>
      </p>
    </div>
  );
}

export function RegisterForm({ redirect = "/" }: { redirect?: string }) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    signUpAction,
    {},
  );

  return (
    <div className="space-y-5">
      <GoogleButton redirectTo={redirect} />
      <Divider />
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="redirect" value={redirect} />
        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="nombre">
            Nombre completo
          </label>
          <input id="nombre" name="nombre" type="text" required autoComplete="name" className={inputClass} placeholder="Tu nombre" />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="email">
            Correo
          </label>
          <input id="email" name="email" type="email" required autoComplete="email" className={inputClass} placeholder="tucorreo@ejemplo.com" />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="password">
            Contraseña
          </label>
          <input id="password" name="password" type="password" required autoComplete="new-password" minLength={6} className={inputClass} placeholder="Mínimo 6 caracteres" />
        </div>
        <Feedback state={state} />
        <SubmitButton pending={pending}>Crear cuenta</SubmitButton>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
