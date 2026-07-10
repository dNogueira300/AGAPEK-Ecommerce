import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatFechaCorta } from "@/lib/date";
import { eliminarPost, togglePublicado } from "@/lib/post-actions";

export const metadata: Metadata = { title: "Blog" };
export const dynamic = "force-dynamic";

export default async function AdminBlog() {
  const posts = await prisma.post.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-foreground text-2xl font-semibold sm:text-3xl">
            Blog
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">{posts.length} artículos.</p>
        </div>
        <Link
          href="/admin/blog/nuevo"
          className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm transition-transform hover:-translate-y-0.5"
        >
          <Plus className="size-4" /> Nuevo post
        </Link>
      </div>

      <div className="border-border bg-card mt-6 overflow-x-auto rounded-2xl border">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="border-border text-muted-foreground border-b text-left text-xs tracking-wide uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Artículo</th>
              <th className="px-4 py-3 font-medium">Categoría</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {posts.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-muted-foreground px-4 py-8 text-center">
                  Aún no hay artículos.
                </td>
              </tr>
            ) : (
              posts.map((p) => (
                <tr key={p.id} className="hover:bg-secondary/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="bg-secondary relative h-11 w-16 shrink-0 overflow-hidden rounded-lg">
                        {p.portadaUrl && (
                          <Image
                            src={p.portadaUrl}
                            alt={p.titulo}
                            fill
                            sizes="64px"
                            unoptimized={p.portadaUrl.endsWith(".svg")}
                            className="object-cover"
                          />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="text-foreground truncate font-medium">{p.titulo}</p>
                        <p className="text-muted-foreground text-xs">
                          {p.autor ?? "—"} · {formatFechaCorta(p.createdAt)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="text-foreground/80 px-4 py-3">{p.categoria ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${p.publicado ? "bg-chart-5/15 text-[color:var(--chart-5)]" : "bg-secondary text-muted-foreground"}`}
                    >
                      {p.publicado ? "Publicado" : "Borrador"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/blog/${p.id}/editar`}
                        aria-label="Editar"
                        className="text-foreground/70 hover:bg-secondary hover:text-foreground inline-flex size-9 items-center justify-center rounded-lg"
                      >
                        <Pencil className="size-4" />
                      </Link>
                      <form action={togglePublicado.bind(null, p.id)}>
                        <button
                          type="submit"
                          aria-label={p.publicado ? "Despublicar" : "Publicar"}
                          className="text-foreground/70 hover:bg-secondary hover:text-foreground inline-flex size-9 items-center justify-center rounded-lg"
                        >
                          {p.publicado ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </button>
                      </form>
                      <form action={eliminarPost.bind(null, p.id)}>
                        <button
                          type="submit"
                          aria-label="Eliminar"
                          className="text-foreground/70 hover:bg-destructive/10 hover:text-destructive inline-flex size-9 items-center justify-center rounded-lg"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
