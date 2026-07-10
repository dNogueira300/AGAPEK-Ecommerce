"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { invalidarTag } from "@/lib/cache";
import { prisma } from "@/lib/prisma";
import { requireRoles } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { BUCKET } from "@/lib/supabase/storage";

// Nota: este archivo es "use server" — solo puede EXPORTAR funciones async.
// CLAVES debe permanecer sin exportar (exportarlo rompía el módulo en producción
// con el digest E352: «A "use server" file can only export async functions»).
const CLAVES = [
  "whatsapp",
  "yape",
  "plin",
  "cuenta_bcp",
  "cci",
  "horario",
  "delivery_centrico",
  "delivery_otras",
  "facebook",
  "instagram",
  "tiktok",
] as const;

const NUMERICAS = ["delivery_centrico", "delivery_otras"];

export type ConfigState = { ok?: boolean; error?: string };

export async function guardarConfiguracion(
  _prev: ConfigState,
  formData: FormData,
): Promise<ConfigState> {
  await requireRoles(["ADMIN", "TECNICO"]);

  for (const clave of CLAVES) {
    const raw = formData.get(clave);
    if (raw === null) continue;
    const valor: string | number = NUMERICAS.includes(clave) ? Number(raw) : String(raw);
    await prisma.configuracion.upsert({
      where: { clave },
      update: { valor },
      create: { clave, valor },
    });
  }

  // Logo de la tienda (opcional).
  const logo = formData.get("logo");
  if (logo instanceof File && logo.size > 0) {
    const url = await subirImagen(logo, "logo/agapek", { w: 400, h: 160, q: 90 });
    if (!url) return { error: "No se pudo subir el logo." };
    await upsertConfig("logo_url", url);
  }

  // Imagen del banner de asesoría del home (CTA "Tu rutina ideal…").
  const cta = formData.get("cta_imagen");
  if (cta instanceof File && cta.size > 0) {
    const url = await subirImagen(cta, "banners/cta-home", { w: 1920, h: 1080, q: 78 });
    if (!url) return { error: "No se pudo subir la imagen del banner." };
    await upsertConfig("cta_home_imagen", url);
  }

  // Redes sociales adicionales (lista editable + posible red nueva con icono).
  const extrasJson = formData.get("redes_extra_json");
  if (typeof extrasJson === "string") {
    const parsed = redesExtraSchema.safeParse(safeJson(extrasJson));
    if (!parsed.success) return { error: "Las redes adicionales no son válidas." };
    const extras = parsed.data;

    const nombre = String(formData.get("red_nueva_nombre") ?? "").trim();
    const url = String(formData.get("red_nueva_url") ?? "").trim();
    const icono = formData.get("red_nueva_icono");
    if (nombre || url) {
      const nueva = redNuevaSchema.safeParse({ nombre, url });
      if (!nueva.success) return { error: nueva.error.issues[0]?.message };
      if (!(icono instanceof File) || icono.size === 0)
        return { error: "Sube el ícono de la nueva red social." };
      const iconoUrl = await subirImagen(icono, "redes/icono", { w: 128, h: 128, q: 90 });
      if (!iconoUrl) return { error: "No se pudo subir el ícono." };
      extras.push({ nombre: nueva.data.nombre, url: nueva.data.url, iconoUrl });
    }

    await upsertConfig("redes_extra", extras);
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/configuracion");
  invalidarTag("config");
  return { ok: true };
}

const redNuevaSchema = z.object({
  nombre: z.string().trim().min(2, "Ingresa el nombre de la red.").max(30),
  url: z.url("El enlace de la nueva red no es válido."),
});

const redesExtraSchema = z.array(
  z.object({ nombre: z.string().min(1).max(30), url: z.url(), iconoUrl: z.url() }),
);

function safeJson(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

async function upsertConfig(clave: string, valor: string | object) {
  await prisma.configuracion.upsert({
    where: { clave },
    update: { valor },
    create: { clave, valor },
  });
}

/** Optimiza a WebP y sube al bucket público. Devuelve la URL pública o null. */
async function subirImagen(
  file: File,
  prefijo: string,
  opts: { w: number; h: number; q: number },
): Promise<string | null> {
  const { default: sharp } = await import("sharp");
  const buf = Buffer.from(await file.arrayBuffer());
  const webp = await sharp(buf)
    .resize(opts.w, opts.h, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: opts.q })
    .toBuffer();
  const path = `${prefijo}-${Date.now()}.webp`;
  const admin = createAdminClient();
  const { error } = await admin.storage
    .from(BUCKET.publico)
    .upload(path, webp, { contentType: "image/webp", upsert: true });
  if (error) return null;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET.publico}/${path}`;
}
