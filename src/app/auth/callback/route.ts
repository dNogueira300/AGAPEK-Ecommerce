import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { ROLES_ADMIN } from "@/lib/auth";

// Intercambia el código (OAuth Google o recuperación) por una sesión.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      let destino = next.startsWith("/") && !next.startsWith("//") ? next : "/";
      if (destino === "/" && data.user) {
        const perfil = await prisma.perfil.findUnique({
          where: { id: data.user.id },
          select: { rol: true },
        });
        if (perfil && ROLES_ADMIN.includes(perfil.rol)) destino = "/admin";
      }
      return NextResponse.redirect(`${origin}${destino}`);
    }
  }
  return NextResponse.redirect(`${origin}/login?error=oauth`);
}
