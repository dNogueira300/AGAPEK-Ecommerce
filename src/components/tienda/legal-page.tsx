export interface Seccion {
  titulo: string;
  parrafos: string[];
}

export function LegalPage({
  title,
  actualizado,
  intro,
  secciones,
}: {
  title: string;
  actualizado: string;
  intro?: string;
  secciones: Seccion[];
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h1>
      <p className="mt-2 text-xs text-muted-foreground">Última actualización: {actualizado}</p>
      {intro && (
        <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{intro}</p>
      )}
      <div className="mt-8 space-y-8">
        {secciones.map((s, i) => (
          <section key={s.titulo}>
            <h2 className="font-display text-lg font-semibold text-foreground">
              {i + 1}. {s.titulo}
            </h2>
            <div className="mt-2 space-y-3 text-sm leading-relaxed text-muted-foreground">
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
