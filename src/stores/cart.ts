"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  slug: string;
  nombre: string;
  marca: string;
  precio: number;
  imagen: string;
  stock: number;
  cantidad: number;
}

interface CartState {
  items: CartItem[];
  add: (item: Omit<CartItem, "cantidad">, cantidad?: number) => void;
  remove: (slug: string) => void;
  setCantidad: (slug: string, cantidad: number) => void;
  clear: () => void;
}

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item, cantidad = 1) =>
        set((state) => {
          const existe = state.items.find((i) => i.slug === item.slug);
          if (existe) {
            return {
              items: state.items.map((i) =>
                i.slug === item.slug
                  ? { ...i, cantidad: clamp(i.cantidad + cantidad, 1, i.stock) }
                  : i,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              { ...item, cantidad: clamp(cantidad, 1, item.stock) },
            ],
          };
        }),
      remove: (slug) =>
        set((state) => ({ items: state.items.filter((i) => i.slug !== slug) })),
      setCantidad: (slug, cantidad) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.slug === slug ? { ...i, cantidad: clamp(cantidad, 1, i.stock) } : i,
          ),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "agapek-cart" },
  ),
);

export const contarItems = (items: CartItem[]) =>
  items.reduce((n, i) => n + i.cantidad, 0);

export const subtotalCarrito = (items: CartItem[]) =>
  items.reduce((s, i) => s + i.precio * i.cantidad, 0);

/** Evita hydration mismatch: false en el primer render (servidor), true tras montar. */
export function useCartHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
