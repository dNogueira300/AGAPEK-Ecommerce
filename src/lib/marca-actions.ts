"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { BUCKET, CARPETA } from "@/lib/supabase/storage";
import { slugify } from "@/lib/slug";

const schema = z.object({
  nombre: z.string().min(2, "El nombre es obligatorio."),
  aliada: z.boolean(),
});

export type MarcaState = { error?: string };

async function subirLogo(file: File, slug: string): Promise<string> {
  const { default: sharp } = await import("sharp");
  const buf = Buffer.from(await file.arrayBuffer());
  const webp = await sharp(buf)
    .resize(400, 400, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();
  const path = `${CARPETA.marcas}/${slug}-${Date.now()}.webp`;
  const admin = createAdminClient();
  const { error } = await admin.storage
    .from(BUCKET.publico)
    .upload(path, webp, { contentType: "image/webp", upsert: true });
  if (error) throw new Error("No se pudo subir el logo");
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET.publico}/${path}`;
}

export async function guardarMarca(
  _prev: MarcaState,
  formData: FormData,
): Promise<MarcaState> {
  await requireAdmin();
  const id = (formData.get("id") as string) || null;
  const parsed = schema.safeParse({
    nombre: formData.get("nombre"),
    aliada: formData.get("aliada") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const { nombre, aliada } = parsed.data;

  let slug = slugify(nombre);
  const ex = await prisma.marca.findUnique({ where: { slug } });
  if (ex && ex.id !== id) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

  const file = formData.get("logo");
  let logoUrl: string | undefined;
  if (file instanceof File && file.size > 0) logoUrl = await subirLogo(file, slug);

  if (id) {
    await prisma.marca.update({
      where: { id },
      data: { nombre, slug, aliada, ...(logoUrl ? { logoUrl } : {}) },
    });
  } else {
    await prisma.marca.create({ data: { nombre, slug, aliada, logoUrl: logoUrl ?? null } });
  }

  revalidatePath("/admin/marcas");
  revalidatePath("/catalogo");
  redirect("/admin/marcas");
}

export async function eliminarMarca(id: string) {
  await requireAdmin();
  const n = await prisma.producto.count({ where: { marcaId: id } });
  if (n === 0) {
    await prisma.marca.delete({ where: { id } });
    revalidatePath("/admin/marcas");
  }
}
