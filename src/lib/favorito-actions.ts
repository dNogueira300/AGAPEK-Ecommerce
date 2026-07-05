"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getPerfil } from "@/lib/auth";

export type ToggleFavoritoResult =
  | { favorito: boolean }
  | { error: "AUTH" | "ERROR" };

/**
 * Alterna un producto en los favoritos del usuario actual.
 * Devuelve el nuevo estado, o `error: "AUTH"` si no hay sesión.
 */
export async function toggleFavorito(
  productoId: string,
): Promise<ToggleFavoritoResult> {
  const data = await getPerfil();
  if (!data) return { error: "AUTH" };

  try {
    const existe = await prisma.perfil.findFirst({
      where: { id: data.perfil.id, favoritos: { some: { id: productoId } } },
      select: { id: true },
    });

    await prisma.perfil.update({
      where: { id: data.perfil.id },
      data: {
        favoritos: existe
          ? { disconnect: { id: productoId } }
          : { connect: { id: productoId } },
      },
    });

    revalidatePath("/favoritos");
    return { favorito: !existe };
  } catch {
    return { error: "ERROR" };
  }
}

/** IDs de los productos favoritos del usuario actual (vacío si no hay sesión). */
export async function getFavoritoIds(): Promise<Set<string>> {
  const data = await getPerfil();
  if (!data) return new Set();

  const favoritos = await prisma.producto.findMany({
    where: { favoritoDe: { some: { id: data.perfil.id } } },
    select: { id: true },
  });
  return new Set(favoritos.map((f) => f.id));
}
