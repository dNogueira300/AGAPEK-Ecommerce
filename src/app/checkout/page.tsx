import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPerfil } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  CheckoutForm,
  type CheckoutConfig,
} from "@/components/tienda/checkout-form";

export const metadata: Metadata = { title: "Checkout" };
export const dynamic = "force-dynamic";

function str(v: unknown): string | undefined {
  return typeof v === "string" ? v : undefined;
}
function num(v: unknown, def: number): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

export default async function CheckoutPage() {
  const data = await getPerfil();
  if (!data) redirect("/login?redirect=/checkout");

  const cfgRows = await prisma.configuracion.findMany();
  const cfg = Object.fromEntries(cfgRows.map((c) => [c.clave, c.valor]));

  const config: CheckoutConfig = {
    deliveryCentrico: num(cfg.delivery_centrico, 5),
    deliveryOtras: num(cfg.delivery_otras, 10),
    yape: str(cfg.yape),
    plin: str(cfg.plin),
    cuentaBcp: str(cfg.cuenta_bcp),
    cci: str(cfg.cci),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 font-display text-3xl font-semibold tracking-tight text-foreground">
        Finalizar compra
      </h1>
      <CheckoutForm
        perfil={{
          nombre: data.perfil.nombre,
          celular: data.perfil.celular ?? "",
          dni: data.perfil.dni ?? "",
          email: data.email,
        }}
        config={config}
      />
    </div>
  );
}
