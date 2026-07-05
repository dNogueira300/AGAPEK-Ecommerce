import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Pencil, Plus, Power, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { eliminarBanner, toggleActivoBanner } from "@/lib/banner-actions";

export const metadata: Metadata = { title: "Banners" };
export const dynamic = "force-dynamic";

export default async function AdminBanners() {
  const banners = await prisma.banner.findMany({ orderBy: { orden: "asc" } });

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">Banners del hero</h1>
          <p className="mt-1 text-sm text-muted-foreground">{banners.length} banners.</p>
        </div>
        <Link href="/admin/banners/nuevo" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5">
          <Plus className="size-4" /> Nuevo banner
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {banners.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">Aún no hay banners.</p>
        ) : (
          banners.map((b) => (
            <div key={b.id} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-3">
              <span className="relative h-16 w-40 shrink-0 overflow-hidden rounded-lg bg-secondary">
                <Image src={b.imagenUrl} alt={b.titulo ?? "Banner"} fill sizes="160px" unoptimized={b.imagenUrl.endsWith(".svg")} className="object-cover" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">{b.titulo ?? "(sin título)"}</p>
                <p className="truncate text-xs text-muted-foreground">Orden {b.orden} · {b.enlace ?? "sin enlace"}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${b.activo ? "bg-chart-5/15 text-[color:var(--chart-5)]" : "bg-secondary text-muted-foreground"}`}>
                {b.activo ? "Activo" : "Inactivo"}
              </span>
              <div className="flex shrink-0 items-center gap-1">
                <Link href={`/admin/banners/${b.id}/editar`} aria-label="Editar" className="inline-flex size-9 items-center justify-center rounded-lg text-foreground/70 hover:bg-secondary hover:text-foreground">
                  <Pencil className="size-4" />
                </Link>
                <form action={toggleActivoBanner.bind(null, b.id)}>
                  <button type="submit" aria-label={b.activo ? "Desactivar" : "Activar"} className="inline-flex size-9 items-center justify-center rounded-lg text-foreground/70 hover:bg-secondary hover:text-foreground">
                    <Power className="size-4" />
                  </button>
                </form>
                <form action={eliminarBanner.bind(null, b.id)}>
                  <button type="submit" aria-label="Eliminar" className="inline-flex size-9 items-center justify-center rounded-lg text-foreground/70 hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="size-4" />
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
