"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Rol } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getUser, requireRoles } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { mensajeErrorPassword, passwordSchema } from "@/lib/password";

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

/**
 * Cambia la contraseña de cualquier usuario (incluido uno mismo) vía service role.
 * Supabase revoca las sesiones de ese usuario al cambiarla; si es la propia
 * cuenta se cierra sesión en todos lados y se redirige al login.
 */
export async function cambiarPasswordUsuario(
  _prev: PasswordState,
  formData: FormData,
): Promise<PasswordState> {
  let actualId: string;
  try {
    actualId = (await requireRoles(["ADMIN", "TECNICO"])).perfil.id;
  } catch {
    return { error: "Tu sesión expiró. Vuelve a iniciar sesión e inténtalo de nuevo." };
  }

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Usuario inválido." };
  const parsed = passwordSchema.safeParse(String(formData.get("password") ?? ""));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  try {
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.updateUserById(id, {
      password: parsed.data,
    });
    if (error) {
      console.error("[cambiarPasswordUsuario]", error.code, error.message, error);
      return { error: mensajeErrorPassword(error) };
    }
  } catch (e) {
    console.error("[cambiarPasswordUsuario]", e);
    return { error: "No se pudo conectar con el servidor de autenticación." };
  }

  // Propia cuenta (el usuario ya confirmó el aviso): cerrar sesión en todos los
  // dispositivos y volver al login. Si Supabase ya revocó las sesiones al cambiar
  // la contraseña, signOut solo limpia las cookies locales.
  if (id === actualId) {
    const supabase = await createClient();
    await supabase.auth.signOut({ scope: "global" });
    redirect("/login?aviso=password");
  }
  return { ok: true };
}
