"use server";

import { revalidatePath } from "next/cache";
import { Rol } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getUser, requireRoles } from "@/lib/auth";

const ROLES = Object.values(Rol);

export async function cambiarRol(id: string, formData: FormData) {
  await requireRoles(["ADMIN", "TECNICO"]);

  // No permitir cambiarse el propio rol (evita bloquearse).
  const actual = await getUser();
  if (actual?.id === id) return;

  const nuevo = String(formData.get("rol") ?? "");
  if (!ROLES.includes(nuevo as Rol)) return;

  await prisma.perfil.update({ where: { id }, data: { rol: nuevo as Rol } });
  revalidatePath("/admin/usuarios");
}
