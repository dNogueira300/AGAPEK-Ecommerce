"use server";

import { z } from "zod";
import { Prisma, type TipoCupon } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { fromZonedTime } from "date-fns-tz";
import { prisma } from "@/lib/prisma";
import { requireRoles } from "@/lib/auth";
import { calcularDescuento } from "@/lib/cupon";
import { APP_TZ } from "@/lib/date";

// ------------------------- Validación pública -------------------------

export interface CuponAplicado {
  codigo: string;
  tipo: TipoCupon;
  valor: number;
  descuento: number;
  descripcion: string | null;
}
export type ValidarCuponResult = CuponAplicado | { error: string };

/** Valida un cupón contra un subtotal. Público (se usa en el checkout). */
export async function validarCupon(
  codigoRaw: string,
  subtotal: number,
): Promise<ValidarCuponResult> {
  const codigo = codigoRaw.trim().toUpperCase();
  if (!codigo) return { error: "Ingresa un código." };

  const c = await prisma.cupon.findUnique({ where: { codigo } });
  if (!c || !c.activo) return { error: "Cupón no válido." };

  const now = new Date();
  if (c.inicioAt && now < c.inicioAt) return { error: "Este cupón aún no está vigente." };
  if (c.finAt && now > c.finAt) return { error: "Este cupón ya expiró." };
  if (c.usoMaximo != null && c.usos >= c.usoMaximo) {
    return { error: "Este cupón alcanzó su límite de usos." };
  }
  const min = Number(c.minCompra);
  if (subtotal < min) {
    return { error: `Requiere una compra mínima de S/ ${min.toFixed(2)}.` };
  }

  const descuento = calcularDescuento(c.tipo, Number(c.valor), subtotal);
  if (descuento <= 0) return { error: "Cupón no aplicable a este pedido." };

  return {
    codigo: c.codigo,
    tipo: c.tipo,
    valor: Number(c.valor),
    descuento,
    descripcion: c.descripcion,
  };
}

// ----------------------------- CRUD admin -----------------------------

async function requireContenido() {
  await requireRoles(["ADMIN", "TECNICO"]);
}

function parseFecha(valor: string | null, fin = false): Date | null {
  if (!valor) return null;
  // Input type="date" → interpretamos en zona Lima (inicio/fin del día).
  return fromZonedTime(`${valor}T${fin ? "23:59:59" : "00:00:00"}`, APP_TZ);
}

const schema = z.object({
  codigo: z.string().min(3, "El código debe tener al menos 3 caracteres."),
  descripcion: z.string().optional(),
  tipo: z.enum(["PORCENTAJE", "MONTO_FIJO"]),
  valor: z.number().positive("El valor debe ser mayor a 0."),
  minCompra: z.number().nonnegative(),
  usoMaximo: z.number().int().positive().nullable(),
  activo: z.boolean(),
});

export type CuponState = { error?: string };

export async function guardarCupon(
  _prev: CuponState,
  formData: FormData,
): Promise<CuponState> {
  await requireContenido();
  const id = (formData.get("id") as string) || null;

  const usoMaximoRaw = (formData.get("usoMaximo") as string) || "";
  const parsed = schema.safeParse({
    codigo: ((formData.get("codigo") as string) || "").trim().toUpperCase(),
    descripcion: (formData.get("descripcion") as string) || undefined,
    tipo: formData.get("tipo"),
    valor: Number(formData.get("valor") ?? 0),
    minCompra: Number(formData.get("minCompra") ?? 0),
    usoMaximo: usoMaximoRaw ? Number(usoMaximoRaw) : null,
    activo: formData.get("activo") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const d = parsed.data;
  if (d.tipo === "PORCENTAJE" && d.valor > 100) {
    return { error: "El porcentaje no puede superar 100." };
  }

  const datos = {
    codigo: d.codigo,
    descripcion: d.descripcion ?? null,
    tipo: d.tipo,
    valor: new Prisma.Decimal(d.valor),
    minCompra: new Prisma.Decimal(d.minCompra),
    usoMaximo: d.usoMaximo,
    activo: d.activo,
    inicioAt: parseFecha(formData.get("inicioAt") as string | null),
    finAt: parseFecha(formData.get("finAt") as string | null, true),
  };

  try {
    if (id) {
      await prisma.cupon.update({ where: { id }, data: datos });
    } else {
      await prisma.cupon.create({ data: datos });
    }
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "Ya existe un cupón con ese código." };
    }
    return { error: "No se pudo guardar el cupón." };
  }

  revalidatePath("/admin/cupones");
  redirect("/admin/cupones");
}

export async function toggleActivoCupon(id: string) {
  await requireContenido();
  const c = await prisma.cupon.findUnique({ where: { id }, select: { activo: true } });
  if (c) {
    await prisma.cupon.update({ where: { id }, data: { activo: !c.activo } });
    revalidatePath("/admin/cupones");
  }
}

export async function eliminarCupon(id: string) {
  await requireContenido();
  await prisma.cupon.delete({ where: { id } });
  revalidatePath("/admin/cupones");
}
