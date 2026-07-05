"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { itemsParaReordenar } from "@/lib/pedido-cliente-actions";
import { useCart } from "@/stores/cart";
import { cn } from "@/lib/utils";

export function ReordenarButton({ codigo }: { codigo: string }) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const reordenar = () => {
    setMsg(null);
    start(async () => {
      const res = await itemsParaReordenar(codigo);
      if ("error" in res) {
        setMsg(
          res.error === "EMPTY"
            ? "Ninguno de estos productos está disponible ahora."
            : "No se pudo reordenar. Intenta de nuevo.",
        );
        return;
      }
      for (const it of res.items) {
        const { cantidad, ...producto } = it;
        add(producto, cantidad);
      }
      router.push("/carrito");
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={reordenar}
        disabled={pending}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-secondary",
          pending && "opacity-60",
        )}
      >
        <RotateCcw className={cn("size-3.5", pending && "animate-spin")} />
        {pending ? "Agregando…" : "Reordenar"}
      </button>
      {msg && <p className="text-right text-[11px] text-muted-foreground">{msg}</p>}
    </div>
  );
}
