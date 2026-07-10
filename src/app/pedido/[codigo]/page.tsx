import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, MessageCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getConfigValor } from "@/lib/cache";
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

  const whatsapp = await getConfigValor("whatsapp");

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
      <div className="border-border bg-card rounded-2xl border p-6 text-center">
        <span
          className={`mx-auto flex size-14 items-center justify-center rounded-full ${cancelado ? "bg-destructive/10 text-destructive" : "bg-chart-5/15 text-[color:var(--chart-5)]"}`}
        >
          <CheckCircle2 className="size-7" />
        </span>
        <h1 className="font-display text-foreground mt-4 text-2xl font-semibold">
          {cancelado ? "Pedido cancelado" : "¡Pedido registrado!"}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">Tu código de seguimiento es</p>
        <p className="text-primary mt-1 font-mono text-lg font-semibold tracking-wide">
          {pedido.codigo}
        </p>
        <span className="bg-secondary text-foreground mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium">
          <Clock className="size-3.5" />
          {ESTADO_LABEL[pedido.estado] ?? pedido.estado}
        </span>

        {waUrl && (
          <div className="mt-6">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-sm transition-transform hover:-translate-y-0.5"
            >
              <MessageCircle className="size-4.5" />
              Enviar pedido por WhatsApp
            </a>
            <p className="text-muted-foreground mt-2 text-xs">
              Envíanos el resumen para confirmar y coordinar la entrega.
            </p>
          </div>
        )}
      </div>

      {/* Comprobante */}
      {requiereComprobante && !cancelado && (
        <div className="border-border bg-card mt-6 rounded-2xl border p-6">
          <h2 className="font-display text-foreground text-lg font-semibold">
            Comprobante de pago
          </h2>
          {pedido.comprobanteUrl ? (
            <p className="mt-2 flex items-center gap-2 text-sm text-[color:var(--chart-5)]">
              <CheckCircle2 className="size-4" />
              Comprobante recibido. Validaremos tu pago pronto.
            </p>
          ) : (
            <>
              <p className="text-muted-foreground mt-1 text-sm">
                Sube tu comprobante ({PAGO_LABEL[pedido.metodoPago]}) para agilizar la
                validación.
              </p>
              <ComprobanteUpload codigo={pedido.codigo} />
            </>
          )}
        </div>
      )}

      {/* Resumen */}
      <div className="border-border bg-card mt-6 rounded-2xl border p-6">
        <h2 className="font-display text-foreground text-lg font-semibold">Resumen</h2>
        <ul className="mt-4 space-y-3">
          {pedido.items.map((it) => (
            <li key={it.id} className="flex justify-between gap-3 text-sm">
              <span className="text-foreground/80">
                {it.cantidad}× {it.nombreProducto}
              </span>
              <span className="text-foreground shrink-0 font-medium">
                {soles(Number(it.precioUnitario) * it.cantidad)}
              </span>
            </li>
          ))}
        </ul>
        <dl className="border-border mt-4 space-y-2 border-t pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="text-foreground font-medium">
              {soles(Number(pedido.subtotal))}
            </dd>
          </div>
          {Number(pedido.descuento) > 0 && (
            <div className="flex justify-between text-[color:var(--chart-5)]">
              <dt>Descuento{pedido.cuponCodigo ? ` (${pedido.cuponCodigo})` : ""}</dt>
              <dd className="font-medium">−{soles(Number(pedido.descuento))}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Envío</dt>
            <dd className="text-foreground font-medium">
              {soles(Number(pedido.costoEnvio))}
            </dd>
          </div>
          <div className="border-border flex justify-between border-t pt-2">
            <dt className="text-foreground font-semibold">Total</dt>
            <dd className="text-foreground font-semibold">
              {soles(Number(pedido.total))}
            </dd>
          </div>
        </dl>
        <p className="text-muted-foreground mt-4 text-sm">
          Entrega: {ENTREGA_LABEL[pedido.metodoEntrega]} · Pago:{" "}
          {PAGO_LABEL[pedido.metodoPago]}
        </p>
      </div>

      {/* Historial */}
      <div className="border-border bg-card mt-6 rounded-2xl border p-6">
        <h2 className="font-display text-foreground text-lg font-semibold">
          Historial del pedido
        </h2>
        <ol className="mt-4 space-y-4">
          {pedido.historial.map((h) => (
            <li key={h.id} className="flex gap-3">
              <span className="bg-primary mt-1 size-2.5 shrink-0 rounded-full" />
              <div>
                <p className="text-foreground text-sm font-medium">
                  {ESTADO_LABEL[h.estado] ?? h.estado}
                </p>
                {h.nota && <p className="text-muted-foreground text-sm">{h.nota}</p>}
                <p className="text-muted-foreground text-xs">
                  {formatFecha(h.createdAt)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
