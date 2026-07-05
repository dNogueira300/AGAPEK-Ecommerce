import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatFecha } from "@/lib/date";
import { responderReclamo } from "@/lib/reclamo-actions";

export const metadata: Metadata = { title: "Reclamo" };
export const dynamic = "force-dynamic";

function Dato({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm text-foreground">{value || "—"}</dd>
    </div>
  );
}

export default async function ReclamoDetalle({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  const { codigo } = await params;
  const r = await prisma.reclamo.findUnique({ where: { codigo } });
  if (!r) notFound();

  return (
    <div className="max-w-3xl">
      <Link href="/admin/reclamos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ChevronLeft className="size-4" /> Reclamos
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-mono text-xl font-semibold text-foreground">{r.codigo}</h1>
          <p className="text-sm text-muted-foreground">{r.tipo === "RECLAMO" ? "Reclamo" : "Queja"} · {formatFecha(r.createdAt)}</p>
        </div>
        <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${r.atendido ? "bg-chart-5/15 text-[color:var(--chart-5)]" : "bg-amber-100 text-amber-700"}`}>
          {r.atendido ? "Atendido" : "Pendiente"}
        </span>
      </div>

      <section className="mt-6 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-semibold text-foreground">Consumidor</h2>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          <Dato label="Nombre" value={r.nombre} />
          <Dato label="Documento" value={r.documento} />
          <Dato label="Correo" value={r.email} />
          <Dato label="Teléfono" value={r.telefono} />
          <Dato label="Domicilio" value={r.domicilio} />
        </dl>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-semibold text-foreground">Bien y reclamo</h2>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          <Dato label="Tipo de bien" value={r.tipoBien} />
          <Dato label="Monto" value={r.monto ? `S/ ${Number(r.monto).toFixed(2)}` : null} />
          <Dato label="Descripción del bien" value={r.descripcionBien} />
          <Dato label="Pedido relacionado" value={r.pedidoConsumidor} />
        </dl>
        <div className="mt-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Detalle</p>
          <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-foreground/85">{r.detalle}</p>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-semibold text-foreground">Respuesta</h2>
        <form action={responderReclamo.bind(null, r.codigo)} className="mt-3 space-y-3">
          <textarea
            name="respuesta"
            rows={4}
            defaultValue={r.respuesta ?? ""}
            className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
            placeholder="Escribe la respuesta al consumidor…"
          />
          <button type="submit" className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:-translate-y-0.5 transition-transform">
            Guardar y marcar atendido
          </button>
        </form>
      </section>
    </div>
  );
}
