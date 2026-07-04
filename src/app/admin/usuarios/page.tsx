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
      <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">Usuarios</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Gestiona los roles. Un administrador puede dar acceso al panel a otras personas.
      </p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Usuario</th>
              <th className="px-4 py-3 font-medium">Correo</th>
              <th className="px-4 py-3 font-medium">Rol</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {perfiles.map((p) => (
              <tr key={p.id} className="hover:bg-secondary/40">
                <td className="px-4 py-3">
                  <span className="font-medium text-foreground">{p.nombre}</span>
                  {p.id === yo.perfil.id && (
                    <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">tú</span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{emails.get(p.id) ?? "—"}</td>
                <td className="px-4 py-3">
                  <RolSelect id={p.id} rol={p.rol} disabled={p.id === yo.perfil.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Para crear una cuenta nueva, la persona debe registrarse en la tienda y luego asignarle un rol aquí.
      </p>
    </div>
  );
}
