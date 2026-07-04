"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { guardarMarca, type MarcaState } from "@/lib/marca-actions";

const input =
  "h-11 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";

export interface MarcaEdit {
  id: string;
  nombre: string;
  aliada: boolean;
  logoUrl: string | null;
}

export function MarcaForm({ marca }: { marca?: MarcaEdit }) {
  const [state, formAction, pending] = useActionState<MarcaState, FormData>(
    guardarMarca,
    {},
  );
  const [preview, setPreview] = useState<string | null>(marca?.logoUrl ?? null);

  return (
    <form action={formAction} className="max-w-lg space-y-5 rounded-2xl border border-border bg-card p-6">
      {marca && <input type="hidden" name="id" value={marca.id} />}

      <div className="flex items-center gap-4">
        <label className="relative flex size-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-secondary">
          {preview ? (
            <Image src={preview} alt="Logo" fill unoptimized className="object-contain p-2" />
          ) : (
            <ImagePlus className="size-5 text-primary" />
          )}
          <input
            type="file"
            name="logo"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              setPreview(f ? URL.createObjectURL(f) : marca?.logoUrl ?? null);
            }}
            className="hidden"
          />
        </label>
        <div>
          <p className="text-sm font-medium text-foreground">Logo (opcional)</p>
          <p className="text-xs text-muted-foreground">Se optimiza a WebP.</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground" htmlFor="nombre">Nombre</label>
        <input id="nombre" name="nombre" required defaultValue={marca?.nombre} className={input} />
      </div>

      <label className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground/85">
        <input type="checkbox" name="aliada" defaultChecked={marca?.aliada ?? true} className="size-4 accent-[color:var(--primary)]" />
        Mostrar en marcas aliadas (marquee del home)
      </label>

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
          {marca ? "Guardar" : "Crear marca"}
        </button>
        <Link href="/admin/marcas" className="inline-flex h-11 items-center rounded-full border border-border bg-card px-5 text-sm font-semibold text-foreground hover:bg-secondary">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
