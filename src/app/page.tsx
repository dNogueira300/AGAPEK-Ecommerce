import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Leaf, Quote, ShieldCheck, Star, Truck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/tienda/product-card";
import { toProductCard } from "@/lib/product-card";
import { getFavoritoIds } from "@/lib/favorito-actions";
import { BrandMarquee } from "@/components/tienda/brand-marquee";
import { HeroCarousel } from "@/components/tienda/hero-carousel";
import {
  getBannersActivos,
  getConfigValor,
  getMarcasTienda,
  getTestimoniosActivos,
} from "@/lib/cache";
import { ParallaxBg, Reveal, Stagger, StaggerItem } from "@/components/tienda/motion";

export const dynamic = "force-dynamic";

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: "Productos originales",
    text: "Marcas coreanas auténticas, seleccionadas con cuidado.",
  },
  {
    icon: Leaf,
    title: "Rutinas a tu medida",
    text: "Te ayudamos a armar tu rutina según tu tipo de piel.",
  },
  {
    icon: Truck,
    title: "Envíos a todo el Perú",
    text: "Delivery en Iquitos y envíos nacionales por courier.",
  },
];

export default async function HomePage() {
  const incluir = {
    marca: true,
    imagenes: { orderBy: { orden: "asc" as const }, take: 1 },
  };
  const [
    banners,
    destacados,
    nuevos,
    marcas,
    testimonios,
    whatsapp,
    bestRows,
    favIds,
    ctaImagen,
  ] = await Promise.all([
    getBannersActivos(),
    prisma.producto.findMany({
      where: { activo: true, destacado: true },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: incluir,
    }),
    prisma.producto.findMany({
      where: { activo: true, nuevo: true },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: incluir,
    }),
    getMarcasTienda(),
    getTestimoniosActivos(),
    getConfigValor("whatsapp"),
    prisma.pedidoItem.groupBy({
      by: ["productoId"],
      _sum: { cantidad: true },
      orderBy: { _sum: { cantidad: "desc" } },
      take: 8,
    }),
    getFavoritoIds(),
    getConfigValor("cta_home_imagen"),
  ]);

  // Más vendidos (por ventas reales); si faltan, se completa con destacados.
  const bestIds = bestRows.map((r) => r.productoId);
  const found = bestIds.length
    ? await prisma.producto.findMany({
        where: { id: { in: bestIds }, activo: true },
        include: incluir,
      })
    : [];
  const byId = new Map(found.map((p) => [p.id, p]));
  let masVendidosProd = bestIds
    .map((id) => byId.get(id))
    .filter((p): p is (typeof found)[number] => Boolean(p));
  if (masVendidosProd.length < 4) {
    const extra = destacados.filter((d) => !masVendidosProd.some((m) => m.id === d.id));
    masVendidosProd = [...masVendidosProd, ...extra].slice(0, 8);
  }

  const masVendidos = masVendidosProd.map((p) =>
    toProductCard(p, whatsapp, favIds.has(p.id)),
  );
  const nuevosCards = nuevos.map((p) => toProductCard(p, whatsapp, favIds.has(p.id)));

  return (
    <div>
      {/* Hero carousel */}
      {banners.length > 0 ? (
        <HeroCarousel banners={banners} />
      ) : (
        <section className="relative overflow-hidden">
          <div className="from-secondary via-background to-background absolute inset-0 -z-10 bg-gradient-to-b" />
          <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:py-24">
            <h1 className="font-display text-foreground text-4xl font-semibold tracking-tight sm:text-5xl">
              Lo mejor de Corea para tu piel,{" "}
              <span className="text-primary">con gentileza y amor</span>
            </h1>
            <Link
              href="/catalogo"
              className="bg-primary text-primary-foreground mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-sm"
            >
              Ver catálogo
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      )}

      {/* Benefits */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Stagger className="grid gap-4 sm:grid-cols-3" stagger={0.12}>
          {BENEFITS.map((b) => (
            <StaggerItem
              key={b.title}
              className="group border-border bg-card hover:border-primary/30 hover:shadow-primary/10 relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
            >
              <span
                aria-hidden
                className="bg-primary/5 pointer-events-none absolute -top-8 -right-8 size-24 rounded-full transition-transform duration-500 group-hover:scale-150"
              />
              <span className="from-primary/15 to-secondary text-primary relative flex size-12 items-center justify-center rounded-xl bg-gradient-to-br transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                <b.icon className="size-6" />
              </span>
              <h2 className="font-display text-foreground relative mt-4 text-lg font-semibold">
                {b.title}
              </h2>
              <p className="text-muted-foreground relative mt-1.5 text-sm leading-relaxed">
                {b.text}
              </p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Marcas */}
      <BrandMarquee marcas={marcas.map((m) => m.nombre)} />

      {/* Los más vendidos */}
      {masVendidos.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="font-display text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
              Los Más Vendidos
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Los favoritos de nuestras clientas en Iquitos.
            </p>
          </Reveal>
          <Stagger className="mt-10 grid grid-cols-2 gap-4 text-left sm:grid-cols-3 lg:grid-cols-4">
            {masVendidos.slice(0, 4).map((p) => (
              <StaggerItem key={p.slug}>
                <ProductCard p={p} />
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      )}

      {/* Lo nuevo */}
      {nuevosCards.length > 0 && (
        <section className="bg-secondary/40">
          <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
            <Reveal>
              <h2 className="font-display text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
                Lo Nuevo en AGAPEK
              </h2>
              <p className="text-muted-foreground mt-2 text-sm">
                Descubre los últimos productos coreanos que acaban de llegar.
              </p>
            </Reveal>
            <Stagger className="mt-10 grid grid-cols-2 gap-4 text-left sm:grid-cols-3 lg:grid-cols-4">
              {nuevosCards.slice(0, 4).map((p) => (
                <StaggerItem key={p.slug}>
                  <ProductCard p={p} />
                </StaggerItem>
              ))}
            </Stagger>
            <Link
              href="/catalogo"
              className="border-border bg-card text-foreground hover:bg-secondary mt-10 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors"
            >
              Ver catálogo completo
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="relative overflow-hidden">
        <ParallaxBg>
          <Image
            src={ctaImagen ?? "/banners/foto-2.webp"}
            alt=""
            fill
            sizes="100vw"
            quality={65}
            className="object-cover"
          />
        </ParallaxBg>
        <div className="absolute inset-0 bg-gradient-to-r from-[#7e2a52] via-[#c14d87]/90 to-[#e65d99]/70" />
        <Reveal className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:py-24">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Tu rutina ideal empieza con una buena guía
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/85 sm:text-base">
            Escríbenos y recibe asesoría personalizada por WhatsApp para armar tu rutina
            de skincare coreano.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#7e2a52] shadow-sm transition-transform hover:-translate-y-0.5 active:scale-[0.97]"
            >
              Explorar catálogo
              <ArrowRight className="size-4" />
            </Link>
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/50 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 active:scale-[0.97]"
              >
                Consultar por WhatsApp
              </a>
            )}
          </div>
        </Reveal>
      </section>

      {/* Testimonios */}
      {testimonios.length > 0 && (
        <section className="bg-card">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <Reveal>
              <h2 className="font-display text-foreground text-center text-3xl font-semibold tracking-tight sm:text-4xl">
                Lo que dice nuestra comunidad
              </h2>
            </Reveal>
            <Stagger className="mt-10 grid gap-5 md:grid-cols-3" stagger={0.1}>
              {testimonios.map((t) => (
                <StaggerItem key={t.id} className="h-full">
                  <figure className="border-border bg-background flex h-full flex-col rounded-2xl border p-6">
                    <Quote className="text-primary/40 size-6" />
                    <blockquote className="text-foreground/85 mt-3 flex-1 text-sm leading-relaxed">
                      {t.texto}
                    </blockquote>
                    <figcaption className="mt-4 flex items-center justify-between">
                      <span className="text-foreground text-sm font-semibold">
                        {t.nombre}
                      </span>
                      <span className="flex items-center gap-0.5">
                        {Array.from({ length: t.rating }).map((_, i) => (
                          <Star key={i} className="fill-primary text-primary size-3.5" />
                        ))}
                      </span>
                    </figcaption>
                  </figure>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      )}
    </div>
  );
}
