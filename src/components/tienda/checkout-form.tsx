"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ShoppingBag } from "lucide-react";
import {
  subtotalCarrito,
  useCart,
  useCartHydrated,
} from "@/stores/cart";
import { crearPedido, type CheckoutInput } from "@/lib/checkout-actions";
import { cn } from "@/lib/utils";

export interface CheckoutConfig {
  deliveryCentrico: number;
  deliveryOtras: number;
  yape?: string;
  plin?: string;
  cuentaBcp?: string;
  cci?: string;
}
export interface CheckoutPerfil {
  nombre: string;
  celular: string;
  dni: string;
  email: string | null;
}

const soles = (n: number) => `S/ ${n.toFixed(2)}`;

const ENTREGAS = [
  { value: "DELIVERY_LOCAL", label: "Delivery en Iquitos" },
  { value: "RECOJO_ALMACEN", label: "Recojo en almacén" },
  { value: "ENVIO_NACIONAL", label: "Envío nacional" },
] as const;

const PAGOS = [
  { value: "YAPE", label: "Yape" },
  { value: "PLIN", label: "Plin" },
  { value: "TRANSFERENCIA", label: "Transferencia BCP" },
  { value: "DEPOSITO", label: "Depósito BCP" },
  { value: "CONTRA_ENTREGA", label: "Pago contra entrega" },
] as const;

const inputClass =
  "h-11 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";
const labelClass = "text-sm font-medium text-foreground";

export function CheckoutForm({
  perfil,
  config,
}: {
  perfil: CheckoutPerfil;
  config: CheckoutConfig;
}) {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const hydrated = useCartHydrated();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [metodoEntrega, setMetodoEntrega] =
    useState<CheckoutInput["metodoEntrega"]>("DELIVERY_LOCAL");
  const [zona, setZona] = useState<"centrica" | "otras">("centrica");
  const [metodoPago, setMetodoPago] =
    useState<CheckoutInput["metodoPago"]>("YAPE");

  const subtotal = subtotalCarrito(items);
  const envio = useMemo(() => {
    if (metodoEntrega !== "DELIVERY_LOCAL") return 0;
    return zona === "otras" ? config.deliveryOtras : config.deliveryCentrico;
  }, [metodoEntrega, zona, config]);
  const total = subtotal + envio;

  if (!hydrated) return <div className="py-20" />;

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-secondary text-primary">
          <ShoppingBag className="size-7" />
        </span>
        <p className="mt-4 text-muted-foreground">Tu carrito está vacío.</p>
        <Link
          href="/catalogo"
          className="mt-4 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          Ir al catálogo
        </Link>
      </div>
    );
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const input: CheckoutInput = {
      nombre: String(fd.get("nombre") ?? ""),
      dni: String(fd.get("dni") ?? "") || undefined,
      celular: String(fd.get("celular") ?? ""),
      metodoEntrega,
      zona: metodoEntrega === "DELIVERY_LOCAL" ? zona : undefined,
      direccion: String(fd.get("direccion") ?? "") || undefined,
      distrito: String(fd.get("distrito") ?? "") || undefined,
      referencia: String(fd.get("referencia") ?? "") || undefined,
      metodoPago,
      observaciones: String(fd.get("observaciones") ?? "") || undefined,
      items: items.map((i) => ({ slug: i.slug, cantidad: i.cantidad })),
    };

    startTransition(async () => {
      const res = await crearPedido(input);
      if ("error" in res) {
        setError(res.error);
      } else {
        clear();
        router.push(`/pedido/${res.codigo}`);
      }
    });
  };

  const datosPago: Record<string, string | undefined> = {
    YAPE: config.yape && `Yapea al ${config.yape}`,
    PLIN: config.plin && `Plinea al ${config.plin}`,
    TRANSFERENCIA:
      config.cuentaBcp && `BCP ${config.cuentaBcp}${config.cci ? ` · CCI ${config.cci}` : ""}`,
    DEPOSITO: config.cuentaBcp && `Depósito BCP ${config.cuentaBcp}`,
    CONTRA_ENTREGA: "Pagas al recibir tu pedido.",
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1fr_360px]">
      {/* Columna izquierda */}
      <div className="space-y-8">
        {/* Datos */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Tus datos
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className={labelClass} htmlFor="nombre">Nombre completo</label>
              <input id="nombre" name="nombre" required defaultValue={perfil.nombre} className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass} htmlFor="celular">Celular / WhatsApp</label>
              <input id="celular" name="celular" required defaultValue={perfil.celular} className={inputClass} placeholder="9########" />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass} htmlFor="dni">DNI / RUC (opcional)</label>
              <input id="dni" name="dni" defaultValue={perfil.dni} className={inputClass} />
            </div>
          </div>
        </section>

        {/* Entrega */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold text-foreground">Entrega</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {ENTREGAS.map((e) => (
              <button
                key={e.value}
                type="button"
                onClick={() => setMetodoEntrega(e.value)}
                className={cn(
                  "rounded-xl border px-4 py-3 text-sm font-medium transition-colors",
                  metodoEntrega === e.value
                    ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary"
                    : "border-border bg-card text-foreground/80 hover:bg-secondary",
                )}
              >
                {e.label}
              </button>
            ))}
          </div>

          {metodoEntrega === "DELIVERY_LOCAL" && (
            <div className="mt-4 space-y-4">
              <div className="flex gap-2">
                {(["centrica", "otras"] as const).map((z) => (
                  <button
                    key={z}
                    type="button"
                    onClick={() => setZona(z)}
                    className={cn(
                      "flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors",
                      zona === z
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border hover:bg-secondary",
                    )}
                  >
                    {z === "centrica"
                      ? `Zona céntrica · ${soles(config.deliveryCentrico)}`
                      : `Otras zonas · ${soles(config.deliveryOtras)}`}
                  </button>
                ))}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className={labelClass} htmlFor="direccion">Dirección</label>
                  <input id="direccion" name="direccion" required className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass} htmlFor="distrito">Distrito / Ciudad</label>
                  <input id="distrito" name="distrito" required className={inputClass} />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className={labelClass} htmlFor="referencia">Referencia (opcional)</label>
                  <input id="referencia" name="referencia" className={inputClass} />
                </div>
              </div>
            </div>
          )}

          {metodoEntrega === "ENVIO_NACIONAL" && (
            <p className="mt-4 rounded-xl bg-secondary px-4 py-3 text-sm text-muted-foreground">
              El costo de envío nacional se coordina por WhatsApp según el courier (Shalom / Olva).
            </p>
          )}
          {metodoEntrega === "RECOJO_ALMACEN" && (
            <p className="mt-4 rounded-xl bg-secondary px-4 py-3 text-sm text-muted-foreground">
              Coordinaremos el recojo en almacén por WhatsApp.
            </p>
          )}
        </section>

        {/* Pago */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold text-foreground">Pago</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {PAGOS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setMetodoPago(p.value)}
                className={cn(
                  "rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors",
                  metodoPago === p.value
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:bg-secondary",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          {datosPago[metodoPago] && (
            <p className="mt-4 rounded-xl bg-secondary px-4 py-3 text-sm text-foreground">
              {datosPago[metodoPago]}
              {metodoPago !== "CONTRA_ENTREGA" && (
                <span className="mt-1 block text-muted-foreground">
                  Subirás el comprobante en el siguiente paso.
                </span>
              )}
            </p>
          )}
        </section>

        {/* Observaciones */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <label className={labelClass} htmlFor="observaciones">
            Observaciones (opcional)
          </label>
          <textarea
            id="observaciones"
            name="observaciones"
            rows={3}
            className="mt-2 w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
            placeholder="Alguna indicación para tu pedido…"
          />
        </section>
      </div>

      {/* Resumen */}
      <aside className="h-fit rounded-2xl border border-border bg-card p-6 lg:sticky lg:top-24">
        <h2 className="font-display text-lg font-semibold text-foreground">Tu pedido</h2>
        <ul className="mt-4 space-y-3">
          {items.map((it) => (
            <li key={it.slug} className="flex justify-between gap-3 text-sm">
              <span className="text-foreground/80">
                {it.cantidad}× {it.nombre}
              </span>
              <span className="shrink-0 font-medium text-foreground">
                {soles(it.precio * it.cantidad)}
              </span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="font-medium text-foreground">{soles(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Envío</dt>
            <dd className="font-medium text-foreground">
              {metodoEntrega === "ENVIO_NACIONAL" ? "Por coordinar" : soles(envio)}
            </dd>
          </div>
        </dl>
        <div className="mt-4 flex justify-between border-t border-border pt-4">
          <span className="font-semibold text-foreground">Total</span>
          <span className="font-semibold text-foreground">{soles(total)}</span>
        </div>

        {error && (
          <p className="mt-4 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
        >
          {pending && <Loader2 className="size-4 animate-spin" />}
          Confirmar pedido
        </button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Recibirás un código para seguir tu pedido y coordinar por WhatsApp.
        </p>
      </aside>
    </form>
  );
}
