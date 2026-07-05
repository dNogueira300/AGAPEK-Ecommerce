import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Plus, Power, Star, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { eliminarTestimonio, toggleActivoTestimonio } from "@/lib/testimonio-actions";

export const metadata: Metadata = { title: "Testimonios" };
export const dynamic = "force-dynamic";

export default async function AdminTestimonios() {
  const testimonios = await prisma.testimonio.findMany({ orderBy: { id: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">Testimonios</h1>
          <p className="mt-1 text-sm text-muted-foreground">{testimonios.length} reseñas.</p>
        </div>
        <Link href="/admin/testimonios/nuevo" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5">
          <Plus className="size-4" /> Nuevo testimonio
        </Link>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {testimonios.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground md:col-span-2">Aún no hay testimonios.</p>
        ) : (
          testimonios.map((t) => (
            <div key={t.id} className="flex flex-col rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="size-3.5 fill-primary text-primary" />
                  ))}
                </span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${t.activo ? "bg-chart-5/15 text-[color:var(--chart-5)]" : "bg-secondary text-muted-foreground"}`}>
                  {t.activo ? "Activo" : "Inactivo"}
                </span>
              </div>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-foreground/85">“{t.texto}”</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">{t.nombre}</span>
                <div className="flex items-center gap-1">
                  <Link href={`/admin/testimonios/${t.id}/editar`} aria-label="Editar" className="inline-flex size-9 items-center justify-center rounded-lg text-foreground/70 hover:bg-secondary hover:text-foreground">
                    <Pencil className="size-4" />
                  </Link>
                  <form action={toggleActivoTestimonio.bind(null, t.id)}>
                    <button type="submit" aria-label={t.activo ? "Desactivar" : "Activar"} className="inline-flex size-9 items-center justify-center rounded-lg text-foreground/70 hover:bg-secondary hover:text-foreground">
                      <Power className="size-4" />
                    </button>
                  </form>
                  <form action={eliminarTestimonio.bind(null, t.id)}>
                    <button type="submit" aria-label="Eliminar" className="inline-flex size-9 items-center justify-center rounded-lg text-foreground/70 hover:bg-destructive/10 hover:text-destructive">
                      <Trash2 className="size-4" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
