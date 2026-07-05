import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatFechaCorta } from "@/lib/date";

export const dynamic = "force-dynamic";

async function getPost(slug: string) {
  return prisma.post.findFirst({ where: { slug, publicado: true } });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Artículo no encontrado" };
  return { title: post.titulo, description: post.resumen ?? undefined };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ChevronLeft className="size-4" /> Blog
      </Link>

      <div className="mt-4">
        {post.categoria && (
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            {post.categoria}
          </span>
        )}
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {post.titulo}
        </h1>
        <p className="mt-3 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          {post.autor && <span className="font-medium text-foreground/70">Por {post.autor}</span>}
          {post.autor && <span>·</span>}
          <CalendarDays className="size-4" />
          {formatFechaCorta(post.createdAt)}
        </p>
      </div>

      {post.portadaUrl && (
        <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-3xl border border-border bg-secondary">
          <Image
            src={post.portadaUrl}
            alt={post.titulo}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            priority
            className="object-cover"
          />
        </div>
      )}

      <div className="mt-8 space-y-4 text-base leading-relaxed text-foreground/85">
        {post.contenido.split("\n\n").map((parrafo, i) => (
          <p key={i}>{parrafo}</p>
        ))}
      </div>
    </article>
  );
}
