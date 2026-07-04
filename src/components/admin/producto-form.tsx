"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import {
  guardarProducto,
  type ProductoState,
} from "@/lib/producto-actions";
import { cn } from "@/lib/utils";

export interface Opcion {
  id: string;
  nombre: string;
}
export interface ProductoEdit {
  id: string;
  nombre: string;
  descripcionCorta: string | null;
  descripcion: string | null;
  modoUso: string | null;
  precio: number;
  precioOferta: number | null;
  stock: number;
  categoriaId: string;
  marcaId: string;
  tipoPiel: string[];
  necesidad: string[];
  destacado: boolean;
  nuevo: boolean;
  activo: boolean;
  imagen: string | null;
}

const TIPOS_PIEL = ["seca", "grasa", "mixta", "sensible", "normal"];
const NECESIDADES = ["calmar", "hidratar", "iluminar", "limpiar"];

const input =
  "h-11 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";
const label = "text-sm font-medium text-foreground";

export function ProductoForm({
  categorias,
  marcas,
  producto,
}: {
  categorias: Opcion[];
  marcas: Opcion[];
  producto?: ProductoEdit;
}) {
  const [state, formAction, pending] = useActionState<ProductoState, FormData>(
    guardarProducto,
    {},
  );
  const [preview, setPreview] = useState<string | null>(producto?.imagen ?? null);

  const chip = (
    name: string,
    value: string,
    checked: boolean,
    text: string,
  ) => (
    <label
      key={value}
      className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm capitalize text-foreground/80 has-[:checked]:border-primary has-[:checked]:bg-primary/10 has-[:checked]:text-foreground"
    >
      <input
        type="checkbox"
        name={name}
        value={value}
        defaultChecked={checked}
        className="size-3.5 accent-[color:var(--primary)]"
      />
      {text}
    </label>
  );

  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {producto && <input type="hidden" name="id" value={producto.id} />}

      {/* Columna principal */}
      <div className="space-y-6">
        <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
          <div className="space-y-1.5">
            <label className={label} htmlFor="nombre">Nombre</label>
            <input id="nombre" name="nombre" required defaultValue={producto?.nombre} className={input} />
          </div>
          <div className="space-y-1.5">
            <label className={label} htmlFor="descripcionCorta">Descripción corta</label>
            <input id="descripcionCorta" name="descripcionCorta" defaultValue={producto?.descripcionCorta ?? ""} className={input} />
          </div>
          <div className="space-y-1.5">
            <label className={label} htmlFor="descripcion">Descripción</label>
            <textarea id="descripcion" name="descripcion" rows={3} defaultValue={producto?.descripcion ?? ""} className={`${input} h-auto py-3`} />
          </div>
          <div className="space-y-1.5">
            <label className={label} htmlFor="modoUso">Modo de uso</label>
            <textarea id="modoUso" name="modoUso" rows={2} defaultValue={producto?.modoUso ?? ""} className={`${input} h-auto py-3`} />
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className={label} htmlFor="precio">Precio (S/)</label>
              <input id="precio" name="precio" type="number" step="0.01" min="0" required defaultValue={producto?.precio} className={input} />
            </div>
            <div className="space-y-1.5">
              <label className={label} htmlFor="precioOferta">Precio oferta</label>
              <input id="precioOferta" name="precioOferta" type="number" step="0.01" min="0" defaultValue={producto?.precioOferta ?? ""} className={input} />
            </div>
            <div className="space-y-1.5">
              <label className={label} htmlFor="stock">Stock</label>
              <input id="stock" name="stock" type="number" min="0" required defaultValue={producto?.stock ?? 0} className={input} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className={label} htmlFor="categoriaId">Categoría</label>
              <select id="categoriaId" name="categoriaId" required defaultValue={producto?.categoriaId ?? ""} className={input}>
                <option value="" disabled>Elige…</option>
                {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className={label} htmlFor="marcaId">Marca</label>
              <select id="marcaId" name="marcaId" required defaultValue={producto?.marcaId ?? ""} className={input}>
                <option value="" disabled>Elige…</option>
                {marcas.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
              </select>
            </div>
          </div>
          <div>
            <p className={`${label} mb-2`}>Tipo de piel</p>
            <div className="flex flex-wrap gap-2">
              {TIPOS_PIEL.map((t) => chip("tipoPiel", t, producto?.tipoPiel.includes(t) ?? false, t))}
            </div>
          </div>
          <div>
            <p className={`${label} mb-2`}>Necesidad</p>
            <div className="flex flex-wrap gap-2">
              {NECESIDADES.map((n) => chip("necesidad", n, producto?.necesidad.includes(n) ?? false, n))}
            </div>
          </div>
        </section>
      </div>

      {/* Columna lateral */}
      <div className="space-y-6">
        <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
          <p className={label}>Imagen</p>
          <label className="group relative flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-secondary">
            {preview ? (
              <Image src={preview} alt="Vista previa" fill unoptimized className="object-cover" />
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
                setPreview(f ? URL.createObjectURL(f) : producto?.imagen ?? null);
              }}
              className="hidden"
            />
          </label>
          <p className="text-xs text-muted-foreground">Se optimiza a WebP 800×800 automáticamente.</p>
        </section>

        <section className="space-y-3 rounded-2xl border border-border bg-card p-6">
          <p className={label}>Opciones</p>
          {[
            { name: "activo", text: "Activo (visible en la tienda)", def: producto?.activo ?? true },
            { name: "destacado", text: "Destacado en el home", def: producto?.destacado ?? false },
            { name: "nuevo", text: "Marcar como Nuevo", def: producto?.nuevo ?? false },
          ].map((o) => (
            <label key={o.name} className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground/85">
              <input type="checkbox" name={o.name} defaultChecked={o.def} className="size-4 accent-[color:var(--primary)]" />
              {o.text}
            </label>
          ))}
        </section>

        {state.error && (
          <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={pending}
            className={cn(
              "inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 disabled:opacity-60",
            )}
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            {producto ? "Guardar cambios" : "Crear producto"}
          </button>
          <Link
            href="/admin/productos"
            className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-card px-5 text-sm font-semibold text-foreground hover:bg-secondary"
          >
            Cancelar
          </Link>
        </div>
      </div>
    </form>
  );
}
