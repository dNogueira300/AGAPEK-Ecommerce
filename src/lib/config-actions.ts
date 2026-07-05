"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoles } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { BUCKET } from "@/lib/supabase/storage";

export const CLAVES = [
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
    const valor: string | number = NUMERICAS.includes(clave)
      ? Number(raw)
      : String(raw);
    await prisma.configuracion.upsert({
      where: { clave },
      update: { valor },
      create: { clave, valor },
    });
  }

  // Logo de la tienda (opcional).
  const logo = formData.get("logo");
  if (logo instanceof File && logo.size > 0) {
    const { default: sharp } = await import("sharp");
    const buf = Buffer.from(await logo.arrayBuffer());
    const webp = await sharp(buf)
      .resize(400, 160, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 90 })
      .toBuffer();
    const path = `logo/agapek-${Date.now()}.webp`;
    const admin = createAdminClient();
    const { error } = await admin.storage
      .from(BUCKET.publico)
      .upload(path, webp, { contentType: "image/webp", upsert: true });
    if (error) return { error: "No se pudo subir el logo." };
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET.publico}/${path}`;
    await prisma.configuracion.upsert({
      where: { clave: "logo_url" },
      update: { valor: url },
      create: { clave: "logo_url", valor: url },
    });
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/configuracion");
  return { ok: true };
}
