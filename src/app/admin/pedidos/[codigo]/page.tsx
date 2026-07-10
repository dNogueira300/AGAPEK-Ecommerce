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
  humanizarNota,
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
    <div className="mx-auto max-w-4xl">
      <Link
        href="/admin/pedidos"
        className="text-muted-foreground hover:text-primary inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="size-4" /> Pedidos
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-foreground font-mono text-xl font-semibold">
            {pedido.codigo}
          </h1>
          <p className="text-muted-foreground text-sm">{formatFecha(pedido.createdAt)}</p>
        </div>
        <span
          className={cn(
            "inline-flex rounded-full px-3 py-1 text-sm font-medium",
            estadoBadge(pedido.estado),
          )}
        >
          {ESTADO_LABEL[pedido.estado]}
        </span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Columna principal */}
        <div className="space-y-6">
          {/* Cliente */}
          <section className="border-border bg-card rounded-2xl border p-6">
            <h2 className="font-display text-foreground text-lg font-semibold">
              Cliente
            </h2>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground text-xs tracking-wide uppercase">
                  Nombre
                </dt>
                <dd className="text-foreground">{pedido.perfil.nombre}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs tracking-wide uppercase">
                  Celular
                </dt>
                <dd className="text-foreground">{pedido.perfil.celular ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs tracking-wide uppercase">
                  DNI/RUC
                </dt>
                <dd className="text-foreground">{pedido.perfil.dni ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs tracking-wide uppercase">
                  Entrega
                </dt>
                <dd className="text-foreground">{ENTREGA_LABEL[pedido.metodoEntrega]}</dd>
              </div>
            </dl>
            {pedido.observaciones && (
              <p className="bg-secondary text-muted-foreground mt-3 rounded-xl px-4 py-3 text-sm">
                {pedido.observaciones}
              </p>
            )}
          </section>

          {/* Items */}
          <section className="border-border bg-card rounded-2xl border p-6">
            <h2 className="font-display text-foreground text-lg font-semibold">
              Productos
            </h2>
            <ul className="divide-border mt-3 divide-y">
              {pedido.items.map((it) => (
                <li key={it.id} className="flex justify-between gap-3 py-2.5 text-sm">
                  <span className="text-foreground/80">
                    {it.cantidad}× {it.nombreProducto}
                  </span>
                  <span className="text-foreground shrink-0 font-medium">
                    {soles(Number(it.precioUnitario) * it.cantidad)}
                  </span>
                </li>
              ))}
            </ul>
            <dl className="border-border mt-3 space-y-1.5 border-t pt-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="text-foreground">{soles(Number(pedido.subtotal))}</dd>
              </div>
              {Number(pedido.descuento) > 0 && (
                <div className="flex justify-between text-[color:var(--chart-5)]">
                  <dt>Descuento{pedido.cuponCodigo ? ` (${pedido.cuponCodigo})` : ""}</dt>
                  <dd className="font-medium">−{soles(Number(pedido.descuento))}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Envío</dt>
                <dd className="text-foreground">{soles(Number(pedido.costoEnvio))}</dd>
              </div>
              <div className="border-border flex justify-between border-t pt-1.5 font-semibold">
                <dt className="text-foreground">Total</dt>
                <dd className="text-foreground">{soles(Number(pedido.total))}</dd>
              </div>
            </dl>
          </section>

          {/* Historial */}
          <section className="border-border bg-card rounded-2xl border p-6">
            <h2 className="font-display text-foreground text-lg font-semibold">
              Historial
            </h2>
            <ol className="mt-3 space-y-3">
              {pedido.historial.map((h) => (
                <li key={h.id} className="flex gap-3">
                  <span className="bg-primary mt-1 size-2.5 shrink-0 rounded-full" />
                  <div>
                    <p className="text-foreground text-sm font-medium">
                      {ESTADO_LABEL[h.estado] ?? h.estado}
                    </p>
                    {h.nota && (
                      <p className="text-muted-foreground text-sm">
                        {humanizarNota(h.nota)}
                      </p>
                    )}
                    <p className="text-muted-foreground text-xs">
                      {formatFecha(h.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* Columna lateral: acciones */}
        <div className="space-y-6">
          {/* Pago */}
          <section className="border-border bg-card rounded-2xl border p-6">
            <h2 className="font-display text-foreground text-lg font-semibold">Pago</h2>
            <p className="text-foreground/80 mt-2 text-sm">
              {PAGO_LABEL[pedido.metodoPago]}
            </p>
            <p className="mt-1 text-sm">
              Estado:{" "}
              <span className="text-foreground font-medium">
                {ESTADO_PAGO_LABEL[pedido.estadoPago]}
              </span>
            </p>

            {requiereComprobante && (
              <div className="mt-4">
                {comprobanteUrl ? (
                  <>
                    {esImagen && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={comprobanteUrl}
                        alt="Comprobante"
                        className="border-border mb-2 max-h-56 w-full rounded-xl border object-contain"
                      />
                    )}
                    <a
                      href={comprobanteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
                    >
                      <ExternalLink className="size-4" /> Ver comprobante
                    </a>
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">Sin comprobante aún.</p>
                )}
              </div>
            )}

            {pedido.estado !== "CANCELADO" && pedido.estadoPago !== "VALIDADO" && (
              <div className="mt-4 flex gap-2">
                <form
                  action={validarPago.bind(null, pedido.codigo, "VALIDADO")}
                  className="flex-1"
                >
                  <button
                    type="submit"
                    className="bg-primary text-primary-foreground inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-full text-sm font-semibold transition-transform hover:-translate-y-0.5"
                  >
                    <CheckCircle2 className="size-4" /> Validar
                  </button>
                </form>
                <form action={validarPago.bind(null, pedido.codigo, "OBSERVADO")}>
                  <button
                    type="submit"
                    title="Observar"
                    className="border-border text-foreground hover:bg-secondary inline-flex size-10 items-center justify-center rounded-full border"
                  >
                    <XCircle className="size-4" />
                  </button>
                </form>
              </div>
            )}
          </section>

          {/* Estado */}
          <section className="border-border bg-card rounded-2xl border p-6">
            <h2 className="font-display text-foreground text-lg font-semibold">
              Cambiar estado
            </h2>
            <form
              action={cambiarEstado.bind(null, pedido.codigo)}
              className="mt-3 space-y-3"
            >
              <select
                key={pedido.estado}
                name="estado"
                defaultValue={pedido.estado}
                className="border-input bg-card text-foreground focus-visible:border-ring h-11 w-full rounded-xl border px-4 text-sm outline-none"
              >
                {ESTADO_ORDEN.map((e) => (
                  <option key={e} value={e}>
                    {ESTADO_LABEL[e]}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="bg-foreground text-background hover:bg-foreground/90 inline-flex h-10 w-full items-center justify-center rounded-full text-sm font-semibold"
              >
                Actualizar estado
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
