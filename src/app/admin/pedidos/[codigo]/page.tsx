import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, ChevronLeft, ExternalLink, XCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatFecha } from "@/lib/date";
import { createAdminClient } from "@/lib/supabase/admin";
import { BUCKET } from "@/lib/supabase/storage";
import { validarPago, cambiarEstado } from "@/lib/pedido-actions";
import {
  ENTREGA_LABEL,
  ESTADO_LABEL,
  ESTADO_ORDEN,
  ESTADO_PAGO_LABEL,
  PAGO_LABEL,
  estadoBadge,
} from "@/lib/pedido-labels";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Detalle de pedido" };
export const dynamic = "force-dynamic";

const soles = (n: number) => `S/ ${n.toFixed(2)}`;

export default async function PedidoDetalle({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  const { codigo } = await params;
  const pedido = await prisma.pedido.findUnique({
    where: { codigo },
    include: {
      perfil: true,
      items: true,
      historial: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!pedido) notFound();

  let comprobanteUrl: string | null = null;
  let esImagen = false;
  if (pedido.comprobanteUrl) {
    const admin = createAdminClient();
    const { data } = await admin.storage
      .from(BUCKET.comprobantes)
      .createSignedUrl(pedido.comprobanteUrl, 3600);
    comprobanteUrl = data?.signedUrl ?? null;
    esImagen = /\.(jpe?g|png|webp|avif|heic|heif)$/i.test(pedido.comprobanteUrl);
  }

  const requiereComprobante = pedido.metodoPago !== "CONTRA_ENTREGA";

  return (
    <div className="max-w-4xl">
      <Link href="/admin/pedidos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ChevronLeft className="size-4" /> Pedidos
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-mono text-xl font-semibold text-foreground">{pedido.codigo}</h1>
          <p className="text-sm text-muted-foreground">{formatFecha(pedido.createdAt)}</p>
        </div>
        <span className={cn("inline-flex rounded-full px-3 py-1 text-sm font-medium", estadoBadge(pedido.estado))}>
          {ESTADO_LABEL[pedido.estado]}
        </span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Columna principal */}
        <div className="space-y-6">
          {/* Cliente */}
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold text-foreground">Cliente</h2>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-xs uppercase tracking-wide text-muted-foreground">Nombre</dt><dd className="text-foreground">{pedido.perfil.nombre}</dd></div>
              <div><dt className="text-xs uppercase tracking-wide text-muted-foreground">Celular</dt><dd className="text-foreground">{pedido.perfil.celular ?? "—"}</dd></div>
              <div><dt className="text-xs uppercase tracking-wide text-muted-foreground">DNI/RUC</dt><dd className="text-foreground">{pedido.perfil.dni ?? "—"}</dd></div>
              <div><dt className="text-xs uppercase tracking-wide text-muted-foreground">Entrega</dt><dd className="text-foreground">{ENTREGA_LABEL[pedido.metodoEntrega]}</dd></div>
            </dl>
            {pedido.observaciones && (
              <p className="mt-3 rounded-xl bg-secondary px-4 py-3 text-sm text-muted-foreground">
                {pedido.observaciones}
              </p>
            )}
          </section>

          {/* Items */}
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold text-foreground">Productos</h2>
            <ul className="mt-3 divide-y divide-border">
              {pedido.items.map((it) => (
                <li key={it.id} className="flex justify-between gap-3 py-2.5 text-sm">
                  <span className="text-foreground/80">{it.cantidad}× {it.nombreProducto}</span>
                  <span className="shrink-0 font-medium text-foreground">{soles(Number(it.precioUnitario) * it.cantidad)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-3 space-y-1.5 border-t border-border pt-3 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="text-foreground">{soles(Number(pedido.subtotal))}</dd></div>
              {Number(pedido.descuento) > 0 && (
                <div className="flex justify-between text-[color:var(--chart-5)]"><dt>Descuento{pedido.cuponCodigo ? ` (${pedido.cuponCodigo})` : ""}</dt><dd className="font-medium">−{soles(Number(pedido.descuento))}</dd></div>
              )}
              <div className="flex justify-between"><dt className="text-muted-foreground">Envío</dt><dd className="text-foreground">{soles(Number(pedido.costoEnvio))}</dd></div>
              <div className="flex justify-between border-t border-border pt-1.5 font-semibold"><dt className="text-foreground">Total</dt><dd className="text-foreground">{soles(Number(pedido.total))}</dd></div>
            </dl>
          </section>

          {/* Historial */}
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold text-foreground">Historial</h2>
            <ol className="mt-3 space-y-3">
              {pedido.historial.map((h) => (
                <li key={h.id} className="flex gap-3">
                  <span className="mt-1 size-2.5 shrink-0 rounded-full bg-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{ESTADO_LABEL[h.estado] ?? h.estado}</p>
                    {h.nota && <p className="text-sm text-muted-foreground">{h.nota}</p>}
                    <p className="text-xs text-muted-foreground">{formatFecha(h.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* Columna lateral: acciones */}
        <div className="space-y-6">
          {/* Pago */}
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold text-foreground">Pago</h2>
            <p className="mt-2 text-sm text-foreground/80">{PAGO_LABEL[pedido.metodoPago]}</p>
            <p className="mt-1 text-sm">
              Estado: <span className="font-medium text-foreground">{ESTADO_PAGO_LABEL[pedido.estadoPago]}</span>
            </p>

            {requiereComprobante && (
              <div className="mt-4">
                {comprobanteUrl ? (
                  <>
                    {esImagen && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={comprobanteUrl} alt="Comprobante" className="mb-2 max-h-56 w-full rounded-xl border border-border object-contain" />
                    )}
                    <a href={comprobanteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                      <ExternalLink className="size-4" /> Ver comprobante
                    </a>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Sin comprobante aún.</p>
                )}
              </div>
            )}

            {pedido.estado !== "CANCELADO" && pedido.estadoPago !== "VALIDADO" && (
              <div className="mt-4 flex gap-2">
                <form action={validarPago.bind(null, pedido.codigo, "VALIDADO")} className="flex-1">
                  <button type="submit" className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:-translate-y-0.5 transition-transform">
                    <CheckCircle2 className="size-4" /> Validar
                  </button>
                </form>
                <form action={validarPago.bind(null, pedido.codigo, "OBSERVADO")}>
                  <button type="submit" title="Observar" className="inline-flex size-10 items-center justify-center rounded-full border border-border text-foreground hover:bg-secondary">
                    <XCircle className="size-4" />
                  </button>
                </form>
              </div>
            )}
          </section>

          {/* Estado */}
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold text-foreground">Cambiar estado</h2>
            <form action={cambiarEstado.bind(null, pedido.codigo)} className="mt-3 space-y-3">
              <select
                name="estado"
                defaultValue={pedido.estado}
                className="h-11 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground outline-none focus-visible:border-ring"
              >
                {ESTADO_ORDEN.map((e) => (
                  <option key={e} value={e}>{ESTADO_LABEL[e]}</option>
                ))}
              </select>
              <button type="submit" className="inline-flex h-10 w-full items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background hover:bg-foreground/90">
                Actualizar estado
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
