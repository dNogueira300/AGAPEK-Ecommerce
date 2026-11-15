"use client";

import { useActionState, useState } from "react";
import { Check, KeyRound, Loader2, LogOut, X } from "lucide-react";
import {
  cambiarPasswordUsuario,
  toggleActivoUsuario,
  type PasswordState,
} from "@/lib/usuario-actions";
import { REQUISITOS_PASSWORD } from "@/lib/password";
import { PasswordRequisitos } from "@/components/tienda/password-requisitos";
import { cn } from "@/lib/utils";

/** Badge de estado + botón activar/desactivar (deshabilitado para uno mismo). */
export function EstadoToggle({
  id,
  activo,
  disabled,
}: {
  id: string;
  activo: boolean;
  disabled?: boolean;
}) {
  return (
    <form action={toggleActivoUsuario.bind(null, id)} className="flex items-center gap-2">
      <span
        className={cn(
          "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
          activo
            ? "bg-chart-5/15 text-[color:var(--chart-5)]"
            : "bg-destructive/10 text-destructive",
        )}
      >
        {activo ? "Activo" : "Desactivado"}
      </span>
      {!disabled && (
        <button
          type="submit"
          className="border-border bg-card text-foreground/80 hover:bg-secondary rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors"
        >
          {activo ? "Desactivar" : "Activar"}
        </button>
      )}
    </form>
  );
}

/**
 * Confirmación antes de cambiar la propia contraseña: al cambiarla Supabase
 * revoca todas las sesiones, así que se avisa y al aceptar se cambia, se cierra
 * sesión en todos los dispositivos y se va al login.
 */
function AvisoCierreSesion({
  pending,
  onCancelar,
}: {
  pending: boolean;
  onCancelar: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="aviso-pass-titulo"
        aria-describedby="aviso-pass-texto"
        className="border-border bg-card w-full max-w-sm rounded-2xl border p-6 text-left shadow-xl"
      >
        <span className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-full">
          <LogOut className="size-5" />
        </span>
        <h2 id="aviso-pass-titulo" className="text-foreground mt-4 text-lg font-semibold">
          Se cerrará tu sesión
        </h2>
        <p id="aviso-pass-texto" className="text-muted-foreground mt-2 text-sm">
          Al cambiar tu contraseña se cerrará la sesión actual y la de todos los
          dispositivos donde hayas iniciado. Luego entra con tu nueva contraseña.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancelar}
            disabled={pending}
            className="border-border bg-card text-foreground hover:bg-secondary h-10 flex-1 rounded-full border text-sm font-semibold disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="submit"
            autoFocus
            disabled={pending}
            className="bg-primary text-primary-foreground inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full text-sm font-semibold disabled:opacity-60"
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}

/** Botón "Contraseña" que despliega un mini formulario para asignar una nueva. */
export function CambiarPassword({ id, propia = false }: { id: string; propia?: boolean }) {
  const [abierto, setAbierto] = useState(false);
  const [valor, setValor] = useState("");
  const [confirmando, setConfirmando] = useState(false);
  const [state, formAction, pending] = useActionState<PasswordState, FormData>(
    cambiarPasswordUsuario,
    {},
  );

  // Al terminar: con éxito se cierra el formulario; con error se oculta el aviso
  // para mostrar el mensaje (ajuste durante render).
  const [prevState, setPrevState] = useState(state);
  if (state !== prevState) {
    setPrevState(state);
    setConfirmando(false);
    if (state.ok) {
      setAbierto(false);
      setValor("");
    }
  }

  const valida = REQUISITOS_PASSWORD.every((r) => r.cumple(valor));

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="border-border bg-card text-foreground/80 hover:bg-secondary inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors"
      >
        <KeyRound className="size-3.5" />
        {state.ok ? "Cambiada ✓" : "Contraseña"}
      </button>
    );
  }

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        // Propia cuenta con contraseña válida: primero el aviso; el "Aceptar"
        // del aviso vuelve a enviar este mismo formulario.
        if (propia && valida && !confirmando) {
          e.preventDefault();
          setConfirmando(true);
        }
      }}
      className="flex flex-wrap items-center gap-2"
    >
      <input type="hidden" name="id" value={id} />
      <input
        type="password"
        name="password"
        required
        minLength={8}
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        autoComplete="new-password"
        placeholder="Nueva contraseña"
        className="border-input bg-card text-foreground focus-visible:border-ring h-9 w-40 rounded-lg border px-3 text-sm outline-none"
      />
      <button
        type="submit"
        disabled={pending}
        aria-label="Guardar contraseña"
        className="bg-primary text-primary-foreground inline-flex size-9 items-center justify-center rounded-lg disabled:opacity-60"
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Check className="size-4" />
        )}
      </button>
      <button
        type="button"
        onClick={() => setAbierto(false)}
        aria-label="Cancelar"
        className="border-border bg-card text-foreground/70 hover:bg-secondary inline-flex size-9 items-center justify-center rounded-lg border"
      >
        <X className="size-4" />
      </button>
      <div className="w-full">
        <PasswordRequisitos valor={valor} />
      </div>
      {state.error && (
        <span className="text-destructive w-full text-xs font-medium">{state.error}</span>
      )}
      {confirmando && (
        <AvisoCierreSesion pending={pending} onCancelar={() => setConfirmando(false)} />
      )}
    </form>
  );
}
