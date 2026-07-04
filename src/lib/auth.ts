import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { Perfil, Rol } from "@prisma/client";

/** Usuario autenticado de Supabase (o null). Cacheado por request. */
export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export interface PerfilConEmail {
  perfil: Perfil;
  email: string | null;
}

/** Roles con acceso al panel administrador. */
export const ROLES_ADMIN: Rol[] = ["ADMIN", "TECNICO", "VENDEDOR"];

/** Lanza si el usuario no puede administrar. Devuelve su perfil si sí. */
export async function requireAdmin(): Promise<PerfilConEmail> {
  const d = await getPerfil();
  if (!d || !ROLES_ADMIN.includes(d.perfil.rol)) throw new Error("No autorizado");
  return d;
}

/** Lanza si el rol no está entre los permitidos. */
export async function requireRoles(roles: Rol[]): Promise<PerfilConEmail> {
  const d = await getPerfil();
  if (!d || !roles.includes(d.perfil.rol)) throw new Error("No autorizado");
  return d;
}

/** Devuelve el Perfil del usuario, creándolo si aún no existe. */
export async function getPerfil(): Promise<PerfilConEmail | null> {
  const user = await getUser();
  if (!user) return null;

  let perfil = await prisma.perfil.findUnique({ where: { id: user.id } });
  if (!perfil) {
    const nombre =
      (user.user_metadata?.nombre as string | undefined) ??
      user.email?.split("@")[0] ??
      "Cliente";
    perfil = await prisma.perfil.create({ data: { id: user.id, nombre } });
  }
  return { perfil, email: user.email ?? null };
}

/** Info mínima para la UI (header, etc.). */
export interface SesionUI {
  nombre: string;
  email: string | null;
  rol: Rol;
}

export async function getSesionUI(): Promise<SesionUI | null> {
  const data = await getPerfil();
  if (!data) return null;
  return { nombre: data.perfil.nombre, email: data.email, rol: data.perfil.rol };
}
