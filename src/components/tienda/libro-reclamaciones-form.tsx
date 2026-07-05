"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { crearReclamo, type CrearReclamoInput } from "@/lib/reclamo-actions";
import { cn } from "@/lib/utils";

const input =
  "h-11 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";
const label = "text-sm font-medium text-foreground";

export function LibroReclamacionesForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [codigo, setCodigo] = useState<string | null>(null);
  const [tipo, setTipo] = useState<"RECLAMO" | "QUEJA">("RECLAMO");

  if (codigo) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-chart-5/15 text-[color:var(--chart-5)]">
          <CheckCircle2 className="size-7" />
        </span>
        <h2 className="mt-4 font-display text-2xl font-semibold text-foreground">Reclamo registrado</h2>
        <p className="mt-1 text-sm text-muted-foreground">Tu código de seguimiento es</p>
        <p className="mt-1 font-mono text-lg font-semibold tracking-wide text-primary">{codigo}</p>
        <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
          Hemos recibido tu {tipo === "RECLAMO" ? "reclamo" : "queja"}. Te responderemos en un
          plazo máximo de 15 días hábiles al correo que indicaste, conforme a la normativa de Indecopi.
        </p>
      </div>
    );
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const montoRaw = String(fd.get("monto") ?? "");
    const data: CrearReclamoInput = {
      tipo,
      nombre: String(fd.get("nombre") ?? ""),
      documento: String(fd.get("documento") ?? ""),
      domicilio: String(fd.get("domicilio") ?? "") || undefined,
      telefono: String(fd.get("telefono") ?? "") || undefined,
      email: String(fd.get("email") ?? ""),
      tipoBien: String(fd.get("tipoBien") ?? "") || undefined,
      descripcionBien: String(fd.get("descripcionBien") ?? "") || undefined,
      monto: montoRaw ? Number(montoRaw) : null,
      detalle: String(fd.get("detalle") ?? ""),
      pedidoConsumidor: String(fd.get("pedidoConsumidor") ?? "") || undefined,
    };
    startTransition(async () => {
      const res = await crearReclamo(data);
      if ("error" in res) setError(res.error);
      else setCodigo(res.codigo);
    });
  };

  const chip = (v: "RECLAMO" | "QUEJA", t: string, sub: string) => (
    <button
      type="button"
      onClick={() => setTipo(v)}
      className={cn(
        "flex-1 rounded-xl border p-4 text-left transition-colors",
        tipo === v ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:bg-secondary",
      )}
    >
      <span className="block text-sm font-semibold text-foreground">{t}</span>
      <span className="mt-0.5 block text-xs text-muted-foreground">{sub}</span>
    </button>
  );

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section className="space-y-3 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-semibold text-foreground">Tipo de solicitud</h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          {chip("RECLAMO", "Reclamo", "Disconformidad con el producto o servicio.")}
          {chip("QUEJA", "Queja", "Malestar con la atención recibida.")}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-semibold text-foreground">Datos del consumidor</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5"><label className={label} htmlFor="nombre">Nombre completo *</label><input id="nombre" name="nombre" required className={input} /></div>
          <div className="space-y-1.5"><label className={label} htmlFor="documento">DNI / CE / RUC *</label><input id="documento" name="documento" required className={input} /></div>
          <div className="space-y-1.5"><label className={label} htmlFor="email">Correo electrónico *</label><input id="email" name="email" type="email" required className={input} /></div>
          <div className="space-y-1.5"><label className={label} htmlFor="telefono">Teléfono</label><input id="telefono" name="telefono" className={input} /></div>
          <div className="space-y-1.5 sm:col-span-2"><label className={label} htmlFor="domicilio">Domicilio</label><input id="domicilio" name="domicilio" className={input} /></div>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-semibold text-foreground">Identificación del bien contratado</h2>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 text-sm text-foreground/85"><input type="radio" name="tipoBien" value="Producto" defaultChecked className="accent-[color:var(--primary)]" /> Producto</label>
          <label className="flex items-center gap-2 text-sm text-foreground/85"><input type="radio" name="tipoBien" value="Servicio" className="accent-[color:var(--primary)]" /> Servicio</label>
        </div>
        <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
          <div className="space-y-1.5"><label className={label} htmlFor="descripcionBien">Descripción</label><input id="descripcionBien" name="descripcionBien" className={input} placeholder="Producto / pedido relacionado" /></div>
          <div className="space-y-1.5"><label className={label} htmlFor="monto">Monto reclamado (S/)</label><input id="monto" name="monto" type="number" step="0.01" min="0" className={input} /></div>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-semibold text-foreground">Detalle</h2>
        <div className="space-y-1.5">
          <label className={label} htmlFor="detalle">Detalle del reclamo o queja *</label>
          <textarea id="detalle" name="detalle" required rows={4} className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30" />
        </div>
        <div className="space-y-1.5">
          <label className={label} htmlFor="pedidoConsumidor">Pedido del consumidor</label>
          <textarea id="pedidoConsumidor" name="pedidoConsumidor" rows={2} className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30" placeholder="¿Qué solución esperas?" />
        </div>
      </section>

      {error && <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
      <button type="submit" disabled={pending} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 disabled:opacity-60 sm:w-auto sm:px-8">
        {pending && <Loader2 className="size-4 animate-spin" />}
        Enviar reclamo
      </button>
    </form>
  );
}
