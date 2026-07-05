"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRoles } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { BUCKET } from "@/lib/supabase/storage";
import { slugify } from "@/lib/slug";

async function requireBlog() {
  await requireRoles(["ADMIN", "TECNICO"]);
}

async function subirPortada(file: File, slug: string): Promise<string> {
  const { default: sharp } = await import("sharp");
  const buf = Buffer.from(await file.arrayBuffer());
  const webp = await sharp(buf)
    .resize(1200, 800, { fit: "cover", position: "attention" })
    .webp({ quality: 82 })
    .toBuffer();
  const path = `blog/${slug}-${Date.now()}.webp`;
  const admin = createAdminClient();
  const { error } = await admin.storage
    .from(BUCKET.publico)
    .upload(path, webp, { contentType: "image/webp", upsert: true });
  if (error) throw new Error("No se pudo subir la portada");
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET.publico}/${path}`;
}

const schema = z.object({
  titulo: z.string().min(3, "El título es obligatorio."),
  categoria: z.string().optional(),
  autor: z.string().optional(),
  resumen: z.string().optional(),
  contenido: z.string().min(10, "El contenido es muy corto."),
  publicado: z.boolean(),
});

export type PostState = { error?: string };

export async function guardarPost(
  _prev: PostState,
  formData: FormData,
): Promise<PostState> {
  await requireBlog();
  const id = (formData.get("id") as string) || null;

  const parsed = schema.safeParse({
    titulo: formData.get("titulo"),
    categoria: (formData.get("categoria") as string) || undefined,
    autor: (formData.get("autor") as string) || undefined,
    resumen: (formData.get("resumen") as string) || undefined,
    contenido: formData.get("contenido"),
    publicado: formData.get("publicado") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const d = parsed.data;

  let slug = slugify(d.titulo);
  const ex = await prisma.post.findUnique({ where: { slug } });
  if (ex && ex.id !== id) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

  const file = formData.get("portada");
  let portadaUrl: string | undefined;
  if (file instanceof File && file.size > 0) portadaUrl = await subirPortada(file, slug);

  const datos = {
    titulo: d.titulo,
    slug,
    categoria: d.categoria ?? null,
    autor: d.autor ?? null,
    resumen: d.resumen ?? null,
    contenido: d.contenido,
    publicado: d.publicado,
  };

  if (id) {
    await prisma.post.update({
      where: { id },
      data: { ...datos, ...(portadaUrl ? { portadaUrl } : {}) },
    });
  } else {
    await prisma.post.create({ data: { ...datos, portadaUrl: portadaUrl ?? null } });
  }

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  redirect("/admin/blog");
}

export async function togglePublicado(id: string) {
  await requireBlog();
  const p = await prisma.post.findUnique({ where: { id }, select: { publicado: true } });
  if (p) {
    await prisma.post.update({ where: { id }, data: { publicado: !p.publicado } });
    revalidatePath("/admin/blog");
    revalidatePath("/blog");
  }
}

export async function eliminarPost(id: string) {
  await requireBlog();
  await prisma.post.delete({ where: { id } });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}
