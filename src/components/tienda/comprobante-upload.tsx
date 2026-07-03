"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Upload } from "lucide-react";
import { subirComprobante } from "@/lib/checkout-actions";

export function ComprobanteUpload({ codigo }: { codigo: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [nombre, setNombre] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await subirComprobante(codigo, fd);
      if ("error" in res) setError(res.error);
      else router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-3">
      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border bg-background px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary/40">
        <Upload className="size-4 text-primary" />
        <span className="truncate">{nombre ?? "Selecciona imagen o PDF del comprobante"}</span>
        <input
          type="file"
          name="comprobante"
          accept="image/*,application/pdf"
          required
          onChange={(e) => setNombre(e.target.files?.[0]?.name ?? null)}
          className="hidden"
        />
      </label>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
        Enviar comprobante
      </button>
    </form>
  );
}
