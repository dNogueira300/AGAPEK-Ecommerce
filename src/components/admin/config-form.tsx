"use client";

import { useActionState } from "react";
import { Check, Loader2 } from "lucide-react";
import { guardarConfiguracion, type ConfigState } from "@/lib/config-actions";

const input =
  "h-11 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";
const label = "text-sm font-medium text-foreground";

export interface ConfigValues {
  whatsapp: string;
  yape: string;
  plin: string;
  cuenta_bcp: string;
  cci: string;
  horario: string;
  delivery_centrico: string;
  delivery_otras: string;
}

function Campo({
  name,
  label: l,
  value,
  type = "text",
  placeholder,
}: {
  name: string;
  label: string;
  value: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className={label} htmlFor={name}>{l}</label>
      <input id={name} name={name} type={type} defaultValue={value} placeholder={placeholder} className={input} />
    </div>
  );
}

export function ConfigForm({ values }: { values: ConfigValues }) {
  const [state, formAction, pending] = useActionState<ConfigState, FormData>(
    guardarConfiguracion,
    {},
  );

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-semibold text-foreground">Contacto</h2>
        <Campo name="whatsapp" label="WhatsApp de ventas (con código país, ej. 51961075865)" value={values.whatsapp} />
        <Campo name="horario" label="Horario de atención" value={values.horario} />
      </section>

      <section className="grid gap-4 rounded-2xl border border-border bg-card p-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <h2 className="font-display text-lg font-semibold text-foreground">Pagos</h2>
        </div>
        <Campo name="yape" label="Número de Yape" value={values.yape} />
        <Campo name="plin" label="Número de Plin" value={values.plin} />
        <Campo name="cuenta_bcp" label="Cuenta BCP" value={values.cuenta_bcp} />
        <Campo name="cci" label="CCI" value={values.cci} />
      </section>

      <section className="grid gap-4 rounded-2xl border border-border bg-card p-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <h2 className="font-display text-lg font-semibold text-foreground">Delivery (Iquitos)</h2>
        </div>
        <Campo name="delivery_centrico" label="Costo zona céntrica (S/)" value={values.delivery_centrico} type="number" />
        <Campo name="delivery_otras" label="Costo otras zonas (S/)" value={values.delivery_otras} type="number" />
      </section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {pending && <Loader2 className="size-4 animate-spin" />}
          Guardar cambios
        </button>
        {state.ok && (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[color:var(--chart-5)]">
            <Check className="size-4" /> Guardado
          </span>
        )}
      </div>
    </form>
  );
}
