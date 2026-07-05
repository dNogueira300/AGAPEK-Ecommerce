"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { guardarBanner, type BannerState } from "@/lib/banner-actions";

const input =
  "h-11 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";
const label = "text-sm font-medium text-foreground";

export interface BannerEdit {
  id: string;
  titulo: string | null;
  subtitulo: string | null;
  cta: string | null;
  enlace: string | null;
  orden: number;
  activo: boolean;
  imagenUrl: string;
}

export function BannerForm({ banner }: { banner?: BannerEdit }) {
  const [state, formAction, pending] = useActionState<BannerState, FormData>(
    guardarBanner,
    {},
  );
  const [preview, setPreview] = useState<string | null>(banner?.imagenUrl ?? null);

  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {banner && <input type="hidden" name="id" value={banner.id} />}

      <div className="space-y-6">
        <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
          <div className="space-y-1.5">
            <label className={label} htmlFor="titulo">Título</label>
            <input id="titulo" name="titulo" defaultValue={banner?.titulo ?? ""} className={input} placeholder="El secreto del acabado jugoso…" />
          </div>
          <div className="space-y-1.5">
            <label className={label} htmlFor="subtitulo">Subtítulo</label>
            <textarea id="subtitulo" name="subtitulo" rows={2} defaultValue={banner?.subtitulo ?? ""} className={`${input} h-auto py-3`} placeholder="Texto de apoyo bajo el título" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className={label} htmlFor="cta">Texto del botón</label>
              <input id="cta" name="cta" defaultValue={banner?.cta ?? ""} className={input} placeholder="Comprar ahora" />
            </div>
            <div className="space-y-1.5">
              <label className={label} htmlFor="enlace">Enlace del botón</label>
              <input id="enlace" name="enlace" defaultValue={banner?.enlace ?? ""} className={input} placeholder="/catalogo" />
            </div>
          </div>
        </section>
      </div>

      <div className="space-y-6">
        <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
          <p className={label}>Imagen (1600×600)</p>
          <label className="group relative flex aspect-[8/3] cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-secondary">
            {preview ? (
              <Image src={preview} alt="Banner" fill unoptimized className="object-cover" />
            ) : (
              <span className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                <ImagePlus className="size-6 text-primary" />
                Subir imagen
              </span>
            )}
            <input
              type="file"
              name="imagen"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                setPreview(f ? URL.createObjectURL(f) : banner?.imagenUrl ?? null);
              }}
              className="hidden"
            />
          </label>
        </section>

        <section className="grid grid-cols-2 gap-4 rounded-2xl border border-border bg-card p-6">
          <div className="space-y-1.5">
            <label className={label} htmlFor="orden">Orden</label>
            <input id="orden" name="orden" type="number" min="0" defaultValue={banner?.orden ?? 0} className={input} />
          </div>
          <label className="flex cursor-pointer items-center gap-2.5 self-end pb-2.5 text-sm text-foreground/85">
            <input type="checkbox" name="activo" defaultChecked={banner?.activo ?? true} className="size-4 accent-[color:var(--primary)]" />
            Activo
          </label>
        </section>

        {state.error && (
          <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>
        )}
        <div className="flex gap-3">
          <button type="submit" disabled={pending} className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 disabled:opacity-60">
            {pending && <Loader2 className="size-4 animate-spin" />}
            {banner ? "Guardar" : "Crear banner"}
          </button>
          <Link href="/admin/banners" className="inline-flex h-11 items-center rounded-full border border-border bg-card px-5 text-sm font-semibold text-foreground hover:bg-secondary">
            Cancelar
          </Link>
        </div>
      </div>
    </form>
  );
}
