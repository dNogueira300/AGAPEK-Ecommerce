import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PostForm } from "@/components/admin/post-form";

export const metadata: Metadata = { title: "Nuevo post" };

export default function NuevoPost() {
  return (
    <div>
      <Link
        href="/admin/blog"
        className="text-muted-foreground hover:text-primary inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="size-4" /> Blog
      </Link>
      <h1 className="font-display text-foreground mt-2 mb-6 text-2xl font-semibold sm:text-3xl">
        Nuevo artículo
      </h1>
      <PostForm />
    </div>
  );
}
