"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PackageSearch, Search } from "lucide-react";

export default function SeguirPedidoPage() {
  const router = useRouter();
  const [codigo, setCodigo] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const c = codigo.trim().toUpperCase();
    if (c) router.push(`/pedido/${encodeURIComponent(c)}`);
  };

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
          <PackageSearch className="size-6" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-semibold text-foreground">Sigue tu pedido</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Ingresa el código que recibiste al finalizar tu compra.
        </p>
      </div>
      <form onSubmit={onSubmit} className="mt-6 flex gap-2">
        <input
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          placeholder="AGK-XXXXXXXX-XXXX"
          className="h-11 w-full rounded-full border border-input bg-card px-4 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
        />
        <button type="submit" aria-label="Buscar" className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5">
          <Search className="size-5" />
        </button>
      </form>
    </div>
  );
}
