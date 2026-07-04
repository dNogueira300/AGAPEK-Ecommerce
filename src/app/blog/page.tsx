import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatFechaCorta } from "@/lib/date";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog de Skincare",
  description: "Consejos de expertas y secretos del K-Beauty para cuidar tu piel.",
};
export const dynamic = "force-dynamic";

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const { c } = await searchParams;

  const [posts, todas] = await Promise.all([
    prisma.post.findMany({
      where: { publicado: true, ...(c ? { categoria: c } : {}) },
      orderBy: { createdAt: "desc" },
    }),
    prisma.post.findMany({
      where: { publicado: true },
      select: { categoria: true },
      distinct: ["categoria"],
    }),
  ]);

  const categorias = todas.map((p) => p.categoria).filter((x): x is string => !!x);
  const destacado = !c ? posts[0] : undefined;
  const resto = destacado ? posts.slice(1) : posts;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="text-center">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Blog de Skincare
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Aprende a cuidar tu piel con consejos de expertas y descubre los secretos del K-Beauty.
        </p>
      </header>

      {/* Filtros por categoría */}
      <nav className="mt-8 flex flex-wrap justify-center gap-2">
        <Link
          href="/blog"
          className={cn(
            "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
            !c ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground/80 hover:bg-secondary",
          )}
        >
          Todos
        </Link>
        {categorias.map((cat) => (
          <Link
            key={cat}
            href={`/blog?c=${encodeURIComponent(cat)}`}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              c === cat ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground/80 hover:bg-secondary",
            )}
          >
            {cat}
          </Link>
        ))}
      </nav>

      {posts.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
          Pronto publicaremos nuevos artículos.
        </p>
      ) : (
        <div className="mt-10 space-y-8">
          {/* Destacado */}
          {destacado && (
            <Link
              href={`/blog/${destacado.slug}`}
              className="group grid overflow-hidden rounded-3xl border border-border bg-card md:grid-cols-2"
            >
              <div className="relative aspect-[16/10] md:aspect-auto">
                <Image
                  src={destacado.portadaUrl ?? "/productos/generico.svg"}
                  alt={destacado.titulo}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col justify-center p-8">
                {destacado.categoria && (
                  <span className="w-fit rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                    {destacado.categoria}
                  </span>
                )}
                <h2 className="mt-3 font-display text-2xl font-semibold text-foreground">
                  {destacado.titulo}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {destacado.resumen}
                </p>
                <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="size-3.5" />
                    {formatFechaCorta(destacado.createdAt)}
                  </span>
                </div>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  Leer más <ArrowRight className="size-4" />
                </span>
              </div>
            </Link>
          )}

          {/* Grid */}
          {resto.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {resto.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={post.portadaUrl ?? "/productos/generico.svg"}
                      alt={post.titulo}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    {post.categoria && (
                      <span className="w-fit rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
                        {post.categoria}
                      </span>
                    )}
                    <h3 className="mt-2 font-display text-lg font-semibold text-foreground">
                      {post.titulo}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {post.resumen}
                    </p>
                    <span className="mt-3 text-xs text-muted-foreground">
                      {formatFechaCorta(post.createdAt)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
