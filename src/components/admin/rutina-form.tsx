"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ImagePlus,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { guardarRutina, type RutinaState } from "@/lib/rutina-actions";

const input =
  "h-11 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";
const label = "text-sm font-medium text-foreground";

export interface ProductoOpcion {
  id: string;
  nombre: string;
  marca: string;
}

interface PasoData {
  titulo: string;
  descripcion: string;
  momento: "DIA" | "NOCHE" | "AMBOS";
  productoIds: string[];
}

export interface RutinaEdit {
  id: string;
  titulo: string;
  tipoPiel: string;
  descripcion: string | null;
  orden: number;
  publicado: boolean;
  portadaUrl: string | null;
  pasos: PasoData[];
}

const TIPOS_PIEL = [
  { value: "todas", label: "Todas" },
  { value: "grasa", label: "Piel grasa" },
  { value: "seca", label: "Piel seca" },
  { value: "mixta", label: "Piel mixta" },
  { value: "sensible", label: "Piel sensible" },
  { value: "normal", label: "Piel normal" },
];

const MOMENTOS = [
  { value: "AMBOS", label: "Día y noche" },
  { value: "DIA", label: "Día" },
  { value: "NOCHE", label: "Noche" },
] as const;

const pasoVacio = (): PasoData => ({
  titulo: "",
  descripcion: "",
  momento: "AMBOS",
  productoIds: [],
});

export function RutinaForm({
  rutina,
  productos,
}: {
  rutina?: RutinaEdit;
  productos: ProductoOpcion[];
}) {
  const [state, formAction, pending] = useActionState<RutinaState, FormData>(
    guardarRutina,
    {},
  );
  const [pasos, setPasos] = useState<PasoData[]>(
    rutina?.pasos.length ? rutina.pasos : [pasoVacio()],
  );
  const [preview, setPreview] = useState<string | null>(rutina?.portadaUrl ?? null);

  const setPaso = (i: number, patch: Partial<PasoData>) =>
    setPasos((prev) => prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  const addPaso = () => setPasos((prev) => [...prev, pasoVacio()]);
  const removePaso = (i: number) =>
    setPasos((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev));
  const movePaso = (i: number, dir: -1 | 1) =>
    setPasos((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const copy = [...prev];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  return (
    <form action={formAction} className="space-y-6">
      {rutina && <input type="hidden" name="id" value={rutina.id} />}
      <input type="hidden" name="pasos" value={JSON.stringify(pasos)} />

      {/* Datos generales */}
      <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
          <div className="space-y-1.5">
            <label className={label} htmlFor="titulo">Título</label>
            <input id="titulo" name="titulo" required defaultValue={rutina?.titulo ?? ""} className={input} placeholder="Rutina hidratante para piel seca" />
          </div>
          <div className="space-y-1.5">
            <label className={label} htmlFor="tipoPiel">Tipo de piel</label>
            <select id="tipoPiel" name="tipoPiel" defaultValue={rutina?.tipoPiel ?? "todas"} className={input}>
              {TIPOS_PIEL.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className={label} htmlFor="descripcion">Descripción</label>
          <textarea id="descripcion" name="descripcion" rows={2} defaultValue={rutina?.descripcion ?? ""} className={`${input} h-auto py-3`} placeholder="Breve introducción a la rutina" />
        </div>
        <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
          <div className="space-y-1.5">
            <p className={label}>Portada (opcional, 1200×800)</p>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border bg-card px-4 py-3 text-sm text-muted-foreground hover:bg-secondary">
              <ImagePlus className="size-5" />
              {preview ? "Cambiar imagen" : "Subir imagen"}
              <input
                type="file"
                name="portada"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setPreview(f ? URL.createObjectURL(f) : rutina?.portadaUrl ?? null);
                }}
              />
            </label>
            {preview && (
              <span className="relative mt-1 block h-28 w-full overflow-hidden rounded-xl bg-secondary">
                <Image src={preview} alt="Portada" fill sizes="400px" unoptimized className="object-cover" />
              </span>
            )}
          </div>
          <div className="space-y-1.5">
            <label className={label} htmlFor="orden">Orden</label>
            <input id="orden" name="orden" type="number" min="0" defaultValue={rutina?.orden ?? 0} className={input} />
            <label className="mt-3 flex items-center gap-2.5">
              <input type="checkbox" name="publicado" defaultChecked={rutina?.publicado ?? false} className="size-4 rounded border-input text-primary focus-visible:ring-2 focus-visible:ring-ring/30" />
              <span className={label}>Publicada</span>
            </label>
          </div>
        </div>
      </section>

      {/* Pasos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-foreground">Pasos de la rutina</h2>
          <button type="button" onClick={addPaso} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-sm font-semibold text-foreground hover:bg-secondary">
            <Plus className="size-4" /> Añadir paso
          </button>
        </div>

        {pasos.map((paso, i) => (
          <PasoEditor
            key={i}
            index={i}
            total={pasos.length}
            paso={paso}
            productos={productos}
            onChange={(patch) => setPaso(i, patch)}
            onRemove={() => removePaso(i)}
            onMove={(dir) => movePaso(i, dir)}
          />
        ))}
      </div>

      {state.error && (
        <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{state.error}</p>
      )}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60">
          {pending && <Loader2 className="size-4 animate-spin" />}
          {rutina ? "Guardar cambios" : "Crear rutina"}
        </button>
        <Link href="/admin/rutinas" className="text-sm font-medium text-muted-foreground hover:text-foreground">Cancelar</Link>
      </div>
    </form>
  );
}

function PasoEditor({
  index,
  total,
  paso,
  productos,
  onChange,
  onRemove,
  onMove,
}: {
  index: number;
  total: number;
  paso: PasoData;
  productos: ProductoOpcion[];
  onChange: (patch: Partial<PasoData>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const [q, setQ] = useState("");
  const seleccionados = productos.filter((p) => paso.productoIds.includes(p.id));
  const resultados = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return productos
      .filter((p) => !paso.productoIds.includes(p.id))
      .filter((p) => `${p.nombre} ${p.marca}`.toLowerCase().includes(t))
      .slice(0, 6);
  }, [q, productos, paso.productoIds]);

  const toggle = (id: string, add: boolean) =>
    onChange({
      productoIds: add
        ? [...paso.productoIds, id]
        : paso.productoIds.filter((x) => x !== id),
    });

  return (
    <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-primary">
          {index + 1}
        </span>
        <input
          value={paso.titulo}
          onChange={(e) => onChange({ titulo: e.target.value })}
          placeholder="Nombre del paso (ej. Limpieza)"
          className={`${input} h-10`}
        />
        <div className="flex shrink-0 items-center gap-1">
          <button type="button" onClick={() => onMove(-1)} disabled={index === 0} aria-label="Subir" className="inline-flex size-9 items-center justify-center rounded-lg text-foreground/60 hover:bg-secondary disabled:opacity-30">
            <ArrowUp className="size-4" />
          </button>
          <button type="button" onClick={() => onMove(1)} disabled={index === total - 1} aria-label="Bajar" className="inline-flex size-9 items-center justify-center rounded-lg text-foreground/60 hover:bg-secondary disabled:opacity-30">
            <ArrowDown className="size-4" />
          </button>
          <button type="button" onClick={onRemove} disabled={total === 1} aria-label="Eliminar paso" className="inline-flex size-9 items-center justify-center rounded-lg text-foreground/60 hover:bg-destructive/10 hover:text-destructive disabled:opacity-30">
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
        <textarea
          value={paso.descripcion}
          onChange={(e) => onChange({ descripcion: e.target.value })}
          rows={2}
          placeholder="Qué hacer en este paso (opcional)"
          className={`${input} h-auto py-2.5`}
        />
        <select
          value={paso.momento}
          onChange={(e) => onChange({ momento: e.target.value as PasoData["momento"] })}
          className={`${input} h-10 self-start`}
        >
          {MOMENTOS.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>

      {/* Productos del paso */}
      <div>
        {seleccionados.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {seleccionados.map((p) => (
              <span key={p.id} className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 py-1 pl-3 pr-1 text-xs font-medium text-foreground">
                {p.nombre}
                <button type="button" onClick={() => toggle(p.id, false)} aria-label={`Quitar ${p.nombre}`} className="inline-flex size-5 items-center justify-center rounded-full text-muted-foreground hover:bg-background">
                  <X className="size-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar producto para añadir…"
            className={`${input} h-10 pl-9`}
          />
          {resultados.length > 0 && (
            <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-border bg-card shadow-lg">
              {resultados.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    toggle(p.id, true);
                    setQ("");
                  }}
                  className="flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left text-sm hover:bg-secondary"
                >
                  <span className="truncate text-foreground">{p.nombre}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{p.marca}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
