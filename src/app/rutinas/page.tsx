import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Droplets, MessageCircle, Sparkles, Sun } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { urlWhatsApp } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Rutinas",
  description:
    "Aprende a armar tu rutina de skincare coreano paso a paso y recibe asesoría personalizada por WhatsApp.",
};
export const dynamic = "force-dynamic";

const PASOS = [
  { n: 1, titulo: "Limpieza", texto: "Limpia tu piel (doble limpieza en la noche: aceite + gel).", nec: "limpiar" },
  { n: 2, titulo: "Tónico", texto: "Equilibra el pH y prepara la piel para los siguientes pasos.", nec: "hidratar" },
  { n: 3, titulo: "Esencia", texto: "Hidratación ligera que potencia la absorción de los activos.", nec: "hidratar" },
  { n: 4, titulo: "Sérum / Tratamiento", texto: "Activos concentrados según tu objetivo (calmar, iluminar…).", nec: "iluminar" },
  { n: 5, titulo: "Hidratante", texto: "Sella la hidratación y refuerza la barrera de la piel.", nec: "hidratar" },
  { n: 6, titulo: "Protector solar", texto: "De día, siempre. El paso más importante para tu piel.", nec: "calmar" },
];

export default async function RutinasPage() {
  const cfg = await prisma.configuracion.findUnique({ where: { clave: "whatsapp" } });
  const whatsapp = typeof cfg?.valor === "string" ? cfg.valor : null;
  const waUrl = whatsapp
    ? urlWhatsApp(whatsapp, "¡Hola AGAPEK! 🌸 Quiero asesoría para armar mi rutina de skincare.")
    : null;

  return (
    <div>
      {/* Hero */}
      <section className="bg-secondary">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:py-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" />
            Rutina coreana
          </span>
          <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Arma tu rutina paso a paso
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            El skincare coreano se basa en la constancia. Empieza con lo esencial
            y suma productos según tu tipo de piel y tus objetivos.
          </p>
        </div>
      </section>

      {/* Pasos */}
      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {PASOS.map((p) => (
            <Link
              key={p.n}
              href={`/catalogo?nec=${p.nec}`}
              className="reveal group flex gap-4 rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-secondary font-display text-lg font-semibold text-primary transition-transform duration-300 group-hover:scale-110">
                {p.n}
              </span>
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground">{p.titulo}</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.texto}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Día / Noche */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="reveal flex items-center gap-3 rounded-2xl border border-border bg-card p-5">
            <Sun className="size-6 text-amber-400" />
            <p className="text-sm text-foreground/80">
              <span className="font-semibold text-foreground">De día:</span> termina siempre con protector solar.
            </p>
          </div>
          <div className="reveal flex items-center gap-3 rounded-2xl border border-border bg-card p-5">
            <Droplets className="size-6 text-primary" />
            <p className="text-sm text-foreground/80">
              <span className="font-semibold text-foreground">De noche:</span> doble limpieza y trata tu piel a fondo.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 pb-16 text-center sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border bg-secondary/50 p-10">
          <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
            ¿No sabes por dónde empezar?
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
            Cuéntanos tu tipo de piel y te ayudamos a armar la rutina ideal para ti.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5"
              >
                <MessageCircle className="size-4" />
                Asesoría por WhatsApp
              </a>
            )}
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              Ver catálogo
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
