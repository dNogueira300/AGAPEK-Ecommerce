"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getPerfil } from "@/lib/auth";

export interface PerfilFormState {
  error?: string;
  message?: string;
}

const perfilSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "Ingresa tu nombre completo.")
    .max(80, "El nombre es demasiado largo."),
  celular: z
    .string()
    .trim()
    .regex(/^9\d{8}$/, "El celular debe tener 9 dígitos y empezar con 9.")
    .or(z.literal(""))
    .transform((v) => (v === "" ? null : v)),
  dni: z
    .string()
    .trim()
    .regex(/^\d{8}$/, "El DNI debe tener 8 dígitos.")
    .or(z.literal(""))
    .transform((v) => (v === "" ? null : v)),
});

/** El cliente completa/edita sus datos desde /perfil (nombre, celular, DNI). */
export async function actualizarPerfilAction(
  _prev: PerfilFormState,
  formData: FormData,
): Promise<PerfilFormState> {
  const data = await getPerfil();
  if (!data) return { error: "Debes iniciar sesión." };

  const parsed = perfilSchema.safeParse({
    nombre: formData.get("nombre") ?? "",
    celular: formData.get("celular") ?? "",
    dni: formData.get("dni") ?? "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  await prisma.perfil.update({
    where: { id: data.perfil.id },
    data: parsed.data,
  });

  revalidatePath("/perfil");
  return { message: "Datos actualizados correctamente." };
}
