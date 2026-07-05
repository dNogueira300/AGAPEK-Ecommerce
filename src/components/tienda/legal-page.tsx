export interface Seccion {
  titulo: string;
  parrafos: string[];
}

export function LegalPage({
  title,
  actualizado,
  intro,
  secciones,
  eyebrow = "Legal",
}: {
  title: string;
  actualizado: string;
  intro?: string;
  secciones: Seccion[];
  eyebrow?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="border-b border-border pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-xs text-muted-foreground">Última actualización: {actualizado}</p>
        {intro && (
          <p className="mt-5 text-sm leading-relaxed text-foreground/80">{intro}</p>
        )}
      </header>
      <div className="mt-8 space-y-8">
        {secciones.map((s, i) => (
          <section key={s.titulo} className="scroll-mt-24">
            <h2 className="font-display text-lg font-semibold text-foreground">
              {i + 1}. {s.titulo}
            </h2>
            <div className="mt-2 space-y-3 text-sm leading-relaxed text-foreground/80">
              {s.parrafos.map((p, j) => (
                <p key={j}>{p}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
