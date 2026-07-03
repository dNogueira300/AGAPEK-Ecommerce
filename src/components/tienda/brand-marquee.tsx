export function BrandMarquee({ marcas }: { marcas: string[] }) {
  if (marcas.length === 0) return null;
  // Se duplica la lista para un loop continuo sin cortes.
  const items = [...marcas, ...marcas];

  return (
    <section
      aria-label="Marcas coreanas originales"
      className="border-y border-border bg-card py-6"
    >
      <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
        Marcas coreanas originales
      </p>
      <div className="group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="flex w-max animate-marquee items-center gap-12 group-hover:[animation-play-state:paused]">
          {items.map((m, i) => (
            <span
              key={`${m}-${i}`}
              className="font-display text-xl font-semibold tracking-wide text-foreground/70"
            >
              {m}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
