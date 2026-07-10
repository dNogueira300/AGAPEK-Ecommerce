"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { guardarCupon, type CuponState } from "@/lib/cupon-actions";

const input =
  "h-11 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";
const label = "text-sm font-medium text-foreground";

export interface CuponEdit {
  id: string;
  codigo: string;
  descripcion: string | null;
  tipo: "PORCENTAJE" | "MONTO_FIJO";
  valor: number;
  minCompra: number;
  usoMaximo: number | null;
  activo: boolean;
  inicioAt: string | null; // yyyy-MM-dd
  finAt: string | null; // yyyy-MM-dd
}

export function CuponForm({ cupon }: { cupon?: CuponEdit }) {
  const [state, formAction, pending] = useActionState<CuponState, FormData>(
    guardarCupon,
    {},
  );
  const [tipo, setTipo] = useState<"PORCENTAJE" | "MONTO_FIJO">(
    cupon?.tipo ?? "PORCENTAJE",
  );

  return (
    <form action={formAction} className="space-y-6">
      {cupon && <input type="hidden" name="id" value={cupon.id} />}

      <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className={label} htmlFor="codigo">Código</label>
            <input
              id="codigo"
              name="codigo"
              required
              defaultValue={cupon?.codigo ?? ""}
              className={`${input} uppercase`}
              placeholder="BIENVENIDA10"
            />
          </div>
          <div className="space-y-1.5">
            <label className={label} htmlFor="descripcion">Descripción (opcional)</label>
            <input
              id="descripcion"
              name="descripcion"
              defaultValue={cupon?.descripcion ?? ""}
              className={input}
              placeholder="10% para nuevos clientes"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className={label} htmlFor="tipo">Tipo de descuento</label>
            <select
              id="tipo"
              name="tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as typeof tipo)}
              className={input}
            >
              <option value="PORCENTAJE">Porcentaje (%)</option>
              <option value="MONTO_FIJO">Monto fijo (S/)</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className={label} htmlFor="valor">
              {tipo === "PORCENTAJE" ? "Porcentaje (0-100)" : "Monto en soles"}
            </label>
            <input
              id="valor"
              name="valor"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={cupon?.valor ?? ""}
              className={input}
              placeholder={tipo === "PORCENTAJE" ? "10" : "15.00"}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className={label} htmlFor="minCompra">Compra mínima (S/)</label>
            <input
              id="minCompra"
              name="minCompra"
              type="number"
              step="0.01"
              min="0"
              defaultValue={cupon?.minCompra ?? 0}
              className={input}
            />
          </div>
          <div className="space-y-1.5">
            <label className={label} htmlFor="usoMaximo">Límite de usos (vacío = ilimitado)</label>
            <input
              id="usoMaximo"
              name="usoMaximo"
              type="number"
              min="1"
              defaultValue={cupon?.usoMaximo ?? ""}
              className={input}
              placeholder="Ilimitado"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className={label} htmlFor="inicioAt">Vigente desde (opcional)</label>
            <input id="inicioAt" name="inicioAt" type="date" defaultValue={cupon?.inicioAt ?? ""} className={input} />
          </div>
          <div className="space-y-1.5">
            <label className={label} htmlFor="finAt">Vigente hasta (opcional)</label>
            <input id="finAt" name="finAt" type="date" defaultValue={cupon?.finAt ?? ""} className={input} />
          </div>
        </div>

        <label className="flex items-center gap-2.5 pt-1">
          <input
            type="checkbox"
            name="activo"
            defaultChecked={cupon?.activo ?? true}
            className="size-4 rounded border-input text-primary focus-visible:ring-2 focus-visible:ring-ring/30"
          />
          <span className={label}>Cupón activo</span>
        </label>
      </section>

      {state.error && (
        <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
        >
          {pending && <Loader2 className="size-4 animate-spin" />}
          {cupon ? "Guardar cambios" : "Crear cupón"}
        </button>
        <Link href="/admin/cupones" className="text-sm font-medium text-muted-foreground hover:text-foreground">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
