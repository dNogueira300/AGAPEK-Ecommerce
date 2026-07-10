export const ESTADO_LABEL: Record<string, string> = {
  PENDIENTE: "Pendiente",
  COMPROBANTE_ENVIADO: "Comprobante enviado",
  PAGO_VALIDADO: "Pago validado",
  EN_PREPARACION: "En preparación",
  LISTO_RECOJO: "Listo para recojo",
  ENVIADO: "Enviado",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

export const ESTADO_ORDEN = [
  "PENDIENTE",
  "COMPROBANTE_ENVIADO",
  "PAGO_VALIDADO",
  "EN_PREPARACION",
  "LISTO_RECOJO",
  "ENVIADO",
  "ENTREGADO",
  "CANCELADO",
] as const;

export const ENTREGA_LABEL: Record<string, string> = {
  DELIVERY_LOCAL: "Delivery en Iquitos",
  ENVIO_NACIONAL: "Envío nacional",
  RECOJO_ALMACEN: "Recojo en almacén",
};

export const PAGO_LABEL: Record<string, string> = {
  CONTRA_ENTREGA: "Pago contra entrega",
  YAPE: "Yape",
  PLIN: "Plin",
  TRANSFERENCIA: "Transferencia BCP",
  DEPOSITO: "Depósito BCP",
};

export const ESTADO_PAGO_LABEL: Record<string, string> = {
  PENDIENTE: "Pendiente",
  ENVIADO: "Comprobante enviado",
  VALIDADO: "Validado",
  OBSERVADO: "Observado",
};

/** Clases de color para el badge de estado. */
export function estadoBadge(estado: string): string {
  switch (estado) {
    case "ENTREGADO":
    case "PAGO_VALIDADO":
      return "bg-chart-5/15 text-[color:var(--chart-5)]";
    case "CANCELADO":
      return "bg-destructive/10 text-destructive";
    case "PENDIENTE":
    case "COMPROBANTE_ENVIADO":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-secondary text-foreground";
  }
}

/**
 * Reemplaza códigos internos (RECOJO_ALMACEN, YAPE…) por su etiqueta legible
 * dentro de una nota de historial. Cubre notas antiguas guardadas con el enum crudo.
 */
export function humanizarNota(nota: string): string {
  let out = nota;
  for (const [k, v] of [
    ...Object.entries(ENTREGA_LABEL),
    ...Object.entries(PAGO_LABEL),
  ]) {
    out = out.replace(new RegExp("\\b" + k + "\\b", "g"), v);
  }
  return out;
}
