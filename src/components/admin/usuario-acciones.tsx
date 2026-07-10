"use client";

import { useActionState, useState } from "react";
import { Check, KeyRound, Loader2, X } from "lucide-react";
import {
  cambiarPasswordUsuario,
  toggleActivoUsuario,
  type PasswordState,
} from "@/lib/usuario-actions";
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

/** Botón "Contraseña" que despliega un mini formulario para asignar una nueva. */
export function CambiarPassword({ id }: { id: string }) {
  const [abierto, setAbierto] = useState(false);
  const [state, formAction, pending] = useActionState<PasswordState, FormData>(
    cambiarPasswordUsuario,
    {},
  );

  // Al guardar con éxito se cierra el formulario (ajuste durante render).
  const [prevState, setPrevState] = useState(state);
  if (state !== prevState) {
    setPrevState(state);
    if (state.ok) setAbierto(false);
  }

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
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <input
        type="password"
        name="password"
        required
        minLength={6}
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
      {state.error && (
        <span className="text-destructive w-full text-xs font-medium">{state.error}</span>
      )}
    </form>
  );
}
