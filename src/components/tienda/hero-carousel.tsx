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

  const goTo = useCallback(
    (i: number) => setIndex(((i % count) + count) % count),
    [count],
  );
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
      className="group relative h-[calc(100svh-4rem)] min-h-[560px] w-full overflow-hidden"
      onMouseEnter={stop}
      onMouseLeave={start}
    >
      <div
        className="flex h-full transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {banners.map((b, i) => {
          const active = i === index;
          // Entrada en cascada del contenido del slide activo (fade + rise).
          const enter = (delayMs: number) => ({
            className: cn(
              "transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:transform-none",
              active ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0",
            ),
            style: { transitionDelay: active ? `${delayMs}ms` : "0ms" },
          });
          return (
            <div key={b.id} className="relative h-full w-full shrink-0 overflow-hidden">
              <Image
                src={b.imagenUrl}
                alt={b.titulo ?? "AGAPEK"}
                fill
                priority={i === 0}
                fetchPriority={i === 0 ? "high" : undefined}
                quality={65}
                sizes="100vw"
                unoptimized={b.imagenUrl.endsWith(".svg")}
                className={cn("object-cover", active && "animate-kenburns")}
              />
              {/* Degradado para legibilidad del texto (izquierda) */}
              <div className="from-background via-background/80 sm:via-background/60 absolute inset-0 bg-gradient-to-r to-transparent" />
              <div className="from-background/70 absolute inset-0 bg-gradient-to-t via-transparent to-transparent sm:hidden" />

              {/* Contenido */}
              <div className="relative mx-auto flex h-full max-w-7xl items-center px-5 sm:px-6 lg:px-8">
                <div className="max-w-xl">
                  <span
                    style={enter(150).style}
                    className={cn(
                      "border-border/60 bg-card/70 text-foreground/80 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium backdrop-blur",
                      enter(150).className,
                    )}
                  >
                    <Sparkles className="text-primary size-3.5" />
                    K-Beauty · Skincare coreano
                  </span>
                  <h1
                    style={enter(280).style}
                    className={cn(
                      "font-display text-foreground mt-4 text-3xl leading-[1.1] font-semibold tracking-tight sm:text-4xl lg:text-5xl",
                      enter(280).className,
                    )}
                  >
                    {b.titulo}
                  </h1>
                  {b.subtitulo && (
                    <p
                      style={enter(400).style}
                      className={cn(
                        "text-muted-foreground mt-4 max-w-md text-sm leading-relaxed sm:text-base",
                        enter(400).className,
                      )}
                    >
                      {b.subtitulo}
                    </p>
                  )}
                  <div
                    style={enter(520).style}
                    className={cn(
                      "mt-7 flex flex-wrap items-center gap-3",
                      enter(520).className,
                    )}
                  >
                    <Link
                      href={b.enlace ?? "/catalogo"}
                      tabIndex={active ? undefined : -1}
                      className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md active:scale-[0.97]"
                    >
                      {b.cta ?? "Ver catálogo"}
                      <ArrowRight className="size-4" />
                    </Link>
                    <Link
                      href="/rutinas"
                      tabIndex={active ? undefined : -1}
                      className="border-border bg-card/80 text-foreground hover:bg-card inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold backdrop-blur transition-colors active:scale-[0.97]"
                    >
                      Ver rutinas
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Anterior"
            className="bg-card/80 text-foreground hover:bg-card absolute top-1/2 left-3 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full shadow-sm backdrop-blur transition sm:flex"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Siguiente"
            className="bg-card/80 text-foreground hover:bg-card absolute top-1/2 right-3 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full shadow-sm backdrop-blur transition sm:flex"
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
                  "bg-foreground/25 h-2 rounded-full transition-all",
                  i === index ? "bg-primary w-6" : "hover:bg-foreground/50 w-2",
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
