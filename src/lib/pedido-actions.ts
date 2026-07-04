"use server";

import { revalidatePath } from "next/cache";
import { EstadoPedido } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const ESTADOS = Object.values(EstadoPedido);

function revalidar(codigo: string) {
  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${codigo}`);
  revalidatePath(`/pedido/${codigo}`);
  revalidatePath("/admin");
}

/** Valida u observa el pago del pedido. */
export async function validarPago(
  codigo: string,
  resultado: "VALIDADO" | "OBSERVADO",
) {
  await requireAdmin();
  const pedido = await prisma.pedido.findUnique({ where: { codigo } });
  if (!pedido) return;

  if (resultado === "VALIDADO") {
    const avanza =
      pedido.estado === "PENDIENTE" || pedido.estado === "COMPROBANTE_ENVIADO";
    await prisma.pedido.update({
      where: { codigo },
      data: {
        estadoPago: "VALIDADO",
        ...(avanza ? { estado: "PAGO_VALIDADO" } : {}),
        historial: {
          create: { estado: avanza ? "PAGO_VALIDADO" : pedido.estado, nota: "Pago validado." },
        },
      },
    });
  } else {
    await prisma.pedido.update({
      where: { codigo },
      data: {
        estadoPago: "OBSERVADO",
        historial: { create: { estado: pedido.estado, nota: "Pago observado." } },
      },
    });
  }
  revalidar(codigo);
}

/** Cambia el estado del pedido (registrando historial). */
export async function cambiarEstado(codigo: string, formData: FormData) {
  await requireAdmin();
  const nuevo = String(formData.get("estado") ?? "");
  if (!ESTADOS.includes(nuevo as EstadoPedido)) return;
  const estado = nuevo as EstadoPedido;

  const pedido = await prisma.pedido.findUnique({
    where: { codigo },
    include: { items: true },
  });
  if (!pedido || pedido.estado === estado) return;

  await prisma.$transaction(async (tx) => {
    // Si se cancela un pedido no cancelado, se devuelve el stock reservado.
    if (estado === "CANCELADO" && pedido.estado !== "CANCELADO") {
      for (const it of pedido.items) {
        await tx.producto.update({
          where: { id: it.productoId },
          data: { stock: { increment: it.cantidad } },
        });
      }
    }
    await tx.pedido.update({
      where: { codigo },
      data: {
        estado,
        historial: { create: { estado, nota: `Estado cambiado a ${estado}.` } },
      },
    });
  });

  revalidar(codigo);
}
