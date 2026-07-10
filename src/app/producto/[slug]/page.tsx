import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Leaf, MessageCircle, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getConfigValor } from "@/lib/cache";
import { urlWhatsApp } from "@/lib/whatsapp";
import { AddToCartFull } from "@/components/tienda/add-to-cart-button";
import { FavoriteWideButton } from "@/components/tienda/favorite-button";
import { getFavoritoIds } from "@/lib/favorito-actions";

export const dynamic = "force-dynamic";

const soles = (n: number) => `S/ ${n.toFixed(2)}`;

async function getProducto(slug: string) {
  return prisma.producto.findUnique({
    where: { slug },
    include: {
      marca: true,
      categoria: true,
      imagenes: { orderBy: { orden: "asc" } },
    },
  });
}

async function getWhatsapp(): Promise<string | null> {
  return getConfigValor("whatsapp");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const producto = await getProducto(slug);
  if (!producto) return { title: "Producto no encontrado" };
  return {
    title: producto.nombre,
    description: producto.descripcionCorta ?? undefined,
  };
}

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [producto, whatsapp, favIds] = await Promise.all([
    getProducto(slug),
    getWhatsapp(),
    getFavoritoIds(),
  ]);
  if (!producto || !producto.activo) notFound();
  const esFavorito = favIds.has(producto.id);

  const precio = Number(producto.precio);
  const precioOferta =
    producto.precioOferta != null ? Number(producto.precioOferta) : null;
  const enOferta = precioOferta != null && precioOferta < precio;
  const agotado = producto.stock <= 0;
  const imagen = producto.imagenes[0]?.url ?? "/productos/generico.svg";

  const waUrl =
    whatsapp &&
    urlWhatsApp(
      whatsapp,
      `¡Hola AGAPEK! 🌸 Quiero consultar por el producto *${producto.nombre}* (${producto.codigo}).`,
    );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="text-muted-foreground flex items-center gap-1.5 text-sm">
        <Link href="/catalogo" className="hover:text-primary">
          Catálogo
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground truncate">{producto.nombre}</span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Galería */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="border-border bg-secondary relative aspect-square overflow-hidden rounded-3xl border">
            <Image
              src={imagen}
              alt={producto.imagenes[0]?.alt ?? producto.nombre}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              unoptimized={imagen.endsWith(".svg")}
              className="object-cover"
            />
            {producto.nuevo && (
              <span className="bg-card/90 text-foreground absolute top-4 left-4 rounded-full px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur">
                Nuevo
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            {producto.marca.nombre}
          </p>
          <h1 className="font-display text-foreground mt-1.5 text-3xl font-semibold tracking-tight sm:text-4xl">
            {producto.nombre}
          </h1>

          <div className="mt-3 flex items-center gap-3">
            <span className="text-foreground flex items-center gap-1 text-sm font-medium">
              <Star className="fill-primary text-primary size-4" />
              5.0
            </span>
            <span className="text-muted-foreground text-sm">
              · {producto.categoria.nombre}
            </span>
          </div>

          {/* Precio */}
          <div className="mt-5 flex items-end gap-3">
            <span className="text-foreground text-3xl font-semibold">
              {soles(enOferta ? precioOferta! : precio)}
            </span>
            {enOferta && (
              <span className="text-muted-foreground pb-1 text-lg line-through">
                {soles(precio)}
              </span>
            )}
          </div>

          {/* Stock */}
          <div className="mt-2">
            {agotado ? (
              <span className="bg-secondary text-muted-foreground inline-flex items-center rounded-full px-3 py-1 text-xs font-medium">
                Agotado
              </span>
            ) : (
              <span className="bg-chart-5/15 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-[color:var(--chart-5)]">
                En stock · {producto.stock} disponibles
              </span>
            )}
          </div>

          {producto.descripcionCorta && (
            <p className="text-muted-foreground mt-5 text-sm leading-relaxed">
              {producto.descripcionCorta}
            </p>
          )}

          {/* Chips necesidad / tipo de piel */}
          {(producto.necesidad.length > 0 || producto.tipoPiel.length > 0) && (
            <div className="mt-5 flex flex-wrap gap-2">
              {producto.necesidad.map((x) => (
                <span
                  key={`n-${x}`}
                  className="border-border bg-card text-foreground/80 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium capitalize"
                >
                  <Leaf className="text-primary size-3" />
                  {x}
                </span>
              ))}
              {producto.tipoPiel.map((x) => (
                <span
                  key={`t-${x}`}
                  className="bg-secondary text-secondary-foreground inline-flex items-center rounded-full px-3 py-1 text-xs font-medium capitalize"
                >
                  Piel {x}
                </span>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="mt-7">
            {agotado ? (
              waUrl && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-border bg-card text-foreground hover:bg-secondary inline-flex items-center gap-2 rounded-full border px-6 py-3.5 text-sm font-semibold transition-colors"
                >
                  <MessageCircle className="text-primary size-4.5" />
                  Consultar por WhatsApp
                </a>
              )
            ) : (
              <AddToCartFull
                producto={{
                  slug: producto.slug,
                  nombre: producto.nombre,
                  marca: producto.marca.nombre,
                  precio: enOferta ? precioOferta! : precio,
                  imagen,
                  stock: producto.stock,
                }}
                agotado={agotado}
              />
            )}
          </div>

          <div className="mt-3">
            <FavoriteWideButton productoId={producto.id} inicial={esFavorito} />
          </div>

          {/* Detalle largo */}
          {(producto.descripcion || producto.modoUso) && (
            <div className="border-border mt-8 space-y-6 border-t pt-6">
              {producto.descripcion && (
                <section>
                  <h2 className="font-display text-foreground text-lg font-semibold">
                    Descripción
                  </h2>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                    {producto.descripcion}
                  </p>
                </section>
              )}
              {producto.modoUso && (
                <section>
                  <h2 className="font-display text-foreground text-lg font-semibold">
                    Modo de uso
                  </h2>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                    {producto.modoUso}
                  </p>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
