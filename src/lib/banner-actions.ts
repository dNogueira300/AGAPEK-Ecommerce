"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRoles } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { BUCKET, CARPETA } from "@/lib/supabase/storage";
import { slugify } from "@/lib/slug";

async function requireContenido() {
  await requireRoles(["ADMIN", "TECNICO"]);
}

async function subirImagenBanner(file: File): Promise<string> {
  const { default: sharp } = await import("sharp");
  const buf = Buffer.from(await file.arrayBuffer());
  const webp = await sharp(buf)
    .resize(1600, 600, { fit: "cover", position: "attention" })
    .webp({ quality: 82 })
    .toBuffer();
  const path = `${CARPETA.banners}/banner-${Date.now()}.webp`;
  const admin = createAdminClient();
  const { error } = await admin.storage
    .from(BUCKET.publico)
    .upload(path, webp, { contentType: "image/webp", upsert: true });
  if (error) throw new Error("No se pudo subir la imagen");
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET.publico}/${path}`;
}

const schema = z.object({
  titulo: z.string().optional(),
  subtitulo: z.string().optional(),
  cta: z.string().optional(),
  enlace: z.string().optional(),
  orden: z.number().int().min(0),
  activo: z.boolean(),
});

export type BannerState = { error?: string };

export async function guardarBanner(
  _prev: BannerState,
  formData: FormData,
): Promise<BannerState> {
  await requireContenido();
  const id = (formData.get("id") as string) || null;

  const parsed = schema.safeParse({
    titulo: (formData.get("titulo") as string) || undefined,
    subtitulo: (formData.get("subtitulo") as string) || undefined,
    cta: (formData.get("cta") as string) || undefined,
    enlace: (formData.get("enlace") as string) || undefined,
    orden: Number(formData.get("orden") ?? 0),
    activo: formData.get("activo") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const d = parsed.data;
  const enlace = d.enlace && (d.enlace.startsWith("/") || d.enlace.startsWith("http")) ? d.enlace : d.enlace ? `/${slugify(d.enlace)}` : null;

  const file = formData.get("imagen");
  let imagenUrl: string | undefined;
  if (file instanceof File && file.size > 0) imagenUrl = await subirImagenBanner(file);
  if (!id && !imagenUrl) return { error: "Sube una imagen para el banner." };

  const datos = {
    titulo: d.titulo ?? null,
    subtitulo: d.subtitulo ?? null,
    cta: d.cta ?? null,
    enlace,
    orden: d.orden,
    activo: d.activo,
  };

  if (id) {
    await prisma.banner.update({
      where: { id },
      data: { ...datos, ...(imagenUrl ? { imagenUrl } : {}) },
    });
  } else {
    await prisma.banner.create({ data: { ...datos, imagenUrl: imagenUrl! } });
  }

  revalidatePath("/admin/banners");
  revalidatePath("/");
  redirect("/admin/banners");
}

export async function toggleActivoBanner(id: string) {
  await requireContenido();
  const b = await prisma.banner.findUnique({ where: { id }, select: { activo: true } });
  if (b) {
    await prisma.banner.update({ where: { id }, data: { activo: !b.activo } });
    revalidatePath("/admin/banners");
    revalidatePath("/");
  }
}

export async function eliminarBanner(id: string) {
  await requireContenido();
  await prisma.banner.delete({ where: { id } });
  revalidatePath("/admin/banners");
  revalidatePath("/");
}
