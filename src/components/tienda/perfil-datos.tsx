"use client";

import { useActionState, useState } from "react";
import { Check, Mail, Pencil, TriangleAlert, User, X } from "lucide-react";
import { actualizarPerfilAction, type PerfilFormState } from "@/lib/perfil-actions";
import { cn } from "@/lib/utils";

interface Datos {
  nombre: string;
  email: string | null;
  celular: string | null;
  dni: string | null;
}

const inputClass =
  "h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";
const labelClass = "text-sm font-medium text-foreground";

/** Card de datos del perfil con edición inline (completar registro). */
export function PerfilDatosCard({ datos }: { datos: Datos }) {
  const [editando, setEditando] = useState(false);
  const [state, formAction, pending] = useActionState<PerfilFormState, FormData>(
    actualizarPerfilAction,
    {},
  );

  // Al guardar con éxito, vuelve a la vista de solo lectura
  // (ajuste de estado durante render, patrón recomendado por React).
  const [prevState, setPrevState] = useState(state);
  if (state !== prevState) {
    setPrevState(state);
    if (state.message) setEditando(false);
  }

  const incompleto = !datos.celular || !datos.dni;

  return (
    <div className="border-border bg-card mt-8 rounded-2xl border p-6">
      <div className="flex items-center gap-4">
        <span className="bg-secondary text-primary flex size-14 items-center justify-center rounded-full">
          <User className="size-7" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-foreground text-lg font-semibold">
            {datos.nombre}
          </p>
          <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
            <Mail className="size-3.5 shrink-0" />
            <span className="truncate">{datos.email}</span>
          </p>
        </div>
        {!editando && (
          <button
            type="button"
            onClick={() => setEditando(true)}
            className="border-border bg-background text-foreground hover:bg-secondary inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-colors"
          >
            <Pencil className="size-3.5" />
            Editar
          </button>
        )}
      </div>

      {!editando && incompleto && (
        <p className="bg-secondary/60 text-foreground/80 mt-5 flex items-start gap-2 rounded-xl px-4 py-3 text-sm">
          <TriangleAlert className="text-primary mt-0.5 size-4 shrink-0" />
          Tu registro está incompleto. Agrega tu{" "}
          {[!datos.celular && "celular", !datos.dni && "DNI"]
            .filter(Boolean)
            .join(" y ")}{" "}
          para agilizar tus pedidos.
        </p>
      )}

      {state.message && !editando && (
        <p className="bg-chart-5/10 mt-5 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-[color:var(--chart-5)]">
          <Check className="size-4 shrink-0" />
          {state.message}
        </p>
      )}

      {editando ? (
        <form action={formAction} className="border-border mt-6 space-y-4 border-t pt-6">
          <div className="space-y-1.5">
            <label className={labelClass} htmlFor="perfil-nombre">
              Nombre completo
            </label>
            <input
              id="perfil-nombre"
              name="nombre"
              type="text"
              required
              defaultValue={datos.nombre}
              autoComplete="name"
              className={inputClass}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className={labelClass} htmlFor="perfil-celular">
                Celular
              </label>
              <input
                id="perfil-celular"
                name="celular"
                type="tel"
                inputMode="numeric"
                pattern="9[0-9]{8}"
                maxLength={9}
                defaultValue={datos.celular ?? ""}
                autoComplete="tel-national"
                placeholder="9XXXXXXXX"
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass} htmlFor="perfil-dni">
                DNI
              </label>
              <input
                id="perfil-dni"
                name="dni"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{8}"
                maxLength={8}
                defaultValue={datos.dni ?? ""}
                placeholder="8 dígitos"
                className={inputClass}
              />
            </div>
          </div>

          {state.error && (
            <p className="bg-destructive/10 text-destructive rounded-xl px-4 py-3 text-sm font-medium">
              {state.error}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={pending}
              className={cn(
                "bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold shadow-sm transition-transform hover:-translate-y-0.5 active:scale-[0.97]",
                pending && "cursor-wait opacity-70",
              )}
            >
              <Check className="size-4" />
              {pending ? "Guardando…" : "Guardar cambios"}
            </button>
            <button
              type="button"
              onClick={() => setEditando(false)}
              className="border-border bg-background text-foreground hover:bg-secondary inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors"
            >
              <X className="size-4" />
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <dl className="border-border mt-6 grid gap-4 border-t pt-6 sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Celular
            </dt>
            <dd className="text-foreground mt-1 text-sm">
              {datos.celular ?? "No registrado"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              DNI
            </dt>
            <dd className="text-foreground mt-1 text-sm">
              {datos.dni ?? "No registrado"}
            </dd>
          </div>
        </dl>
      )}
    </div>
  );
}
