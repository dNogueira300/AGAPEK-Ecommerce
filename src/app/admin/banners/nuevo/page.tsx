import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { BannerForm } from "@/components/admin/banner-form";

export const metadata: Metadata = { title: "Nuevo banner" };

export default function NuevoBanner() {
  return (
    <div>
      <Link
        href="/admin/banners"
        className="text-muted-foreground hover:text-primary inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="size-4" /> Banners
      </Link>
      <h1 className="font-display text-foreground mt-2 mb-6 text-2xl font-semibold sm:text-3xl">
        Nuevo banner
      </h1>
      <BannerForm />
    </div>
  );
}
