import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Moon, Sparkles, Sun, SunMoon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { urlWhatsApp } from "@/lib/whatsapp";
import { toProductCard } from "@/lib/product-card";
import { getFavoritoIds } from "@/lib/favorito-actions";
import { ProductCard } from "@/components/tienda/product-card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Rutinas",
  description:
    "Rutinas de skincare coreano curadas por tipo de piel, paso a paso, con los productos ideales para ti.",
};
export const dynamic = "force-dynamic";

const PIELES = [
  { value: "", label: "Todas" },
  { value: "grasa", label: "Grasa" },
  { value: "seca", label: "Seca" },
  { value: "mixta", label: "Mixta" },
  { value: "sensible", label: "Sensible" },
  { value: "normal", label: "Normal" },
];

const PIEL_LABEL: Record<string, string> = {
  todas: "Todos los tipos de piel",
  grasa: "Piel grasa",
  seca: "Piel seca",
  mixta: "Piel mixta",
  sensible: "Piel sensible",
  normal: "Piel normal",
};

const MOMENTO = {
  DIA: { label: "Día", icon: Sun },
  NOCHE: { label: "Noche", icon: Moon },
  AMBOS: { label: "Día y noche", icon: SunMoon },
} as const;

export default async function RutinasPage({
  searchParams,
}: {
  searchParams: Promise<{ piel?: string }>;
}) {
  const { piel = "" } = await searchParams;
  const pielValida = PIELES.some((p) => p.value === piel) ? piel : "";

  const [rutinas, cfg, favIds] = await Promise.all([
    prisma.rutina.findMany({
      where: {
        publicado: true,
        ...(pielValida ? { tipoPiel: { in: [pielValida, "todas"] } } : {}),
      },
      orderBy: [{ orden: "asc" }, { createdAt: "desc" }],
      include: {
        pasos: {
          orderBy: { orden: "asc" },
          include: {
            productos: {
              where: { activo: true },
              include: { marca: true, imagenes: { orderBy: { orden: "asc" }, take: 1 } },
            },
          },
        },
      },
    }),
    prisma.configuracion.findUnique({ where: { clave: "whatsapp" } }),
    getFavoritoIds(),
  ]);

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
            Encuentra tu rutina ideal
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Elige tu tipo de piel y sigue una rutina paso a paso con los productos
            que mejor funcionan para ti.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Selector de tipo de piel */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {PIELES.map((p) => (
            <Link
              key={p.value}
              href={p.value ? `/rutinas?piel=${p.value}` : "/rutinas"}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                pielValida === p.value
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-card text-foreground/80 hover:bg-secondary",
              )}
            >
              {p.label}
            </Link>
          ))}
        </div>

        {rutinas.length === 0 ? (
          <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/30 px-6 py-16 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-background text-primary shadow-sm">
              <Sparkles className="size-7" />
            </span>
            <h2 className="mt-4 font-display text-lg font-semibold text-foreground">
              Aún no hay rutinas para este tipo de piel
            </h2>
            <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
              Escríbenos por WhatsApp y te ayudamos a armar la rutina perfecta según tu piel.
            </p>
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5"
              >
                <MessageCircle className="size-4.5" />
                Pedir asesoría
              </a>
            )}
          </div>
        ) : (
          <div className="mt-12 space-y-16">
            {rutinas.map((rutina) => (
              <article key={rutina.id}>
                <header className="overflow-hidden rounded-2xl border border-border bg-card">
                  {rutina.portadaUrl && (
                    <span className="relative block h-40 w-full bg-secondary sm:h-52">
                      <Image src={rutina.portadaUrl} alt={rutina.titulo} fill sizes="1152px" unoptimized={rutina.portadaUrl.endsWith(".svg")} className="object-cover" />
                    </span>
                  )}
                  <div className="p-6">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-primary">
                      {PIEL_LABEL[rutina.tipoPiel] ?? rutina.tipoPiel}
                    </span>
                    <h2 className="mt-3 font-display text-2xl font-semibold text-foreground">{rutina.titulo}</h2>
                    {rutina.descripcion && (
                      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{rutina.descripcion}</p>
                    )}
                  </div>
                </header>

                <div className="mt-6 space-y-8">
                  {rutina.pasos.map((paso, i) => {
                    const M = MOMENTO[paso.momento];
                    const cards = paso.productos.map((p) => toProductCard(p, whatsapp, favIds.has(p.id)));
                    return (
                      <div key={paso.id}>
                        <div className="flex items-start gap-3">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-secondary font-display text-base font-semibold text-primary">
                            {i + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-display text-lg font-semibold text-foreground">{paso.titulo}</h3>
                              <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                                <M.icon className="size-3.5" />
                                {M.label}
                              </span>
                            </div>
                            {paso.descripcion && (
                              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{paso.descripcion}</p>
                            )}
                          </div>
                        </div>

                        {cards.length > 0 && (
                          <div className="mt-4 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4 lg:pl-12">
                            {cards.map((c) => (
                              <ProductCard key={c.id} p={c} />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        )}

        {/* CTA asesoría */}
        {waUrl && rutinas.length > 0 && (
          <div className="mt-16 flex flex-col items-center gap-3 rounded-2xl border border-border bg-secondary/50 p-8 text-center">
            <p className="text-sm text-muted-foreground">¿Dudas sobre qué rutina seguir?</p>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5"
            >
              <MessageCircle className="size-4.5" />
              Pide asesoría personalizada
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
