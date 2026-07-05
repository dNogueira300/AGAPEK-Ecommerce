import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Plus, Power, Sparkles, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { eliminarRutina, togglePublicadoRutina } from "@/lib/rutina-actions";

export const metadata: Metadata = { title: "Rutinas" };
export const dynamic = "force-dynamic";

const PIEL_LABEL: Record<string, string> = {
  todas: "Todas",
  grasa: "Piel grasa",
  seca: "Piel seca",
  mixta: "Piel mixta",
  sensible: "Piel sensible",
  normal: "Piel normal",
};

export default async function AdminRutinas() {
  const rutinas = await prisma.rutina.findMany({
    orderBy: [{ orden: "asc" }, { createdAt: "desc" }],
    include: { _count: { select: { pasos: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">Rutinas</h1>
          <p className="mt-1 text-sm text-muted-foreground">{rutinas.length} rutinas.</p>
        </div>
        <Link href="/admin/rutinas/nuevo" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5">
          <Plus className="size-4" /> Nueva rutina
        </Link>
      </div>

      {rutinas.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
          Aún no hay rutinas.
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {rutinas.map((r) => (
            <div key={r.id} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-secondary text-primary">
                <Sparkles className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">{r.titulo}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {PIEL_LABEL[r.tipoPiel] ?? r.tipoPiel} · {r._count.pasos} {r._count.pasos === 1 ? "paso" : "pasos"} · orden {r.orden}
                </p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${r.publicado ? "bg-chart-5/15 text-[color:var(--chart-5)]" : "bg-secondary text-muted-foreground"}`}>
                {r.publicado ? "Publicada" : "Borrador"}
              </span>
              <div className="flex shrink-0 items-center gap-1">
                <Link href={`/admin/rutinas/${r.id}/editar`} aria-label="Editar" className="inline-flex size-9 items-center justify-center rounded-lg text-foreground/70 hover:bg-secondary hover:text-foreground">
                  <Pencil className="size-4" />
                </Link>
                <form action={togglePublicadoRutina.bind(null, r.id)}>
                  <button type="submit" aria-label={r.publicado ? "Despublicar" : "Publicar"} className="inline-flex size-9 items-center justify-center rounded-lg text-foreground/70 hover:bg-secondary hover:text-foreground">
                    <Power className="size-4" />
                  </button>
                </form>
                <form action={eliminarRutina.bind(null, r.id)}>
                  <button type="submit" aria-label="Eliminar" className="inline-flex size-9 items-center justify-center rounded-lg text-foreground/70 hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="size-4" />
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
