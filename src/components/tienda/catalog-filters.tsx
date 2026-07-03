import Link from "next/link";
import { cn } from "@/lib/utils";

export const FILTROS_NECESIDAD = [
  { value: "todos", label: "Ver todos" },
  { value: "calmar", label: "Calmar piel" },
  { value: "hidratar", label: "Hidratar" },
  { value: "iluminar", label: "Iluminar" },
  { value: "limpiar", label: "Limpiar" },
] as const;

export function CatalogFilters({ active }: { active: string }) {
  return (
    <nav aria-label="Filtrar por necesidad" className="flex flex-wrap gap-2">
      {FILTROS_NECESIDAD.map((f) => {
        const isActive = f.value === active;
        const href = f.value === "todos" ? "/catalogo" : `/catalogo?n=${f.value}`;
        return (
          <Link
            key={f.value}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-card text-foreground/80 hover:border-primary/40 hover:bg-secondary",
            )}
          >
            {f.label}
          </Link>
        );
      })}
    </nav>
  );
}
