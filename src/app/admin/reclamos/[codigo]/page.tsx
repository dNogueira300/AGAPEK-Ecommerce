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
      <dt className="text-muted-foreground text-xs tracking-wide uppercase">{label}</dt>
      <dd className="text-foreground mt-0.5 text-sm">{value || "—"}</dd>
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
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/reclamos"
        className="text-muted-foreground hover:text-primary inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="size-4" /> Reclamos
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-foreground font-mono text-xl font-semibold">{r.codigo}</h1>
          <p className="text-muted-foreground text-sm">
            {r.tipo === "RECLAMO" ? "Reclamo" : "Queja"} · {formatFecha(r.createdAt)}
          </p>
        </div>
        <span
          className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${r.atendido ? "bg-chart-5/15 text-[color:var(--chart-5)]" : "bg-amber-100 text-amber-700"}`}
        >
          {r.atendido ? "Atendido" : "Pendiente"}
        </span>
      </div>

      <section className="border-border bg-card mt-6 rounded-2xl border p-6">
        <h2 className="font-display text-foreground text-lg font-semibold">Consumidor</h2>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          <Dato label="Nombre" value={r.nombre} />
          <Dato label="Documento" value={r.documento} />
          <Dato label="Correo" value={r.email} />
          <Dato label="Teléfono" value={r.telefono} />
          <Dato label="Domicilio" value={r.domicilio} />
        </dl>
      </section>

      <section className="border-border bg-card mt-6 rounded-2xl border p-6">
        <h2 className="font-display text-foreground text-lg font-semibold">
          Bien y reclamo
        </h2>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          <Dato label="Tipo de bien" value={r.tipoBien} />
          <Dato
            label="Monto"
            value={r.monto ? `S/ ${Number(r.monto).toFixed(2)}` : null}
          />
          <Dato label="Descripción del bien" value={r.descripcionBien} />
          <Dato label="Pedido relacionado" value={r.pedidoConsumidor} />
        </dl>
        <div className="mt-4">
          <p className="text-muted-foreground text-xs tracking-wide uppercase">Detalle</p>
          <p className="text-foreground/85 mt-1 text-sm leading-relaxed whitespace-pre-line">
            {r.detalle}
          </p>
        </div>
      </section>

      <section className="border-border bg-card mt-6 rounded-2xl border p-6">
        <h2 className="font-display text-foreground text-lg font-semibold">Respuesta</h2>
        <form action={responderReclamo.bind(null, r.codigo)} className="mt-3 space-y-3">
          <textarea
            name="respuesta"
            rows={4}
            defaultValue={r.respuesta ?? ""}
            className="border-input bg-card text-foreground focus-visible:border-ring focus-visible:ring-ring/30 w-full rounded-xl border px-4 py-3 text-sm outline-none focus-visible:ring-2"
            placeholder="Escribe la respuesta al consumidor…"
          />
          <button
            type="submit"
            className="bg-primary text-primary-foreground inline-flex h-10 items-center justify-center rounded-full px-6 text-sm font-semibold transition-transform hover:-translate-y-0.5"
          >
            Guardar y marcar atendido
          </button>
        </form>
      </section>
    </div>
  );
}
