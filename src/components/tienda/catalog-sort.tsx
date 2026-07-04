"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown } from "lucide-react";

const OPCIONES = [
  { value: "relevancia", label: "Relevancia" },
  { value: "nuevo", label: "Más nuevos" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
];

export function CatalogSort({ value }: { value: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const onChange = (v: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (v && v !== "relevancia") params.set("sort", v);
    else params.delete("sort");
    const qs = params.toString();
    router.push(qs ? `/catalogo?${qs}` : "/catalogo");
  };

  return (
    <div className="relative inline-flex items-center">
      <ArrowUpDown className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
      <select
        aria-label="Ordenar"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-full border border-input bg-card pl-9 pr-8 text-sm text-foreground outline-none transition-colors hover:border-primary/40 focus-visible:border-ring"
      >
        {OPCIONES.map((o) => (
          <option key={o.value} value={o.value}>
            {`Ordenar por: ${o.label}`}
          </option>
        ))}
      </select>
    </div>
  );
}
