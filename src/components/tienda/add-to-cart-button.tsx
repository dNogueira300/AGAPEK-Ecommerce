"use client";

import { useState } from "react";
import { Check, Minus, Plus } from "lucide-react";
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
        "inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md",
        agotado && "cursor-not-allowed opacity-40 hover:translate-y-0 hover:shadow-sm",
      )}
    >
      {ok ? <Check className="size-4.5" strokeWidth={2.5} /> : <Plus className="size-4.5" strokeWidth={2.5} />}
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
        <div className="inline-flex items-center rounded-full border border-border bg-card">
          <button
            type="button"
            onClick={dec}
            aria-label="Disminuir cantidad"
            className="flex size-10 items-center justify-center rounded-l-full text-foreground transition-colors hover:bg-secondary"
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
            className="flex size-10 items-center justify-center rounded-r-full text-foreground transition-colors hover:bg-secondary"
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
          "inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md",
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
