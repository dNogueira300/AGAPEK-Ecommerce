"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { guardarPost, type PostState } from "@/lib/post-actions";

const input =
  "h-11 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";
const label = "text-sm font-medium text-foreground";

const CATEGORIAS = ["Rutinas", "Ingredientes", "Tips", "Maquillaje"];

export interface PostEdit {
  id: string;
  titulo: string;
  categoria: string | null;
  autor: string | null;
  resumen: string | null;
  contenido: string;
  portadaUrl: string | null;
  publicado: boolean;
}

export function PostForm({ post }: { post?: PostEdit }) {
  const [state, formAction, pending] = useActionState<PostState, FormData>(
    guardarPost,
    {},
  );
  const [preview, setPreview] = useState<string | null>(post?.portadaUrl ?? null);

  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-[1fr_300px]">
      {post && <input type="hidden" name="id" value={post.id} />}

      <div className="space-y-6">
        <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
          <div className="space-y-1.5">
            <label className={label} htmlFor="titulo">Título</label>
            <input id="titulo" name="titulo" required defaultValue={post?.titulo} className={input} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className={label} htmlFor="categoria">Categoría</label>
              <input id="categoria" name="categoria" list="cats" defaultValue={post?.categoria ?? ""} className={input} placeholder="Rutinas, Tips…" />
              <datalist id="cats">
                {CATEGORIAS.map((c) => <option key={c} value={c} />)}
              </datalist>
            </div>
            <div className="space-y-1.5">
              <label className={label} htmlFor="autor">Autor</label>
              <input id="autor" name="autor" defaultValue={post?.autor ?? ""} className={input} placeholder="Equipo AGAPEK" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className={label} htmlFor="resumen">Resumen</label>
            <input id="resumen" name="resumen" defaultValue={post?.resumen ?? ""} className={input} placeholder="Breve descripción para la tarjeta" />
          </div>
          <div className="space-y-1.5">
            <label className={label} htmlFor="contenido">Contenido</label>
            <textarea
              id="contenido"
              name="contenido"
              required
              rows={12}
              defaultValue={post?.contenido}
              className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm leading-relaxed text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
              placeholder="Escribe el artículo. Separa los párrafos con una línea en blanco."
            />
            <p className="text-xs text-muted-foreground">Separa los párrafos con una línea en blanco.</p>
          </div>
        </section>
      </div>

      <div className="space-y-6">
        <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
          <p className={label}>Portada</p>
          <label className="group relative flex aspect-[16/10] cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-secondary">
            {preview ? (
              <Image src={preview} alt="Portada" fill unoptimized className="object-cover" />
            ) : (
              <span className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                <ImagePlus className="size-6 text-primary" />
                Subir portada
              </span>
            )}
            <input
              type="file"
              name="portada"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                setPreview(f ? URL.createObjectURL(f) : post?.portadaUrl ?? null);
              }}
              className="hidden"
            />
          </label>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground/85">
            <input type="checkbox" name="publicado" defaultChecked={post?.publicado ?? false} className="size-4 accent-[color:var(--primary)]" />
            Publicado (visible en el blog)
          </label>
        </section>

        {state.error && (
          <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            {post ? "Guardar" : "Crear post"}
          </button>
          <Link href="/admin/blog" className="inline-flex h-11 items-center rounded-full border border-border bg-card px-5 text-sm font-semibold text-foreground hover:bg-secondary">
            Cancelar
          </Link>
        </div>
      </div>
    </form>
  );
}
