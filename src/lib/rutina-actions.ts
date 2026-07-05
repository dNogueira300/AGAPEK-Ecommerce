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

async function subirPortada(file: File): Promise<string> {
  const { default: sharp } = await import("sharp");
  const buf = Buffer.from(await file.arrayBuffer());
  const webp = await sharp(buf)
    .resize(1200, 800, { fit: "cover", position: "attention" })
    .webp({ quality: 82 })
    .toBuffer();
  const path = `${CARPETA.rutinas}/rutina-${Date.now()}.webp`;
  const admin = createAdminClient();
  const { error } = await admin.storage
    .from(BUCKET.publico)
    .upload(path, webp, { contentType: "image/webp", upsert: true });
  if (error) throw new Error("No se pudo subir la imagen");
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET.publico}/${path}`;
}

const pasoSchema = z.object({
  titulo: z.string().min(1),
  descripcion: z.string().optional().default(""),
  momento: z.enum(["DIA", "NOCHE", "AMBOS"]).default("AMBOS"),
  productoIds: z.array(z.string()).default([]),
});

const schema = z.object({
  titulo: z.string().min(2, "Ingresa un título."),
  tipoPiel: z.enum(["grasa", "seca", "mixta", "sensible", "normal", "todas"]),
  descripcion: z.string().optional(),
  orden: z.number().int().min(0),
  publicado: z.boolean(),
  pasos: z.array(pasoSchema).min(1, "Agrega al menos un paso."),
});

export type RutinaState = { error?: string };

export async function guardarRutina(
  _prev: RutinaState,
  formData: FormData,
): Promise<RutinaState> {
  await requireContenido();
  const id = (formData.get("id") as string) || null;

  let pasos: unknown;
  try {
    pasos = JSON.parse((formData.get("pasos") as string) || "[]");
  } catch {
    return { error: "Pasos inválidos." };
  }

  const parsed = schema.safeParse({
    titulo: (formData.get("titulo") as string)?.trim(),
    tipoPiel: formData.get("tipoPiel"),
    descripcion: (formData.get("descripcion") as string) || undefined,
    orden: Number(formData.get("orden") ?? 0),
    publicado: formData.get("publicado") === "on",
    pasos,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const d = parsed.data;

  const file = formData.get("portada");
  let portadaUrl: string | undefined;
  if (file instanceof File && file.size > 0) portadaUrl = await subirPortada(file);

  const slug = `${slugify(d.titulo)}-${d.tipoPiel}`;

  const datosBase = {
    titulo: d.titulo,
    tipoPiel: d.tipoPiel,
    descripcion: d.descripcion ?? null,
    orden: d.orden,
    publicado: d.publicado,
    ...(portadaUrl ? { portadaUrl } : {}),
  };

  const crearPasos = d.pasos.map((p, i) => ({
    orden: i,
    titulo: p.titulo,
    descripcion: p.descripcion || null,
    momento: p.momento,
    productos: { connect: p.productoIds.map((pid) => ({ id: pid })) },
  }));

  try {
    if (id) {
      await prisma.$transaction([
        prisma.rutinaPaso.deleteMany({ where: { rutinaId: id } }),
        prisma.rutina.update({
          where: { id },
          data: { ...datosBase, pasos: { create: crearPasos } },
        }),
      ]);
    } else {
      await prisma.rutina.create({
        data: { ...datosBase, slug, pasos: { create: crearPasos } },
      });
    }
  } catch {
    return { error: "No se pudo guardar la rutina." };
  }

  revalidatePath("/admin/rutinas");
  revalidatePath("/rutinas");
  redirect("/admin/rutinas");
}

export async function togglePublicadoRutina(id: string) {
  await requireContenido();
  const r = await prisma.rutina.findUnique({ where: { id }, select: { publicado: true } });
  if (r) {
    await prisma.rutina.update({ where: { id }, data: { publicado: !r.publicado } });
    revalidatePath("/admin/rutinas");
    revalidatePath("/rutinas");
  }
}

export async function eliminarRutina(id: string) {
  await requireContenido();
  await prisma.rutina.delete({ where: { id } });
  revalidatePath("/admin/rutinas");
  revalidatePath("/rutinas");
}
