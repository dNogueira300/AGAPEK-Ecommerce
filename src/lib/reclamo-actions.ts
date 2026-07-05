"use server";

import { z } from "zod";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoles } from "@/lib/auth";

const schema = z.object({
  tipo: z.enum(["RECLAMO", "QUEJA"]),
  nombre: z.string().min(2, "Ingresa tu nombre."),
  documento: z.string().min(4, "Ingresa tu documento."),
  domicilio: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email("Correo inválido."),
  tipoBien: z.string().optional(),
  descripcionBien: z.string().optional(),
  monto: z.number().nonnegative().nullable(),
  detalle: z.string().min(10, "Describe tu reclamo con más detalle."),
  pedidoConsumidor: z.string().optional(),
});

export type CrearReclamoInput = z.infer<typeof schema>;
export type CrearReclamoResult = { codigo: string } | { error: string };

function generarCodigo(): string {
  const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Array.from({ length: 4 }, () =>
    "ABCDEFGHJKMNPQRSTUVWXYZ23456789".charAt(Math.floor(Math.random() * 30)),
  ).join("");
  return `HR-${fecha}-${rand}`;
}

export async function crearReclamo(
  raw: CrearReclamoInput,
): Promise<CrearReclamoResult> {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const d = parsed.data;

  for (let intento = 0; intento < 5; intento++) {
    const codigo = generarCodigo();
    try {
      await prisma.reclamo.create({
        data: {
          codigo,
          tipo: d.tipo,
          nombre: d.nombre,
          documento: d.documento,
          domicilio: d.domicilio ?? null,
          telefono: d.telefono ?? null,
          email: d.email,
          tipoBien: d.tipoBien ?? null,
          descripcionBien: d.descripcionBien ?? null,
          monto: d.monto != null ? new Prisma.Decimal(d.monto) : null,
          detalle: d.detalle,
          pedidoConsumidor: d.pedidoConsumidor ?? null,
        },
      });
      revalidatePath("/admin/reclamos");
      return { codigo };
    } catch {
      if (intento === 4) return { error: "No se pudo registrar. Intenta de nuevo." };
    }
  }
  return { error: "No se pudo registrar. Intenta de nuevo." };
}

export async function responderReclamo(codigo: string, formData: FormData) {
  await requireRoles(["ADMIN", "TECNICO"]);
  const respuesta = String(formData.get("respuesta") ?? "").trim();
  await prisma.reclamo.update({
    where: { codigo },
    data: { respuesta: respuesta || null, atendido: true },
  });
  revalidatePath("/admin/reclamos");
  revalidatePath(`/admin/reclamos/${codigo}`);
}
