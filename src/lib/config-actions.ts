"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoles } from "@/lib/auth";

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

  revalidatePath("/admin/configuracion");
  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidatePath("/checkout");
  return { ok: true };
}
