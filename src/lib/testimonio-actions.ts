"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRoles } from "@/lib/auth";

async function requireContenido() {
  await requireRoles(["ADMIN", "TECNICO"]);
}

const schema = z.object({
  nombre: z.string().min(2, "El nombre es obligatorio."),
  texto: z.string().min(5, "El testimonio es muy corto."),
  rating: z.number().int().min(1).max(5),
  activo: z.boolean(),
});

export type TestimonioState = { error?: string };

export async function guardarTestimonio(
  _prev: TestimonioState,
  formData: FormData,
): Promise<TestimonioState> {
  await requireContenido();
  const id = (formData.get("id") as string) || null;

  const parsed = schema.safeParse({
    nombre: formData.get("nombre"),
    texto: formData.get("texto"),
    rating: Number(formData.get("rating") ?? 5),
    activo: formData.get("activo") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const d = parsed.data;

  if (id) await prisma.testimonio.update({ where: { id }, data: d });
  else await prisma.testimonio.create({ data: d });

  revalidatePath("/admin/testimonios");
  revalidatePath("/");
  redirect("/admin/testimonios");
}

export async function toggleActivoTestimonio(id: string) {
  await requireContenido();
  const t = await prisma.testimonio.findUnique({ where: { id }, select: { activo: true } });
  if (t) {
    await prisma.testimonio.update({ where: { id }, data: { activo: !t.activo } });
    revalidatePath("/admin/testimonios");
    revalidatePath("/");
  }
}

export async function eliminarTestimonio(id: string) {
  await requireContenido();
  await prisma.testimonio.delete({ where: { id } });
  revalidatePath("/admin/testimonios");
  revalidatePath("/");
}
