"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { guardarTestimonio, type TestimonioState } from "@/lib/testimonio-actions";

const input =
  "h-11 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";
const label = "text-sm font-medium text-foreground";

export interface TestimonioEdit {
  id: string;
  nombre: string;
  texto: string;
  rating: number;
  activo: boolean;
}

export function TestimonioForm({ testimonio }: { testimonio?: TestimonioEdit }) {
  const [state, formAction, pending] = useActionState<TestimonioState, FormData>(
    guardarTestimonio,
    {},
  );

  return (
    <form action={formAction} className="max-w-lg space-y-5 rounded-2xl border border-border bg-card p-6">
      {testimonio && <input type="hidden" name="id" value={testimonio.id} />}
      <div className="space-y-1.5">
        <label className={label} htmlFor="nombre">Nombre del cliente</label>
        <input id="nombre" name="nombre" required defaultValue={testimonio?.nombre} className={input} placeholder="Lucía R." />
      </div>
      <div className="space-y-1.5">
        <label className={label} htmlFor="texto">Testimonio</label>
        <textarea id="texto" name="texto" required rows={4} defaultValue={testimonio?.texto} className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm leading-relaxed text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30" placeholder="Me ayudaron a armar mi rutina…" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={label} htmlFor="rating">Estrellas</label>
          <select id="rating" name="rating" defaultValue={testimonio?.rating ?? 5} className={input}>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>{n} ⭐</option>
            ))}
          </select>
        </div>
        <label className="flex cursor-pointer items-center gap-2.5 self-end pb-2.5 text-sm text-foreground/85">
          <input type="checkbox" name="activo" defaultChecked={testimonio?.activo ?? true} className="size-4 accent-[color:var(--primary)]" />
          Activo
        </label>
      </div>
      {state.error && (
        <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>
      )}
      <div className="flex gap-3">
        <button type="submit" disabled={pending} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 disabled:opacity-60">
          {pending && <Loader2 className="size-4 animate-spin" />}
          {testimonio ? "Guardar" : "Crear testimonio"}
        </button>
        <Link href="/admin/testimonios" className="inline-flex h-11 items-center rounded-full border border-border bg-card px-5 text-sm font-semibold text-foreground hover:bg-secondary">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
