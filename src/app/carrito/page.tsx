"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import {
  subtotalCarrito,
  useCart,
  useCartHydrated,
} from "@/stores/cart";

const soles = (n: number) => `S/ ${n.toFixed(2)}`;

export default function CarritoPage() {
  const items = useCart((s) => s.items);
  const setCantidad = useCart((s) => s.setCantidad);
  const remove = useCart((s) => s.remove);
  const hydrated = useCartHydrated();

  if (!hydrated) {
    return <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8" />;
  }

  const subtotal = subtotalCarrito(items);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-secondary text-primary">
          <ShoppingBag className="size-7" />
        </span>
        <h1 className="mt-6 font-display text-2xl font-semibold text-foreground">
          Tu carrito está vacío
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Descubre nuestros productos coreanos y arma tu rutina.
        </p>
        <Link
          href="/catalogo"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5"
        >
          Ir al catálogo
          <ArrowRight className="size-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
        Tu carrito
      </h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Items */}
        <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
          {items.map((it) => (
            <li key={it.slug} className="flex gap-4 p-4">
              <Link
                href={`/producto/${it.slug}`}
                className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-secondary"
              >
                <Image
                  src={it.imagen}
                  alt={it.nombre}
                  fill
                  sizes="96px"
                  unoptimized={it.imagen.endsWith(".svg")}
                  className="object-cover"
                />
              </Link>

              <div className="flex flex-1 flex-col">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {it.marca}
                </span>
                <Link
                  href={`/producto/${it.slug}`}
                  className="text-sm font-medium text-foreground hover:text-primary"
                >
                  {it.nombre}
                </Link>
                <span className="mt-1 text-sm font-semibold text-foreground">
                  {soles(it.precio)}
                </span>

                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="inline-flex items-center rounded-full border border-border">
                    <button
                      type="button"
                      onClick={() => setCantidad(it.slug, it.cantidad - 1)}
                      aria-label="Disminuir"
                      className="flex size-8 items-center justify-center rounded-l-full text-foreground transition-colors hover:bg-secondary"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">
                      {it.cantidad}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCantidad(it.slug, it.cantidad + 1)}
                      disabled={it.cantidad >= it.stock}
                      aria-label="Aumentar"
                      className="flex size-8 items-center justify-center rounded-r-full text-foreground transition-colors hover:bg-secondary disabled:opacity-40"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => remove(it.slug)}
                    aria-label={`Quitar ${it.nombre}`}
                    className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                    Quitar
                  </button>
                </div>
              </div>

              <div className="hidden shrink-0 text-right sm:block">
                <span className="text-sm font-semibold text-foreground">
                  {soles(it.precio * it.cantidad)}
                </span>
              </div>
            </li>
          ))}
        </ul>

        {/* Resumen */}
        <aside className="h-fit rounded-2xl border border-border bg-card p-6 lg:sticky lg:top-24">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Resumen
          </h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-medium text-foreground">{soles(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Envío</dt>
              <dd className="text-muted-foreground">Se calcula en el checkout</dd>
            </div>
          </dl>
          <div className="mt-4 flex justify-between border-t border-border pt-4">
            <span className="font-semibold text-foreground">Total estimado</span>
            <span className="font-semibold text-foreground">{soles(subtotal)}</span>
          </div>

          <Link
            href="/checkout"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5"
          >
            Finalizar compra
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/catalogo"
            className="mt-3 block text-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Seguir comprando
          </Link>
        </aside>
      </div>
    </div>
  );
}
