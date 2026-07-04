import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Leaf, Quote, ShieldCheck, Star, Truck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/tienda/product-card";
import { toProductCard } from "@/lib/product-card";
import { BrandMarquee } from "@/components/tienda/brand-marquee";
import { HeroCarousel } from "@/components/tienda/hero-carousel";

export const dynamic = "force-dynamic";

const BENEFITS = [
  { icon: ShieldCheck, title: "Productos originales", text: "Marcas coreanas auténticas, seleccionadas con cuidado." },
  { icon: Leaf, title: "Rutinas a tu medida", text: "Te ayudamos a armar tu rutina según tu tipo de piel." },
  { icon: Truck, title: "Envíos a todo el Perú", text: "Delivery en Iquitos y envíos nacionales por courier." },
];

export default async function HomePage() {
  const incluir = {
    marca: true,
    imagenes: { orderBy: { orden: "asc" as const }, take: 1 },
  };
  const [banners, destacados, nuevos, marcas, testimonios, cfg, bestRows] =
    await Promise.all([
      prisma.banner.findMany({ where: { activo: true }, orderBy: { orden: "asc" } }),
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
      prisma.marca.findMany({ orderBy: { nombre: "asc" } }),
      prisma.testimonio.findMany({ where: { activo: true }, take: 6 }),
      prisma.configuracion.findUnique({ where: { clave: "whatsapp" } }),
      prisma.pedidoItem.groupBy({
        by: ["productoId"],
        _sum: { cantidad: true },
        orderBy: { _sum: { cantidad: "desc" } },
        take: 8,
      }),
    ]);
  const whatsapp = typeof cfg?.valor === "string" ? cfg.valor : null;

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
    const extra = destacados.filter(
      (d) => !masVendidosProd.some((m) => m.id === d.id),
    );
    masVendidosProd = [...masVendidosProd, ...extra].slice(0, 8);
  }

  const masVendidos = masVendidosProd.map((p) => toProductCard(p, whatsapp));
  const nuevosCards = nuevos.map((p) => toProductCard(p, whatsapp));

  return (
    <div>
      {/* Hero carousel */}
      {banners.length > 0 ? (
        <HeroCarousel banners={banners} />
      ) : (
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-secondary via-background to-background" />
          <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:py-24">
            <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Lo mejor de Corea para tu piel,{" "}
              <span className="text-primary">con gentileza y amor</span>
            </h1>
            <Link
              href="/catalogo"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm"
            >
              Ver catálogo
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      )}

      {/* Benefits */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
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

      {/* Los más vendidos */}
      {masVendidos.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Los Más Vendidos
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Los favoritos de nuestras clientas en Iquitos.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4 text-left sm:grid-cols-3 lg:grid-cols-4">
            {masVendidos.slice(0, 4).map((p) => (
              <ProductCard key={p.slug} p={p} />
            ))}
          </div>
        </section>
      )}

      {/* Lo nuevo */}
      {nuevosCards.length > 0 && (
        <section className="bg-secondary/40">
          <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Lo Nuevo en AGAPEK
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Descubre los últimos productos coreanos que acaban de llegar.
            </p>
            <div className="mt-10 grid grid-cols-2 gap-4 text-left sm:grid-cols-3 lg:grid-cols-4">
              {nuevosCards.slice(0, 4).map((p) => (
                <ProductCard key={p.slug} p={p} />
              ))}
            </div>
            <Link
              href="/catalogo"
              className="mt-10 inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              Ver catálogo completo
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="relative overflow-hidden">
        <Image
          src="/banners/foto-2.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#7e2a52] via-[#c14d87]/90 to-[#e65d99]/70" />
        <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:py-24">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Tu rutina ideal empieza con una buena guía
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/85 sm:text-base">
            Escríbenos y recibe asesoría personalizada por WhatsApp para armar tu
            rutina de skincare coreano.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#7e2a52] shadow-sm transition-transform hover:-translate-y-0.5"
            >
              Explorar catálogo
              <ArrowRight className="size-4" />
            </Link>
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/50 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Consultar por WhatsApp
              </a>
            )}
          </div>
        </div>
      </section>

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
