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
          <h1 className="font-display text-foreground text-2xl font-semibold sm:text-3xl">
            Banners del hero
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">{banners.length} banners.</p>
        </div>
        <Link
          href="/admin/banners/nuevo"
          className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm transition-transform hover:-translate-y-0.5"
        >
          <Plus className="size-4" /> Nuevo banner
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {banners.length === 0 ? (
          <p className="border-border bg-card text-muted-foreground rounded-2xl border border-dashed p-10 text-center">
            Aún no hay banners.
          </p>
        ) : (
          banners.map((b) => (
            <div
              key={b.id}
              className="border-border bg-card flex items-center gap-4 rounded-2xl border p-3"
            >
              <span className="bg-secondary relative h-16 w-40 shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={b.imagenUrl}
                  alt={b.titulo ?? "Banner"}
                  fill
                  sizes="160px"
                  unoptimized={b.imagenUrl.endsWith(".svg")}
                  className="object-cover"
                />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-foreground truncate font-medium">
                  {b.titulo ?? "(sin título)"}
                </p>
                <p className="text-muted-foreground truncate text-xs">
                  Orden {b.orden} · {b.enlace ?? "sin enlace"}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${b.activo ? "bg-chart-5/15 text-[color:var(--chart-5)]" : "bg-secondary text-muted-foreground"}`}
              >
                {b.activo ? "Activo" : "Inactivo"}
              </span>
              <div className="flex shrink-0 items-center gap-1">
                <Link
                  href={`/admin/banners/${b.id}/editar`}
                  aria-label="Editar"
                  className="text-foreground/70 hover:bg-secondary hover:text-foreground inline-flex size-9 items-center justify-center rounded-lg"
                >
                  <Pencil className="size-4" />
                </Link>
                <form action={toggleActivoBanner.bind(null, b.id)}>
                  <button
                    type="submit"
                    aria-label={b.activo ? "Desactivar" : "Activar"}
                    className="text-foreground/70 hover:bg-secondary hover:text-foreground inline-flex size-9 items-center justify-center rounded-lg"
                  >
                    <Power className="size-4" />
                  </button>
                </form>
                <form action={eliminarBanner.bind(null, b.id)}>
                  <button
                    type="submit"
                    aria-label="Eliminar"
                    className="text-foreground/70 hover:bg-destructive/10 hover:text-destructive inline-flex size-9 items-center justify-center rounded-lg"
                  >
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
