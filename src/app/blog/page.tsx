import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatFechaCorta } from "@/lib/date";
import { getRedesSociales } from "@/lib/config";
import { getMarcasAliadas } from "@/lib/cache";
import { SocialLinks } from "@/components/tienda/social-links";
import { Stagger, StaggerItem } from "@/components/tienda/motion";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog de Skincare",
  description: "Consejos de expertas y secretos del K-Beauty para cuidar tu piel.",
};
export const dynamic = "force-dynamic";

function Meta({ autor, fecha }: { autor: string | null; fecha: Date }) {
  return (
    <p className="text-muted-foreground text-xs">
      {autor && <span className="text-foreground/70 font-medium">Por {autor}</span>}
      {autor && " · "}
      {formatFechaCorta(fecha)}
    </p>
  );
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const { c } = await searchParams;

  const [posts, todas, marcas, redes] = await Promise.all([
    prisma.post.findMany({
      where: { publicado: true, ...(c ? { categoria: c } : {}) },
      orderBy: { createdAt: "desc" },
    }),
    prisma.post.findMany({
      where: { publicado: true },
      select: { categoria: true },
      distinct: ["categoria"],
    }),
    getMarcasAliadas(),
    getRedesSociales(),
  ]);
  const hayRedes = !!(redes.facebook || redes.instagram || redes.tiktok);

  const categorias = todas.map((p) => p.categoria).filter((x): x is string => !!x);
  const destacado = !c ? posts[0] : undefined;
  const resto = destacado ? posts.slice(1) : posts;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="text-center">
        <p className="text-primary text-xs font-semibold tracking-[0.25em] uppercase">
          The AGAPEK Journal
        </p>
        <h1 className="font-display text-foreground mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
          Blog de Skincare
        </h1>
        <p className="text-muted-foreground mx-auto mt-3 max-w-xl text-sm leading-relaxed">
          Aprende a cuidar tu piel con consejos de expertas y descubre los secretos del
          K-Beauty.
        </p>
      </header>

      {/* Categorías */}
      <nav className="mt-8 flex flex-wrap justify-center gap-2">
        <Link
          href="/blog"
          className={cn(
            "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
            !c
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-foreground/80 hover:bg-secondary",
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
              c === cat
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground/80 hover:bg-secondary",
            )}
          >
            {cat}
          </Link>
        ))}
      </nav>

      {posts.length === 0 ? (
        <p className="border-border bg-card text-muted-foreground mt-10 rounded-2xl border border-dashed p-10 text-center">
          Pronto publicaremos nuevos artículos.
        </p>
      ) : (
        <div className="mt-10 space-y-12">
          {/* Destacado (card superpuesta) */}
          {destacado && (
            <article className="relative">
              <Link href={`/blog/${destacado.slug}`} className="group block">
                <div className="relative aspect-[16/10] overflow-hidden rounded-3xl md:aspect-[21/9]">
                  <Image
                    src={destacado.portadaUrl ?? "/productos/generico.svg"}
                    alt={destacado.titulo}
                    fill
                    sizes="100vw"
                    priority
                    fetchPriority="high"
                    quality={65}
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="border-border bg-card relative z-10 mx-4 -mt-16 rounded-3xl border p-7 shadow-xl sm:mx-8 md:absolute md:top-1/2 md:right-10 md:mx-0 md:mt-0 md:max-w-md md:-translate-y-1/2">
                  {destacado.categoria && (
                    <span className="text-primary text-xs font-semibold tracking-wide uppercase">
                      {destacado.categoria}
                    </span>
                  )}
                  <h2 className="font-display text-foreground mt-2 text-2xl leading-tight font-semibold sm:text-3xl">
                    {destacado.titulo}
                  </h2>
                  <div className="mt-2">
                    <Meta autor={destacado.autor} fecha={destacado.createdAt} />
                  </div>
                  <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                    {destacado.resumen}
                  </p>
                  <span className="text-primary mt-4 inline-flex items-center gap-1.5 text-sm font-semibold">
                    Continuar{" "}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </article>
          )}

          {/* Grid */}
          {resto.length > 0 && (
            <Stagger className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {resto.map((post) => (
                <StaggerItem key={post.id}>
                  <article>
                    <Link href={`/blog/${post.slug}`} className="group block">
                      <div className="relative aspect-[16/11] overflow-hidden rounded-2xl">
                        <Image
                          src={post.portadaUrl ?? "/productos/generico.svg"}
                          alt={post.titulo}
                          fill
                          sizes="(max-width: 640px) 100vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="mt-4">
                        {post.categoria && (
                          <span className="text-primary text-xs font-semibold tracking-wide uppercase">
                            {post.categoria}
                          </span>
                        )}
                        <h3 className="font-display text-foreground group-hover:text-primary mt-1.5 text-lg leading-snug font-semibold transition-colors">
                          {post.titulo}
                        </h3>
                        <div className="mt-2">
                          <Meta autor={post.autor} fecha={post.createdAt} />
                        </div>
                      </div>
                    </Link>
                  </article>
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </div>
      )}

      {/* Marcas destacadas */}
      {marcas.length > 0 && (
        <section className="border-border mt-16 border-t pt-12">
          <h2 className="font-display text-foreground text-center text-2xl font-semibold tracking-tight sm:text-3xl">
            Marcas destacadas
          </h2>
          <p className="text-muted-foreground mt-2 text-center text-sm">
            Las marcas coreanas originales que encuentras en AGAPEK.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {marcas.map((m) => (
              <Link
                key={m.id}
                href={`/catalogo?marca=${m.slug}`}
                className="border-border bg-card font-display text-foreground/80 hover:border-primary/30 hover:text-primary flex items-center justify-center rounded-2xl border p-6 text-center text-base font-semibold shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                {m.nombre}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Redes sociales */}
      {hayRedes && (
        <section className="border-border bg-secondary/50 mt-16 rounded-3xl border p-10 text-center">
          <h2 className="font-display text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
            Síguenos en redes
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Tips, novedades y rutinas todos los días.
          </p>
          <SocialLinks
            redes={redes}
            className="mt-6 justify-center"
            itemClassName="size-12"
          />
        </section>
      )}
    </div>
  );
}
