"use server";

import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ENTREGA_LABEL } from "@/lib/pedido-labels";
import { getUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { BUCKET } from "@/lib/supabase/storage";
import { calcularDescuento } from "@/lib/cupon";

const itemSchema = z.object({
  slug: z.string().min(1),
  cantidad: z.number().int().positive(),
});

const checkoutSchema = z.object({
  nombre: z.string().min(2, "Ingresa tu nombre completo."),
  dni: z.string().optional(),
  celular: z.string().min(6, "Ingresa un celular válido."),
  metodoEntrega: z.enum(["DELIVERY_LOCAL", "ENVIO_NACIONAL", "RECOJO_ALMACEN"]),
  zona: z.enum(["centrica", "otras"]).optional(),
  direccion: z.string().optional(),
  distrito: z.string().optional(),
  referencia: z.string().optional(),
  metodoPago: z.enum(["CONTRA_ENTREGA", "YAPE", "PLIN", "TRANSFERENCIA", "DEPOSITO"]),
  observaciones: z.string().optional(),
  cupon: z.string().optional(),
  items: z.array(itemSchema).min(1, "Tu carrito está vacío."),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CrearPedidoResult = { codigo: string } | { error: string };

async function costoEnvio(
  metodo: CheckoutInput["metodoEntrega"],
  zona?: CheckoutInput["zona"],
): Promise<number> {
  if (metodo !== "DELIVERY_LOCAL") return 0; // recojo / nacional (por coordinar)
  const cfg = await prisma.configuracion.findMany({
    where: { clave: { in: ["delivery_centrico", "delivery_otras"] } },
  });
  const map = Object.fromEntries(cfg.map((c) => [c.clave, Number(c.valor)]));
  return zona === "otras" ? (map.delivery_otras ?? 10) : (map.delivery_centrico ?? 5);
}

function generarCodigo(): string {
  const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Array.from({ length: 4 }, () =>
    "ABCDEFGHJKMNPQRSTUVWXYZ23456789".charAt(Math.floor(Math.random() * 30)),
  ).join("");
  return `AGK-${fecha}-${rand}`;
}

export async function crearPedido(raw: CheckoutInput): Promise<CrearPedidoResult> {
  const user = await getUser();
  if (!user) return { error: "Debes iniciar sesión para comprar." };

  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const input = parsed.data;

  if (input.metodoEntrega === "DELIVERY_LOCAL" && (!input.direccion || !input.distrito)) {
    return { error: "Ingresa la dirección y distrito de entrega." };
  }

  // Cargar productos reales y validar precio/stock (nunca confiar en el cliente).
  const productos = await prisma.producto.findMany({
    where: { slug: { in: input.items.map((i) => i.slug) }, activo: true },
  });
  const porSlug = new Map(productos.map((p) => [p.slug, p]));

  const lineas = input.items.map((i) => {
    const p = porSlug.get(i.slug);
    if (!p) throw new Error(`Producto no disponible: ${i.slug}`);
    const precio = Number(p.precioOferta ?? p.precio);
    return { producto: p, cantidad: i.cantidad, precio };
  });

  for (const l of lineas) {
    if (l.producto.stock < l.cantidad) {
      return { error: `Sin stock suficiente de ${l.producto.nombre}.` };
    }
  }

  const subtotal = lineas.reduce((s, l) => s + l.precio * l.cantidad, 0);
  const envio = await costoEnvio(input.metodoEntrega, input.zona);

  // Cupón (revalidado en servidor; nunca se confía en el descuento del cliente).
  let descuento = 0;
  let cuponId: string | null = null;
  let cuponCodigo: string | null = null;
  if (input.cupon?.trim()) {
    const codigo = input.cupon.trim().toUpperCase();
    const cupon = await prisma.cupon.findUnique({ where: { codigo } });
    const now = new Date();
    const invalido =
      !cupon ||
      !cupon.activo ||
      (cupon.inicioAt && now < cupon.inicioAt) ||
      (cupon.finAt && now > cupon.finAt) ||
      (cupon.usoMaximo != null && cupon.usos >= cupon.usoMaximo) ||
      subtotal < Number(cupon.minCompra);
    if (invalido) {
      return { error: "El cupón ya no es válido. Revísalo e inténtalo de nuevo." };
    }
    descuento = calcularDescuento(cupon!.tipo, Number(cupon!.valor), subtotal);
    cuponId = cupon!.id;
    cuponCodigo = cupon!.codigo;
  }

  const total = Math.max(0, subtotal - descuento) + envio;

  // Actualiza datos de contacto del perfil (best-effort).
  await prisma.perfil.update({
    where: { id: user.id },
    data: { nombre: input.nombre, celular: input.celular, dni: input.dni ?? undefined },
  });

  // Reintenta ante colisión de código único.
  for (let intento = 0; intento < 5; intento++) {
    const codigo = generarCodigo();
    try {
      await prisma.$transaction(async (tx) => {
        // Reserva de stock: descuenta solo si hay disponibilidad (evita overselling).
        for (const l of lineas) {
          const upd = await tx.producto.updateMany({
            where: { id: l.producto.id, stock: { gte: l.cantidad } },
            data: { stock: { decrement: l.cantidad } },
          });
          if (upd.count !== 1) throw new Error(`Sin stock: ${l.producto.nombre}`);
        }

        // Consumo atómico del cupón (respeta el límite de usos ante concurrencia).
        if (cuponId) {
          const upd = await tx.cupon.updateMany({
            where: {
              id: cuponId,
              activo: true,
              OR: [{ usoMaximo: null }, { usos: { lt: prisma.cupon.fields.usoMaximo } }],
            },
            data: { usos: { increment: 1 } },
          });
          if (upd.count !== 1) throw new Error("Cupón sin cupos");
        }

        await tx.pedido.create({
          data: {
            codigo,
            perfilId: user.id,
            metodoPago: input.metodoPago,
            metodoEntrega: input.metodoEntrega,
            costoEnvio: new Prisma.Decimal(envio),
            subtotal: new Prisma.Decimal(subtotal),
            descuento: new Prisma.Decimal(descuento),
            cuponCodigo,
            total: new Prisma.Decimal(total),
            observaciones: input.observaciones,
            items: {
              create: lineas.map((l) => ({
                productoId: l.producto.id,
                nombreProducto: l.producto.nombre,
                precioUnitario: new Prisma.Decimal(l.precio),
                cantidad: l.cantidad,
              })),
            },
            historial: {
              create: {
                estado: "PENDIENTE",
                nota:
                  input.metodoEntrega === "DELIVERY_LOCAL"
                    ? `Entrega: ${input.direccion}, ${input.distrito}${input.referencia ? ` (${input.referencia})` : ""}`
                    : `Entrega: ${ENTREGA_LABEL[input.metodoEntrega] ?? input.metodoEntrega}`,
              },
            },
          },
        });
      });
      return { codigo };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.startsWith("Sin stock")) {
        return { error: "Uno de los productos se quedó sin stock. Revisa tu carrito." };
      }
      if (msg.startsWith("Cupón sin cupos")) {
        return { error: "El cupón alcanzó su límite de usos." };
      }
      // Colisión de código u otro error transitorio → reintenta.
      if (intento === 4)
        return { error: "No se pudo crear el pedido. Intenta de nuevo." };
    }
  }
  return { error: "No se pudo crear el pedido. Intenta de nuevo." };
}

export type ComprobanteResult = { ok: true } | { error: string };

export async function subirComprobante(
  codigo: string,
  formData: FormData,
): Promise<ComprobanteResult> {
  const file = formData.get("comprobante");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecciona un archivo." };
  }
  if (file.size > 50 * 1024 * 1024) return { error: "El archivo supera los 50 MB." };

  const pedido = await prisma.pedido.findUnique({ where: { codigo } });
  if (!pedido) return { error: "Pedido no encontrado." };

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const path = `${codigo}/${Date.now()}.${ext}`;

  const admin = createAdminClient();
  const { error: upErr } = await admin.storage
    .from(BUCKET.comprobantes)
    .upload(path, file, { contentType: file.type, upsert: true });
  if (upErr) return { error: "No se pudo subir el comprobante." };

  await prisma.pedido.update({
    where: { codigo },
    data: {
      comprobanteUrl: path,
      estadoPago: "ENVIADO",
      estado: "COMPROBANTE_ENVIADO",
      historial: {
        create: { estado: "COMPROBANTE_ENVIADO", nota: "Comprobante de pago enviado." },
      },
    },
  });

  return { ok: true };
}
