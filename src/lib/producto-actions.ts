"use server";

import { z } from "zod";
import sharp from "sharp";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getPerfil, ROLES_ADMIN } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { BUCKET, CARPETA } from "@/lib/supabase/storage";

async function requireAdmin() {
  const d = await getPerfil();
  if (!d || !ROLES_ADMIN.includes(d.perfil.rol)) throw new Error("No autorizado");
  return d;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function subirImagen(file: File, slug: string): Promise<string> {
  const buf = Buffer.from(await file.arrayBuffer());
  const webp = await sharp(buf)
    .resize(800, 800, { fit: "cover", position: "attention" })
    .webp({ quality: 80 })
    .toBuffer();
  const path = `${CARPETA.productos}/${slug}-${Date.now()}.webp`;
  const admin = createAdminClient();
  const { error } = await admin.storage
    .from(BUCKET.publico)
    .upload(path, webp, { contentType: "image/webp", upsert: true });
  if (error) throw new Error("No se pudo subir la imagen");
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET.publico}/${path}`;
}

const schema = z.object({
  nombre: z.string().min(2, "El nombre es obligatorio."),
  descripcionCorta: z.string().optional(),
  descripcion: z.string().optional(),
  modoUso: z.string().optional(),
  precio: z.number().positive("El precio debe ser mayor a 0."),
  precioOferta: z.number().positive().nullable(),
  stock: z.number().int().min(0),
  categoriaId: z.string().min(1, "Elige una categoría."),
  marcaId: z.string().min(1, "Elige una marca."),
  tipoPiel: z.array(z.string()),
  necesidad: z.array(z.string()),
  destacado: z.boolean(),
  nuevo: z.boolean(),
  activo: z.boolean(),
});

export type ProductoState = { error?: string };

export async function guardarProducto(
  _prev: ProductoState,
  formData: FormData,
): Promise<ProductoState> {
  await requireAdmin();
  const id = (formData.get("id") as string) || null;

  const num = (v: FormDataEntryValue | null) =>
    v === null || v === "" ? null : Number(v);

  const parsed = schema.safeParse({
    nombre: formData.get("nombre"),
    descripcionCorta: (formData.get("descripcionCorta") as string) || undefined,
    descripcion: (formData.get("descripcion") as string) || undefined,
    modoUso: (formData.get("modoUso") as string) || undefined,
    precio: num(formData.get("precio")) ?? 0,
    precioOferta: num(formData.get("precioOferta")),
    stock: num(formData.get("stock")) ?? 0,
    categoriaId: formData.get("categoriaId"),
    marcaId: formData.get("marcaId"),
    tipoPiel: formData.getAll("tipoPiel").map(String),
    necesidad: formData.getAll("necesidad").map(String),
    destacado: formData.get("destacado") === "on",
    nuevo: formData.get("nuevo") === "on",
    activo: formData.get("activo") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const d = parsed.data;

  // slug único
  let slug = slugify(d.nombre);
  const existente = await prisma.producto.findUnique({ where: { slug } });
  if (existente && existente.id !== id) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

  const file = formData.get("imagen");
  let imagenUrl: string | undefined;
  if (file instanceof File && file.size > 0) {
    imagenUrl = await subirImagen(file, slug);
  }

  const datos = {
    nombre: d.nombre,
    slug,
    descripcionCorta: d.descripcionCorta ?? null,
    descripcion: d.descripcion ?? null,
    modoUso: d.modoUso ?? null,
    precio: new Prisma.Decimal(d.precio),
    precioOferta: d.precioOferta != null ? new Prisma.Decimal(d.precioOferta) : null,
    stock: d.stock,
    categoriaId: d.categoriaId,
    marcaId: d.marcaId,
    tipoPiel: d.tipoPiel,
    necesidad: d.necesidad,
    destacado: d.destacado,
    nuevo: d.nuevo,
    activo: d.activo,
  };

  if (id) {
    await prisma.producto.update({ where: { id }, data: datos });
    if (imagenUrl) {
      await prisma.productoImagen.deleteMany({ where: { productoId: id } });
      await prisma.productoImagen.create({
        data: { productoId: id, url: imagenUrl, alt: d.nombre, orden: 0 },
      });
    }
  } else {
    const codigo = `AGK-${Date.now().toString(36).toUpperCase()}`;
    await prisma.producto.create({
      data: {
        ...datos,
        codigo,
        imagenes: imagenUrl
          ? { create: [{ url: imagenUrl, alt: d.nombre, orden: 0 }] }
          : undefined,
      },
    });
  }

  revalidatePath("/admin/productos");
  revalidatePath("/catalogo");
  redirect("/admin/productos");
}

export async function toggleActivoProducto(id: string) {
  await requireAdmin();
  const p = await prisma.producto.findUnique({ where: { id }, select: { activo: true } });
  if (p) {
    await prisma.producto.update({ where: { id }, data: { activo: !p.activo } });
    revalidatePath("/admin/productos");
    revalidatePath("/catalogo");
  }
}

export async function eliminarProducto(id: string) {
  await requireAdmin();
  // Si el producto tiene pedidos, solo se desactiva (integridad histórica).
  const enPedidos = await prisma.pedidoItem.count({ where: { productoId: id } });
  if (enPedidos > 0) {
    await prisma.producto.update({ where: { id }, data: { activo: false } });
  } else {
    await prisma.producto.delete({ where: { id } });
  }
  revalidatePath("/admin/productos");
  revalidatePath("/catalogo");
}
