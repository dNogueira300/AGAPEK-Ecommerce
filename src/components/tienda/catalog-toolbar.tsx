"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { ArrowUpDown } from "lucide-react";

export interface Opcion {
  value: string;
  label: string;
}

export const ORDEN_OPCIONES: Opcion[] = [
  { value: "relevancia", label: "Relevancia" },
  { value: "nuevo", label: "Más nuevos" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
];

export function CatalogToolbar({
  categorias,
  marcas,
  actual,
}: {
  categorias: Opcion[];
  marcas: Opcion[];
  actual: { cat: string; marca: string; sort: string; disp: boolean };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "todas" && value !== "todos" && value !== "relevancia") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      const qs = params.toString();
      router.push(qs ? `/catalogo?${qs}` : "/catalogo");
    },
    [router, searchParams],
  );

  const selectClass =
    "h-10 rounded-full border border-input bg-card px-4 pr-8 text-sm text-foreground outline-none transition-colors hover:border-primary/40 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="sr-only" htmlFor="f-cat">
        Categoría
      </label>
      <select
        id="f-cat"
        className={selectClass}
        value={actual.cat}
        onChange={(e) => setParam("cat", e.target.value)}
      >
        <option value="todas">Todas las categorías</option>
        {categorias.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>

      <label className="sr-only" htmlFor="f-marca">
        Marca
      </label>
      <select
        id="f-marca"
        className={selectClass}
        value={actual.marca}
        onChange={(e) => setParam("marca", e.target.value)}
      >
        <option value="todas">Todas las marcas</option>
        {marcas.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>

      <div className="relative inline-flex items-center">
        <ArrowUpDown className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
        <label className="sr-only" htmlFor="f-sort">
          Ordenar
        </label>
        <select
          id="f-sort"
          className={`${selectClass} pl-9`}
          value={actual.sort}
          onChange={(e) => setParam("sort", e.target.value)}
        >
          {ORDEN_OPCIONES.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <label className="ml-1 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-foreground/80">
        <input
          type="checkbox"
          checked={actual.disp}
          onChange={(e) => setParam("disp", e.target.checked ? "1" : null)}
          className="size-4 rounded border-input text-primary accent-[color:var(--primary)]"
        />
        Solo disponibles
      </label>
    </div>
  );
}
