import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "AGAPEK nació para llevar el skincare coreano a Iquitos, con productos originales y asesoría personalizada.",
};

const VALORES = [
  {
    icon: Heart,
    title: "Nuestra misión",
    text: "Acercar el skincare coreano a Iquitos y al Perú, ofreciendo productos originales con asesoría personalizada para que cada persona encuentre su rutina ideal. Queremos que el cuidado de la piel sea accesible, amoroso y transformador.",
  },
  {
    icon: Sparkles,
    title: "Nuestra visión",
    text: "Ser la tienda de referencia de K-Beauty en la Amazonía peruana, reconocida por nuestra calidad, calidez humana y compromiso con la belleza natural de cada persona que confía en nosotros.",
  },
];

export default function NosotrosPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-secondary">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:py-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" />
            Bloom &amp; Glow
          </span>
          <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Nuestra Historia
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Nacimos con el sueño de llevar el skincare coreano a Iquitos. Un
            proyecto de amor para las pieles loretanas.
          </p>
        </div>
      </section>

      {/* Imagen + relato */}
      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-border bg-secondary">
          <Image
            src="/banners/foto-3.webp"
            alt="Productos AGAPEK"
            fill
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover"
          />
        </div>
        <div className="mx-auto mt-10 max-w-2xl text-center">
          <p className="text-base leading-relaxed text-muted-foreground">
            AGAPEK es una tienda virtual de skincare coreano. Ponemos al alcance
            de las pieles loretanas lo mejor de Corea del Sur para cuidar tu piel
            con gentileza y amor. Seleccionamos productos originales y te
            acompañamos con asesoría personalizada por WhatsApp para que armes la
            rutina perfecta para ti.
          </p>
        </div>
      </section>

      {/* Misión / Visión */}
      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2">
          {VALORES.map((v) => (
            <div key={v.title} className="rounded-2xl border border-border bg-card p-7">
              <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-primary">
                <v.icon className="size-5.5" />
              </span>
              <h2 className="mt-4 font-display text-xl font-semibold text-foreground">
                {v.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {v.text}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5"
          >
            Descubre nuestros productos
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
