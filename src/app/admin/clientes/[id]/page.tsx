import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Mail, Phone, User } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatFecha } from "@/lib/date";
import { ESTADO_LABEL, estadoBadge } from "@/lib/pedido-labels";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Cliente" };
export const dynamic = "force-dynamic";

const soles = (n: number) => `S/ ${n.toFixed(2)}`;

export default async function ClienteDetalle({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const perfil = await prisma.perfil.findUnique({
    where: { id },
    include: { pedidos: { orderBy: { createdAt: "desc" } } },
  });
  if (!perfil) notFound();

  let email = "—";
  try {
    const admin = createAdminClient();
    const { data } = await admin.auth.admin.getUserById(id);
    email = data.user?.email ?? "—";
  } catch {}

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/admin/clientes"
        className="text-muted-foreground hover:text-primary inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="size-4" /> Clientes
      </Link>

      <section className="border-border bg-card mt-4 rounded-2xl border p-6">
        <div className="flex items-center gap-4">
          <span className="bg-secondary text-primary flex size-14 items-center justify-center rounded-full">
            <User className="size-7" />
          </span>
          <div>
            <h1 className="font-display text-foreground text-xl font-semibold">
              {perfil.nombre}
            </h1>
            <div className="text-muted-foreground mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <span className="flex items-center gap-1.5">
                <Mail className="size-3.5" />
                {email}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="size-3.5" />
                {perfil.celular ?? "—"}
              </span>
            </div>
          </div>
        </div>
      </section>

      <h2 className="font-display text-foreground mt-8 text-lg font-semibold">
        Pedidos ({perfil.pedidos.length})
      </h2>
      <div className="border-border bg-card mt-3 overflow-x-auto rounded-2xl border">
        <table className="w-full min-w-[520px] text-sm">
          <thead className="border-border text-muted-foreground border-b text-left text-xs tracking-wide uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Código</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {perfil.pedidos.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-muted-foreground px-4 py-6 text-center">
                  Sin pedidos.
                </td>
              </tr>
            ) : (
              perfil.pedidos.map((p) => (
                <tr key={p.id} className="hover:bg-secondary/40">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/pedidos/${p.codigo}`}
                      className="text-primary font-mono text-xs font-medium hover:underline"
                    >
                      {p.codigo}
                    </Link>
                    <div className="text-muted-foreground text-xs">
                      {formatFecha(p.createdAt, "dd/MM HH:mm")}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                        estadoBadge(p.estado),
                      )}
                    >
                      {ESTADO_LABEL[p.estado]}
                    </span>
                  </td>
                  <td className="text-foreground px-4 py-3 text-right font-medium">
                    {soles(Number(p.total))}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
