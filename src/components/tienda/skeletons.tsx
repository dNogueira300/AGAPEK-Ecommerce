import { cn } from "@/lib/utils";

/* Bloques de carga (server-safe). El shimmer usa animate-pulse de Tailwind,
   que ya respeta prefers-reduced-motion vía la media query global. */

export function Sk({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-secondary animate-pulse rounded-lg motion-reduce:animate-none",
        className,
      )}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="border-border bg-card flex flex-col overflow-hidden rounded-2xl border shadow-sm">
      <Sk className="aspect-square rounded-none" />
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <Sk className="h-3 w-16" />
        <Sk className="h-4 w-4/5" />
        <Sk className="h-3.5 w-24" />
        <Sk className="h-5 w-20" />
        <Sk className="mt-1 h-10 w-full rounded-full" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-2 gap-4 md:grid-cols-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
