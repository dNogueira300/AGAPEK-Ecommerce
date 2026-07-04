import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Clientes" };
export const dynamic = "force-dynamic";

const soles = (n: number) => `S/ ${n.toFixed(2)}`;

export default async function AdminClientes() {
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
      email: emails.get(p.id) ?? "—",
      pedidos: p.pedidos.length,
      total: validos.reduce((s, o) => s + Number(o.total), 0),
    };
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">Clientes</h1>
      <p className="mt-1 text-sm text-muted-foreground">{clientes.length} registrados.</p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Celular</th>
              <th className="px-4 py-3 font-medium">Pedidos</th>
              <th className="px-4 py-3 text-right font-medium">Total gastado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {clientes.map((c) => (
              <tr key={c.id} className="hover:bg-secondary/40">
                <td className="px-4 py-3">
                  <Link href={`/admin/clientes/${c.id}`} className="font-medium text-primary hover:underline">
                    {c.nombre}
                  </Link>
                  <div className="text-xs text-muted-foreground">{c.email}</div>
                </td>
                <td className="px-4 py-3 text-foreground/80">{c.celular ?? "—"}</td>
                <td className="px-4 py-3 text-foreground/80">{c.pedidos}</td>
                <td className="px-4 py-3 text-right font-medium text-foreground">{soles(c.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
