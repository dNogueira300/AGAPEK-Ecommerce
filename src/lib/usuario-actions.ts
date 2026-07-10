"use server";

import { revalidatePath } from "next/cache";
import { Rol } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getUser, requireRoles } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

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

/**
 * Activa/desactiva una cuenta. Al desactivar se banea también en Supabase Auth
 * (no puede volver a iniciar sesión) y getPerfil la trata como sin sesión.
 */
export async function toggleActivoUsuario(id: string) {
  await requireRoles(["ADMIN", "TECNICO"]);

  // No permitir desactivarse a uno mismo (evita bloquearse).
  const actual = await getUser();
  if (actual?.id === id) return;

  const p = await prisma.perfil.findUnique({ where: { id }, select: { activo: true } });
  if (!p) return;
  const nuevo = !p.activo;

  await prisma.perfil.update({ where: { id }, data: { activo: nuevo } });
  try {
    const admin = createAdminClient();
    await admin.auth.admin.updateUserById(id, {
      ban_duration: nuevo ? "none" : "87600h", // ~10 años
    });
  } catch {
    // El perfil ya quedó inactivo (getPerfil lo bloquea); el ban es refuerzo.
  }

  revalidatePath("/admin/usuarios");
  revalidatePath("/admin/clientes");
}

export interface PasswordState {
  ok?: boolean;
  error?: string;
}

/** Cambia la contraseña de cualquier usuario (incluido uno mismo) vía service role. */
export async function cambiarPasswordUsuario(
  _prev: PasswordState,
  formData: FormData,
): Promise<PasswordState> {
  await requireRoles(["ADMIN", "TECNICO"]);

  const id = String(formData.get("id") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!id) return { error: "Usuario inválido." };
  if (password.length < 6)
    return { error: "La contraseña debe tener al menos 6 caracteres." };

  try {
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.updateUserById(id, { password });
    if (error) return { error: "No se pudo cambiar la contraseña." };
  } catch {
    return { error: "No se pudo cambiar la contraseña." };
  }
  return { ok: true };
}
