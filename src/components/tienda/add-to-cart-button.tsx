"use client";

import { useState } from "react";
import { Check, Minus, Plus, ShoppingCart } from "lucide-react";
import { useCart, type CartItem } from "@/stores/cart";
import { cn } from "@/lib/utils";

type Producto = Omit<CartItem, "cantidad">;

export function AddToCartIcon({
  producto,
  agotado,
}: {
  producto: Producto;
  agotado: boolean;
}) {
  const add = useCart((s) => s.add);
  const [ok, setOk] = useState(false);

  const handle = () => {
    add(producto, 1);
    setOk(true);
    setTimeout(() => setOk(false), 1200);
  };

  return (
    <button
      type="button"
      onClick={handle}
      disabled={agotado}
      aria-label={agotado ? "Producto agotado" : `Agregar ${producto.nombre} al carrito`}
      className={cn(
        "bg-primary text-primary-foreground inline-flex size-9 shrink-0 items-center justify-center rounded-full shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md active:scale-95 motion-reduce:transform-none",
        agotado && "cursor-not-allowed opacity-40 hover:translate-y-0 hover:shadow-sm",
      )}
    >
      {ok ? (
        <Check className="size-4.5" strokeWidth={2.5} />
      ) : (
        <Plus className="size-4.5" strokeWidth={2.5} />
      )}
    </button>
  );
}

export function AddToCartWide({
  producto,
  agotado,
}: {
  producto: Producto;
  agotado: boolean;
}) {
  const add = useCart((s) => s.add);
  const [ok, setOk] = useState(false);

  const handle = () => {
    add(producto, 1);
    setOk(true);
    setTimeout(() => setOk(false), 1200);
  };

  return (
    <button
      type="button"
      onClick={handle}
      disabled={agotado}
      className={cn(
        "bg-foreground text-background hover:bg-foreground/90 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold transition-[background-color,transform] active:scale-[0.98] motion-reduce:transform-none",
        agotado && "cursor-not-allowed opacity-40",
      )}
    >
      {ok ? (
        <>
          <Check className="size-4" strokeWidth={2.5} /> Agregado
        </>
      ) : (
        <>
          <ShoppingCart className="size-4" /> Agregar
        </>
      )}
    </button>
  );
}

export function AddToCartFull({
  producto,
  agotado,
}: {
  producto: Producto;
  agotado: boolean;
}) {
  const add = useCart((s) => s.add);
  const [cantidad, setCantidad] = useState(1);
  const [ok, setOk] = useState(false);

  const dec = () => setCantidad((c) => Math.max(1, c - 1));
  const inc = () => setCantidad((c) => Math.min(producto.stock, c + 1));

  const handle = () => {
    add(producto, cantidad);
    setOk(true);
    setTimeout(() => setOk(false), 1500);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {!agotado && (
        <div className="border-border bg-card inline-flex items-center rounded-full border">
          <button
            type="button"
            onClick={dec}
            aria-label="Disminuir cantidad"
            className="text-foreground hover:bg-secondary flex size-10 items-center justify-center rounded-l-full transition-colors"
          >
            <Minus className="size-4" />
          </button>
          <span className="w-8 text-center text-sm font-semibold" aria-live="polite">
            {cantidad}
          </span>
          <button
            type="button"
            onClick={inc}
            aria-label="Aumentar cantidad"
            className="text-foreground hover:bg-secondary flex size-10 items-center justify-center rounded-r-full transition-colors"
          >
            <Plus className="size-4" />
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={handle}
        disabled={agotado}
        className={cn(
          "bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md active:scale-95 motion-reduce:transform-none",
          agotado && "cursor-not-allowed opacity-40 hover:translate-y-0 hover:shadow-sm",
        )}
      >
        {ok ? (
          <>
            <Check className="size-4.5" strokeWidth={2.5} />
            Agregado
          </>
        ) : (
          <>
            <Plus className="size-4.5" strokeWidth={2.5} />
            Agregar al carrito
          </>
        )}
      </button>
    </div>
  );
}
