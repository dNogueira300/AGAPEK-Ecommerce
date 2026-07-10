import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getPerfil } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { RolSelect } from "@/components/admin/rol-select";

export const metadata: Metadata = { title: "Usuarios" };
export const dynamic = "force-dynamic";

export default async function AdminUsuarios() {
  const yo = await getPerfil();
  if (!yo) redirect("/login?redirect=/admin/usuarios");
  if (yo.perfil.rol === "VENDEDOR") redirect("/admin");

  const perfiles = await prisma.perfil.findMany({ orderBy: { createdAt: "asc" } });

  let emails = new Map<string, string>();
  try {
    const admin = createAdminClient();
    const { data } = await admin.auth.admin.listUsers({ perPage: 1000 });
    emails = new Map(data.users.map((u) => [u.id, u.email ?? ""]));
  } catch {}

  return (
    <div>
      <h1 className="font-display text-foreground text-2xl font-semibold sm:text-3xl">
        Usuarios
      </h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Gestiona los roles. Un administrador puede dar acceso al panel a otras personas.
      </p>

      <div className="border-border bg-card mt-6 overflow-x-auto rounded-2xl border">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="border-border text-muted-foreground border-b text-left text-xs tracking-wide uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Usuario</th>
              <th className="px-4 py-3 font-medium">Correo</th>
              <th className="px-4 py-3 font-medium">Rol</th>
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {perfiles.map((p) => (
              <tr key={p.id} className="hover:bg-secondary/40">
                <td className="px-4 py-3">
                  <span className="text-foreground font-medium">{p.nombre}</span>
                  {p.id === yo.perfil.id && (
                    <span className="bg-secondary text-muted-foreground ml-2 rounded-full px-2 py-0.5 text-[11px]">
                      tú
                    </span>
                  )}
                </td>
                <td className="text-muted-foreground px-4 py-3">
                  {emails.get(p.id) ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <RolSelect id={p.id} rol={p.rol} disabled={p.id === yo.perfil.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-muted-foreground mt-4 text-xs">
        Para crear una cuenta nueva, la persona debe registrarse en la tienda y luego
        asignarle un rol aquí.
      </p>
    </div>
  );
}
