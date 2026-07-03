import Link from "next/link";
import { ArrowRight, Leaf, Quote, ShieldCheck, Sparkles, Star, Truck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductCard, type ProductCardData } from "@/components/tienda/product-card";
import { BrandMarquee } from "@/components/tienda/brand-marquee";

export const dynamic = "force-dynamic";

const BENEFITS = [
  { icon: ShieldCheck, title: "Productos originales", text: "Marcas coreanas auténticas, seleccionadas con cuidado." },
  { icon: Leaf, title: "Rutinas a tu medida", text: "Te ayudamos a armar tu rutina según tu tipo de piel." },
  { icon: Truck, title: "Envíos a todo el Perú", text: "Delivery en Iquitos y envíos nacionales por courier." },
];

export default async function HomePage() {
  const [destacados, marcas, testimonios] = await Promise.all([
    prisma.producto.findMany({
      where: { activo: true, destacado: true },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { marca: true, imagenes: { orderBy: { orden: "asc" }, take: 1 } },
    }),
    prisma.marca.findMany({ orderBy: { nombre: "asc" } }),
    prisma.testimonio.findMany({ where: { activo: true }, take: 6 }),
  ]);

  const cards: ProductCardData[] = destacados.map((p) => ({
    slug: p.slug,
    nombre: p.nombre,
    marca: p.marca.nombre,
    precio: Number(p.precio),
    precioOferta: p.precioOferta != null ? Number(p.precioOferta) : null,
    imagen: p.imagenes[0]?.url ?? "/productos/generico.svg",
    alt: p.imagenes[0]?.alt ?? p.nombre,
    nuevo: p.nuevo,
    agotado: p.stock <= 0,
    rating: 5,
  }));

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-secondary via-background to-background" />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24 lg:px-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
              <Sparkles className="size-3.5 text-primary" />
              K-Beauty · Skincare coreano
            </span>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Lo mejor de Corea para tu piel,{" "}
              <span className="text-primary">con gentileza y amor</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              Descubre productos originales, arma tu rutina de skincare y recibe
              asesoría personalizada por WhatsApp. Bloom &amp; Glow.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md"
              >
                Ver catálogo
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/rutinas"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                Arma tu rutina
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] w-full rounded-[2rem] border border-border bg-gradient-to-br from-card to-secondary shadow-sm" />
            <div className="absolute -bottom-4 -left-4 hidden rounded-2xl border border-border bg-card px-5 py-4 shadow-sm sm:block">
              <p className="font-display text-2xl font-semibold text-primary">+80</p>
              <p className="text-xs text-muted-foreground">productos coreanos</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-sm"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-primary">
                <b.icon className="size-5.5" />
              </span>
              <h2 className="mt-4 font-display text-lg font-semibold text-foreground">
                {b.title}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {b.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Marcas */}
      <BrandMarquee marcas={marcas.map((m) => m.nombre)} />

      {/* Destacados */}
      {cards.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Nuestros productos
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Los favoritos de la comunidad AGAPEK.
              </p>
            </div>
            <Link
              href="/catalogo"
              className="hidden shrink-0 items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary sm:inline-flex"
            >
              Ver catálogo completo
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {cards.map((p) => (
              <ProductCard key={p.slug} p={p} />
            ))}
          </div>
        </section>
      )}

      {/* Testimonios */}
      {testimonios.length > 0 && (
        <section className="bg-card">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <h2 className="text-center font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Lo que dice nuestra comunidad
            </h2>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {testimonios.map((t) => (
                <figure
                  key={t.id}
                  className="flex flex-col rounded-2xl border border-border bg-background p-6"
                >
                  <Quote className="size-6 text-primary/40" />
                  <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-foreground/85">
                    {t.texto}
                  </blockquote>
                  <figcaption className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">
                      {t.nombre}
                    </span>
                    <span className="flex items-center gap-0.5">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="size-3.5 fill-primary text-primary" />
                      ))}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
