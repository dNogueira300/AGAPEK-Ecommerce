import { prisma } from "@/lib/prisma";
import type { RedesSociales } from "@/components/tienda/social-links";

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);

/** URLs de redes sociales configuradas (null si no están definidas). */
export async function getRedesSociales(): Promise<RedesSociales> {
  const rows = await prisma.configuracion.findMany({
    where: { clave: { in: ["facebook", "instagram", "tiktok"] } },
  });
  const c = Object.fromEntries(rows.map((r) => [r.clave, r.valor]));
  return {
    facebook: str(c.facebook),
    instagram: str(c.instagram),
    tiktok: str(c.tiktok),
  };
}
