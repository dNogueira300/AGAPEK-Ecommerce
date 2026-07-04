import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getPerfil } from "@/lib/auth";
import { ConfigForm, type ConfigValues } from "@/components/admin/config-form";

export const metadata: Metadata = { title: "Configuración" };
export const dynamic = "force-dynamic";

const str = (v: unknown, def = "") => (v == null ? def : String(v));

export default async function AdminConfiguracion() {
  const data = await getPerfil();
  if (!data) redirect("/login?redirect=/admin/configuracion");
  if (data.perfil.rol === "VENDEDOR") redirect("/admin");

  const rows = await prisma.configuracion.findMany();
  const c = Object.fromEntries(rows.map((r) => [r.clave, r.valor]));

  const values: ConfigValues = {
    whatsapp: str(c.whatsapp),
    yape: str(c.yape),
    plin: str(c.plin),
    cuenta_bcp: str(c.cuenta_bcp),
    cci: str(c.cci),
    horario: str(c.horario),
    delivery_centrico: str(c.delivery_centrico, "5"),
    delivery_otras: str(c.delivery_otras, "10"),
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">Configuración</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Datos del negocio usados en la tienda y el checkout.
      </p>
      <div className="mt-6">
        <ConfigForm values={values} />
      </div>
    </div>
  );
}
