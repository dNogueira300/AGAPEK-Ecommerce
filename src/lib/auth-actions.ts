"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { ROLES_ADMIN } from "@/lib/auth";

export interface AuthState {
  error?: string;
  message?: string;
}

const registroSchema = z.object({
  nombre: z.string().min(2, "Ingresa tu nombre."),
  email: z.string().email("Correo inválido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
});

const loginSchema = z.object({
  email: z.string().email("Correo inválido."),
  password: z.string().min(1, "Ingresa tu contraseña."),
});

function safeRedirect(value: FormDataEntryValue | null): string {
  const v = typeof value === "string" ? value : "";
  // Solo rutas internas para evitar open-redirect.
  return v.startsWith("/") && !v.startsWith("//") ? v : "/";
}

export async function signUpAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = registroSchema.safeParse({
    nombre: formData.get("nombre"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const { nombre, email, password } = parsed.data;
  const destino = safeRedirect(formData.get("redirect"));

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nombre },
      emailRedirectTo: `${siteUrl}/auth/confirm`,
    },
  });
  if (error) return { error: error.message };

  if (data.user) {
    await prisma.perfil.upsert({
      where: { id: data.user.id },
      update: { nombre },
      create: { id: data.user.id, nombre },
    });
  }

  // Si el proyecto no exige confirmación de correo, ya hay sesión.
  if (data.session) redirect(destino);

  return {
    message:
      "¡Cuenta creada! Revisa tu correo para confirmar y luego inicia sesión.",
  };
}

export async function signInAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  let destino = safeRedirect(formData.get("redirect"));

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: "Correo o contraseña incorrectos." };

  // Los administradores van directo al panel (si no había un redirect explícito).
  if (destino === "/" && data.user) {
    const perfil = await prisma.perfil.findUnique({
      where: { id: data.user.id },
      select: { rol: true },
    });
    if (perfil && ROLES_ADMIN.includes(perfil.rol)) destino = "/admin";
  }

  redirect(destino);
}

const resetSchema = z.object({ email: z.string().email("Correo inválido.") });

export async function solicitarResetAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = resetSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  // Enviamos el correo; el enlace lleva a /auth/callback que crea la sesión de
  // recuperación y redirige a /restablecer.
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl}/auth/callback?next=/restablecer`,
  });
  // No revelamos si el correo existe.
  return {
    message:
      "Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña.",
  };
}

const passSchema = z
  .object({
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
    confirmar: z.string(),
  })
  .refine((d) => d.password === d.confirmar, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmar"],
  });

export async function actualizarPasswordAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = passSchema.safeParse({
    password: formData.get("password"),
    confirmar: formData.get("confirmar"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return { error: "El enlace expiró o no es válido. Solicita uno nuevo." };
  }
  redirect("/login?reset=ok");
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
