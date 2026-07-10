import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { BannerForm } from "@/components/admin/banner-form";

export const metadata: Metadata = { title: "Editar banner" };
export const dynamic = "force-dynamic";

export default async function EditarBanner({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const banner = await prisma.banner.findUnique({ where: { id } });
  if (!banner) notFound();

  return (
    <div>
      <Link
        href="/admin/banners"
        className="text-muted-foreground hover:text-primary inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="size-4" /> Banners
      </Link>
      <h1 className="font-display text-foreground mt-2 mb-6 text-2xl font-semibold sm:text-3xl">
        Editar banner
      </h1>
      <BannerForm
        banner={{
          id: banner.id,
          titulo: banner.titulo,
          subtitulo: banner.subtitulo,
          cta: banner.cta,
          enlace: banner.enlace,
          orden: banner.orden,
          activo: banner.activo,
          imagenUrl: banner.imagenUrl,
        }}
      />
    </div>
  );
}
