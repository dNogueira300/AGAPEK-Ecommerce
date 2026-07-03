"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HeroBanner {
  id: string;
  titulo: string | null;
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

  useEffect(() => {
    if (count <= 1) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    timer.current = setInterval(() => setIndex((i) => (i + 1) % count), 5000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [count]);

  if (count === 0) return null;

  const Slide = ({ b }: { b: HeroBanner }) => {
    const img = (
      <Image
        src={b.imagenUrl}
        alt={b.titulo ?? "Banner AGAPEK"}
        fill
        priority
        sizes="100vw"
        unoptimized={b.imagenUrl.endsWith(".svg")}
        className="object-cover"
      />
    );
    return b.enlace ? (
      <Link href={b.enlace} className="block size-full">
        {img}
      </Link>
    ) : (
      img
    );
  };

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Promociones AGAPEK"
      className="group relative aspect-[16/10] w-full overflow-hidden sm:aspect-[3/1]"
      onMouseEnter={() => timer.current && clearInterval(timer.current)}
    >
      <div
        className="flex h-full transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {banners.map((b) => (
          <div key={b.id} className="relative h-full w-full shrink-0">
            <Slide b={b} />
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

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {banners.map((b, i) => (
              <button
                key={b.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Ir al banner ${i + 1}`}
                aria-current={i === index}
                className={cn(
                  "h-2 rounded-full bg-foreground/30 transition-all",
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
