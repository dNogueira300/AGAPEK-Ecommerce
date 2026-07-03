/**
 * Genera el enlace de WhatsApp (wa.me) con el resumen del pedido prellenado.
 * El número de destino se lee de la configuración del negocio (tabla Configuracion),
 * nunca hardcodeado. Aquí solo se arma el mensaje y la URL.
 */

export interface ItemPedidoResumen {
  nombre: string;
  cantidad: number;
  precioUnitario: number;
}

export interface ResumenPedido {
  codigo: string;
  items: ItemPedidoResumen[];
  costoEnvio: number;
  total: number;
  metodoEntrega: string;
  metodoPago: string;
  cliente: string;
}

const soles = (n: number) => `S/ ${n.toFixed(2)}`;

/** Construye el texto del pedido para enviar por WhatsApp. */
export function construirMensajePedido(p: ResumenPedido): string {
  const lineas = [
    `¡Hola AGAPEK! 🌸 Quiero confirmar mi pedido *${p.codigo}*.`,
    "",
    `*Cliente:* ${p.cliente}`,
    "",
    "*Productos:*",
    ...p.items.map(
      (it) => `• ${it.cantidad}× ${it.nombre} — ${soles(it.precioUnitario * it.cantidad)}`,
    ),
    "",
    `*Entrega:* ${p.metodoEntrega}`,
    `*Pago:* ${p.metodoPago}`,
    `*Envío:* ${soles(p.costoEnvio)}`,
    `*Total:* ${soles(p.total)}`,
  ];
  return lineas.join("\n");
}

/**
 * Devuelve la URL wa.me lista para abrir.
 * @param telefono número en formato internacional sin "+" (p. ej. 51961075865)
 */
export function urlWhatsApp(telefono: string, mensaje: string): string {
  const numero = telefono.replace(/\D/g, "");
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}
