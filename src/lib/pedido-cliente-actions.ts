"use server";

import { prisma } from "@/lib/prisma";
import { getPerfil } from "@/lib/auth";

export interface ReordenItem {
  slug: string;
  nombre: string;
  marca: string;
  precio: number;
  imagen: string;
  stock: number;
  cantidad: number;
}

export type ReordenarResult =
  | { items: ReordenItem[]; omitidos: number }
  | { error: "AUTH" | "NOT_FOUND" | "EMPTY" };

/**
 * Devuelve los ítems de un pedido listos para volver al carrito, tomando
 * el precio/stock actuales y saltando los productos ya no disponibles.
 * Verifica que el pedido pertenezca al usuario autenticado.
 */
export async function itemsParaReordenar(
  codigo: string,
): Promise<ReordenarResult> {
  const data = await getPerfil();
  if (!data) return { error: "AUTH" };

  const pedido = await prisma.pedido.findFirst({
    where: { codigo, perfilId: data.perfil.id },
    include: { items: true },
  });
  if (!pedido) return { error: "NOT_FOUND" };

  const ids = pedido.items.map((i) => i.productoId);
  const productos = await prisma.producto.findMany({
    where: { id: { in: ids }, activo: true, stock: { gt: 0 } },
    include: { marca: true, imagenes: { orderBy: { orden: "asc" }, take: 1 } },
  });
  const byId = new Map(productos.map((p) => [p.id, p]));

  const items: ReordenItem[] = [];
  let omitidos = 0;
  for (const it of pedido.items) {
    const p = byId.get(it.productoId);
    if (!p) {
      omitidos++;
      continue;
    }
    const enOferta =
      p.precioOferta != null && Number(p.precioOferta) < Number(p.precio);
    items.push({
      slug: p.slug,
      nombre: p.nombre,
      marca: p.marca.nombre,
      precio: enOferta ? Number(p.precioOferta) : Number(p.precio),
      imagen: p.imagenes[0]?.url ?? "/productos/generico.svg",
      stock: p.stock,
      cantidad: Math.min(it.cantidad, p.stock),
    });
  }

  if (items.length === 0) return { error: "EMPTY" };
  return { items, omitidos };
}
