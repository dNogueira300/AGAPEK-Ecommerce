"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slug";

const schema = z.object({
  nombre: z.string().min(2, "El nombre es obligatorio."),
  orden: z.number().int().min(0),
});

export type CategoriaState = { error?: string };

export async function guardarCategoria(
  _prev: CategoriaState,
  formData: FormData,
): Promise<CategoriaState> {
  await requireAdmin();
  const id = (formData.get("id") as string) || null;
  const parsed = schema.safeParse({
    nombre: formData.get("nombre"),
    orden: Number(formData.get("orden") ?? 0),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const { nombre, orden } = parsed.data;

  let slug = slugify(nombre);
  const ex = await prisma.categoria.findUnique({ where: { slug } });
  if (ex && ex.id !== id) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

  if (id) await prisma.categoria.update({ where: { id }, data: { nombre, orden, slug } });
  else await prisma.categoria.create({ data: { nombre, orden, slug } });

  revalidatePath("/admin/categorias");
  revalidatePath("/catalogo");
  redirect("/admin/categorias");
}

export async function eliminarCategoria(id: string) {
  await requireAdmin();
  const n = await prisma.producto.count({ where: { categoriaId: id } });
  if (n === 0) {
    await prisma.categoria.delete({ where: { id } });
    revalidatePath("/admin/categorias");
  }
}
