"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HeroBanner {
  id: string;
  titulo: string | null;
  subtitulo: string | null;
  cta: string | null;
  imagenUrl: string;
  enlace: string | null;
}

export function HeroCarousel({ banners }: { banners: HeroBanner[] }) {
  const [index, setIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const count = banners.length;

  const goTo = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);
  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  const stop = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
  }, []);
  const start = useCallback(() => {
    if (count <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    stop();
    timer.current = setInterval(() => setIndex((i) => (i + 1) % count), 6000);
  }, [count, stop]);

  useEffect(() => {
    start();
    return stop;
  }, [start, stop]);

  if (count === 0) return null;

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Promociones AGAPEK"
      className="group relative h-[560px] w-full overflow-hidden sm:h-[600px]"
      onMouseEnter={stop}
      onMouseLeave={start}
    >
      <div
        className="flex h-full transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {banners.map((b) => (
          <div key={b.id} className="relative h-full w-full shrink-0">
            <Image
              src={b.imagenUrl}
              alt={b.titulo ?? "AGAPEK"}
              fill
              priority
              sizes="100vw"
              unoptimized={b.imagenUrl.endsWith(".svg")}
              className="object-cover"
            />
            {/* Degradado para legibilidad del texto (izquierda) */}
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent sm:via-background/60" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent sm:hidden" />

            {/* Contenido */}
            <div className="relative mx-auto flex h-full max-w-7xl items-center px-5 sm:px-6 lg:px-8">
              <div className="max-w-xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-3.5 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur">
                  <Sparkles className="size-3.5 text-primary" />
                  K-Beauty · Skincare coreano
                </span>
                <h1 className="mt-4 font-display text-3xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {b.titulo}
                </h1>
                {b.subtitulo && (
                  <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {b.subtitulo}
                  </p>
                )}
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Link
                    href={b.enlace ?? "/catalogo"}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md"
                  >
                    {b.cta ?? "Ver catálogo"}
                    <ArrowRight className="size-4" />
                  </Link>
                  <Link
                    href="/rutinas"
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-6 py-3 text-sm font-semibold text-foreground backdrop-blur transition-colors hover:bg-card"
                  >
                    Ver rutinas
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Anterior"
            className="absolute left-3 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-card/80 text-foreground shadow-sm backdrop-blur transition hover:bg-card sm:flex"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Siguiente"
            className="absolute right-3 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-card/80 text-foreground shadow-sm backdrop-blur transition hover:bg-card sm:flex"
          >
            <ChevronRight className="size-5" />
          </button>

          <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
            {banners.map((b, i) => (
              <button
                key={b.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Ir al banner ${i + 1}`}
                aria-current={i === index}
                className={cn(
                  "h-2 rounded-full bg-foreground/25 transition-all",
                  i === index ? "w-6 bg-primary" : "w-2 hover:bg-foreground/50",
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
