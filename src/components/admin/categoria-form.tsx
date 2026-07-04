"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import {
  guardarCategoria,
  type CategoriaState,
} from "@/lib/categoria-actions";

const input =
  "h-11 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";

export interface CategoriaEdit {
  id: string;
  nombre: string;
  orden: number;
}

export function CategoriaForm({ categoria }: { categoria?: CategoriaEdit }) {
  const [state, formAction, pending] = useActionState<CategoriaState, FormData>(
    guardarCategoria,
    {},
  );

  return (
    <form action={formAction} className="max-w-lg space-y-5 rounded-2xl border border-border bg-card p-6">
      {categoria && <input type="hidden" name="id" value={categoria.id} />}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground" htmlFor="nombre">Nombre</label>
        <input id="nombre" name="nombre" required defaultValue={categoria?.nombre} className={input} />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground" htmlFor="orden">Orden</label>
        <input id="orden" name="orden" type="number" min="0" defaultValue={categoria?.orden ?? 0} className={input} />
        <p className="text-xs text-muted-foreground">Menor número aparece primero.</p>
      </div>
      {state.error && (
        <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>
      )}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {pending && <Loader2 className="size-4 animate-spin" />}
          {categoria ? "Guardar" : "Crear categoría"}
        </button>
        <Link href="/admin/categorias" className="inline-flex h-11 items-center rounded-full border border-border bg-card px-5 text-sm font-semibold text-foreground hover:bg-secondary">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
