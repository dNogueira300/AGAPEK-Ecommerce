import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, MessageCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatFecha } from "@/lib/date";
import { construirMensajePedido, urlWhatsApp } from "@/lib/whatsapp";
import { ComprobanteUpload } from "@/components/tienda/comprobante-upload";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Seguimiento de pedido" };

const ESTADO_LABEL: Record<string, string> = {
  PENDIENTE: "Pendiente",
  COMPROBANTE_ENVIADO: "Comprobante enviado",
  PAGO_VALIDADO: "Pago validado",
  EN_PREPARACION: "En preparación",
  LISTO_RECOJO: "Listo para recojo",
  ENVIADO: "Enviado",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};
const ENTREGA_LABEL: Record<string, string> = {
  DELIVERY_LOCAL: "Delivery en Iquitos",
  ENVIO_NACIONAL: "Envío nacional",
  RECOJO_ALMACEN: "Recojo en almacén",
};
const PAGO_LABEL: Record<string, string> = {
  CONTRA_ENTREGA: "Pago contra entrega",
  YAPE: "Yape",
  PLIN: "Plin",
  TRANSFERENCIA: "Transferencia BCP",
  DEPOSITO: "Depósito BCP",
};

const soles = (n: number) => `S/ ${n.toFixed(2)}`;

export default async function PedidoPage({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  const { codigo } = await params;
  const pedido = await prisma.pedido.findUnique({
    where: { codigo },
    include: {
      items: true,
      historial: { orderBy: { createdAt: "asc" } },
      perfil: true,
    },
  });
  if (!pedido) notFound();

  const cfg = await prisma.configuracion.findUnique({ where: { clave: "whatsapp" } });
  const whatsapp = typeof cfg?.valor === "string" ? cfg.valor : null;

  const waUrl = whatsapp
    ? urlWhatsApp(
        whatsapp,
        construirMensajePedido({
          codigo: pedido.codigo,
          cliente: pedido.perfil.nombre,
          items: pedido.items.map((i) => ({
            nombre: i.nombreProducto,
            cantidad: i.cantidad,
            precioUnitario: Number(i.precioUnitario),
          })),
          costoEnvio: Number(pedido.costoEnvio),
          total: Number(pedido.total),
          metodoEntrega: ENTREGA_LABEL[pedido.metodoEntrega] ?? pedido.metodoEntrega,
          metodoPago: PAGO_LABEL[pedido.metodoPago] ?? pedido.metodoPago,
        }),
      )
    : null;

  const requiereComprobante = pedido.metodoPago !== "CONTRA_ENTREGA";
  const cancelado = pedido.estado === "CANCELADO";

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Encabezado */}
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <span
          className={`mx-auto flex size-14 items-center justify-center rounded-full ${cancelado ? "bg-destructive/10 text-destructive" : "bg-chart-5/15 text-[color:var(--chart-5)]"}`}
        >
          <CheckCircle2 className="size-7" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-semibold text-foreground">
          {cancelado ? "Pedido cancelado" : "¡Pedido registrado!"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tu código de seguimiento es
        </p>
        <p className="mt-1 font-mono text-lg font-semibold tracking-wide text-primary">
          {pedido.codigo}
        </p>
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-sm font-medium text-foreground">
          <Clock className="size-3.5" />
          {ESTADO_LABEL[pedido.estado] ?? pedido.estado}
        </span>

        {waUrl && (
          <div className="mt-6">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5"
            >
              <MessageCircle className="size-4.5" />
              Enviar pedido por WhatsApp
            </a>
            <p className="mt-2 text-xs text-muted-foreground">
              Envíanos el resumen para confirmar y coordinar la entrega.
            </p>
          </div>
        )}
      </div>

      {/* Comprobante */}
      {requiereComprobante && !cancelado && (
        <div className="mt-6 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Comprobante de pago
          </h2>
          {pedido.comprobanteUrl ? (
            <p className="mt-2 flex items-center gap-2 text-sm text-[color:var(--chart-5)]">
              <CheckCircle2 className="size-4" />
              Comprobante recibido. Validaremos tu pago pronto.
            </p>
          ) : (
            <>
              <p className="mt-1 text-sm text-muted-foreground">
                Sube tu comprobante ({PAGO_LABEL[pedido.metodoPago]}) para agilizar la validación.
              </p>
              <ComprobanteUpload codigo={pedido.codigo} />
            </>
          )}
        </div>
      )}

      {/* Resumen */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-semibold text-foreground">Resumen</h2>
        <ul className="mt-4 space-y-3">
          {pedido.items.map((it) => (
            <li key={it.id} className="flex justify-between gap-3 text-sm">
              <span className="text-foreground/80">
                {it.cantidad}× {it.nombreProducto}
              </span>
              <span className="shrink-0 font-medium text-foreground">
                {soles(Number(it.precioUnitario) * it.cantidad)}
              </span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="font-medium text-foreground">{soles(Number(pedido.subtotal))}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Envío</dt>
            <dd className="font-medium text-foreground">{soles(Number(pedido.costoEnvio))}</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-2">
            <dt className="font-semibold text-foreground">Total</dt>
            <dd className="font-semibold text-foreground">{soles(Number(pedido.total))}</dd>
          </div>
        </dl>
        <p className="mt-4 text-sm text-muted-foreground">
          Entrega: {ENTREGA_LABEL[pedido.metodoEntrega]} · Pago: {PAGO_LABEL[pedido.metodoPago]}
        </p>
      </div>

      {/* Historial */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Historial del pedido
        </h2>
        <ol className="mt-4 space-y-4">
          {pedido.historial.map((h) => (
            <li key={h.id} className="flex gap-3">
              <span className="mt-1 size-2.5 shrink-0 rounded-full bg-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {ESTADO_LABEL[h.estado] ?? h.estado}
                </p>
                {h.nota && <p className="text-sm text-muted-foreground">{h.nota}</p>}
                <p className="text-xs text-muted-foreground">{formatFecha(h.createdAt)}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
