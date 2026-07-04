"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Opcion {
  value: string;
  label: string;
}

const TIPOS_PIEL: Opcion[] = [
  { value: "grasa", label: "Piel grasa" },
  { value: "seca", label: "Piel seca" },
  { value: "mixta", label: "Piel mixta" },
  { value: "sensible", label: "Piel sensible" },
  { value: "normal", label: "Piel normal" },
];
const NECESIDADES: Opcion[] = [
  { value: "calmar", label: "Calmar" },
  { value: "hidratar", label: "Hidratar" },
  { value: "iluminar", label: "Iluminar" },
  { value: "limpiar", label: "Limpiar" },
];

export function CatalogSidebar({
  categorias,
  marcas,
}: {
  categorias: Opcion[];
  marcas: Opcion[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const push = useCallback(
    (params: URLSearchParams) => {
      const qs = params.toString();
      router.push(qs ? `/catalogo?${qs}` : "/catalogo");
    },
    [router],
  );

  const toggleMulti = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const cur = (params.get(key) ?? "").split(",").filter(Boolean);
      const next = cur.includes(value)
        ? cur.filter((v) => v !== value)
        : [...cur, value];
      if (next.length) params.set(key, next.join(","));
      else params.delete(key);
      push(params);
    },
    [searchParams, push],
  );

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      push(params);
    },
    [searchParams, push],
  );

  const isChecked = (key: string, value: string) =>
    (searchParams.get(key) ?? "").split(",").includes(value);

  const activos =
    ["cat", "marca", "piel", "nec", "min", "max"].reduce(
      (n, k) => n + (searchParams.get(k) ? 1 : 0),
      0,
    );

  const Seccion = ({
    titulo,
    keyName,
    opciones,
  }: {
    titulo: string;
    keyName: string;
    opciones: Opcion[];
  }) => (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-foreground">{titulo}</h3>
      <div className="space-y-1.5">
        {opciones.map((o) => (
          <label
            key={o.value}
            className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground/80"
          >
            <input
              type="checkbox"
              checked={isChecked(keyName, o.value)}
              onChange={() => toggleMulti(keyName, o.value)}
              className="size-4 rounded border-input accent-[color:var(--primary)]"
            />
            {o.label}
          </label>
        ))}
      </div>
    </div>
  );

  const contenido = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-foreground">Filtros</h2>
        {activos > 0 && (
          <button
            type="button"
            onClick={() => push(new URLSearchParams(searchParams.get("q") ? { q: searchParams.get("q")! } : {}))}
            className="text-xs font-medium text-primary hover:underline"
          >
            Limpiar
          </button>
        )}
      </div>
      {categorias.length > 0 && <Seccion titulo="Categorías" keyName="cat" opciones={categorias} />}
      {marcas.length > 0 && <Seccion titulo="Marcas" keyName="marca" opciones={marcas} />}
      <Seccion titulo="Tipo de piel" keyName="piel" opciones={TIPOS_PIEL} />
      <Seccion titulo="Necesidad" keyName="nec" opciones={NECESIDADES} />
      <div>
        <h3 className="mb-2 text-sm font-semibold text-foreground">Precio</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            placeholder="Min"
            defaultValue={searchParams.get("min") ?? ""}
            onBlur={(e) => setParam("min", e.target.value)}
            className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:border-ring"
          />
          <span className="text-muted-foreground">–</span>
          <input
            type="number"
            min="0"
            placeholder="Max"
            defaultValue={searchParams.get("max") ?? ""}
            onBlur={(e) => setParam("max", e.target.value)}
            className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:border-ring"
          />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Trigger móvil */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground lg:hidden"
      >
        <SlidersHorizontal className="size-4" />
        Filtros
        {activos > 0 && (
          <span className="flex size-5 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {activos}
          </span>
        )}
      </button>

      {/* Panel desktop */}
      <aside className="hidden w-60 shrink-0 lg:block">
        <div className="sticky top-24 rounded-2xl border border-border bg-card p-5">
          {contenido}
        </div>
      </aside>

      {/* Drawer móvil */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85%] overflow-y-auto bg-background p-5 shadow-xl">
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                className="inline-flex size-9 items-center justify-center rounded-full hover:bg-secondary"
              >
                <X className="size-5" />
              </button>
            </div>
            {contenido}
          </div>
        </div>
      )}
    </>
  );
}
