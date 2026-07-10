import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { getMarcasTienda } from "@/lib/cache";
import { Stagger, StaggerItem } from "@/components/tienda/motion";

export const metadata: Metadata = {
  title: "Marcas",
  description:
    "Conoce las marcas coreanas originales de skincare que encuentras en AGAPEK.",
};

export const dynamic = "force-dynamic";

export default async function MarcasPage() {
  const marcas = await getMarcasTienda();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-foreground text-4xl font-semibold tracking-tight sm:text-5xl">
          Marcas coreanas originales
        </h1>
        <p className="text-muted-foreground mx-auto mt-3 max-w-xl text-sm leading-relaxed">
          Seleccionamos con cuidado marcas auténticas de K-Beauty para que cuides tu piel
          con lo mejor de Corea.
        </p>
      </header>

      {marcas.length === 0 ? (
        <p className="border-border bg-card text-muted-foreground mt-10 rounded-2xl border border-dashed p-10 text-center">
          Pronto publicaremos nuestras marcas.
        </p>
      ) : (
        <Stagger className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {marcas.map((m) => (
            <StaggerItem key={m.id} className="h-full">
              <Link
                href={`/catalogo?marca=${encodeURIComponent(m.slug)}`}
                className="group border-border bg-card hover:border-primary/30 hover:shadow-primary/10 flex h-full flex-col items-center justify-center gap-3 rounded-2xl border p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                {m.logoUrl ? (
                  <span className="relative block h-16 w-32">
                    <Image
                      src={m.logoUrl}
                      alt={`Logo de ${m.nombre}`}
                      fill
                      sizes="128px"
                      className="object-contain"
                    />
                  </span>
                ) : (
                  <span className="bg-secondary text-primary flex size-16 items-center justify-center rounded-full">
                    <Sparkles className="size-7" />
                  </span>
                )}
                <span className="font-display text-foreground text-lg font-semibold">
                  {m.nombre}
                </span>
                <span className="text-primary inline-flex items-center gap-1 text-xs font-semibold opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  Ver productos <ArrowRight className="size-3.5" />
                </span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
}
