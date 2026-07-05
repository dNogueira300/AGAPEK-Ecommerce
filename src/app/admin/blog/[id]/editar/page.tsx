import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PostForm } from "@/components/admin/post-form";

export const metadata: Metadata = { title: "Editar post" };
export const dynamic = "force-dynamic";

export default async function EditarPost({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <div>
      <Link href="/admin/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ChevronLeft className="size-4" /> Blog
      </Link>
      <h1 className="mt-2 mb-6 font-display text-2xl font-semibold text-foreground sm:text-3xl">Editar artículo</h1>
      <PostForm
        post={{
          id: post.id,
          titulo: post.titulo,
          categoria: post.categoria,
          autor: post.autor,
          resumen: post.resumen,
          contenido: post.contenido,
          portadaUrl: post.portadaUrl,
          publicado: post.publicado,
        }}
      />
    </div>
  );
}
