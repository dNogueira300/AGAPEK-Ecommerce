import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPerfil } from "@/lib/auth";
import { EstadoToggle } from "@/components/admin/usuario-acciones";

export const metadata: Metadata = { title: "Clientes" };
export const dynamic = "force-dynamic";

const soles = (n: number) => `S/ ${n.toFixed(2)}`;

export default async function AdminClientes() {
  const yo = await getPerfil();
  const perfiles = await prisma.perfil.findMany({
    orderBy: { createdAt: "desc" },
    include: { pedidos: { select: { total: true, estado: true } } },
  });

  // Emails desde Supabase Auth.
  let emails = new Map<string, string>();
  try {
    const admin = createAdminClient();
    const { data } = await admin.auth.admin.listUsers({ perPage: 1000 });
    emails = new Map(data.users.map((u) => [u.id, u.email ?? ""]));
  } catch {
    // Si falla, seguimos sin emails.
  }

  const clientes = perfiles.map((p) => {
    const validos = p.pedidos.filter((o) => o.estado !== "CANCELADO");
    return {
      id: p.id,
      nombre: p.nombre,
      celular: p.celular,
      rol: p.rol,
      activo: p.activo,
      email: emails.get(p.id) ?? "—",
      pedidos: p.pedidos.length,
      total: validos.reduce((s, o) => s + Number(o.total), 0),
    };
  });

  return (
    <div>
      <h1 className="font-display text-foreground text-2xl font-semibold sm:text-3xl">
        Clientes
      </h1>
      <p className="text-muted-foreground mt-1 text-sm">{clientes.length} registrados.</p>

      <div className="border-border bg-card mt-6 overflow-x-auto rounded-2xl border">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-border text-muted-foreground border-b text-left text-xs tracking-wide uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Celular</th>
              <th className="px-4 py-3 font-medium">Pedidos</th>
              <th className="px-4 py-3 text-right font-medium">Total gastado</th>
              <th className="px-4 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {clientes.map((c) => (
              <tr key={c.id} className="hover:bg-secondary/40">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/clientes/${c.id}`}
                    className="text-primary font-medium hover:underline"
                  >
                    {c.nombre}
                  </Link>
                  <div className="text-muted-foreground text-xs">{c.email}</div>
                </td>
                <td className="text-foreground/80 px-4 py-3">{c.celular ?? "—"}</td>
                <td className="text-foreground/80 px-4 py-3">{c.pedidos}</td>
                <td className="text-foreground px-4 py-3 text-right font-medium">
                  {soles(c.total)}
                </td>
                <td className="px-4 py-3">
                  <EstadoToggle
                    id={c.id}
                    activo={c.activo}
                    disabled={c.id === yo?.perfil.id}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
