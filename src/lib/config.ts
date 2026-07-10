import { getConfigValor, getConfigValores } from "@/lib/cache";
import type { RedesSociales, RedExtra } from "@/components/tienda/social-links";

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);

/** Valida el JSON de redes adicionales guardado en Configuracion (redes_extra). */
export function parseRedesExtra(v: unknown): RedExtra[] {
  if (!Array.isArray(v)) return [];
  return v.filter(
    (r): r is RedExtra =>
      !!r &&
      typeof r === "object" &&
      typeof (r as RedExtra).nombre === "string" &&
      typeof (r as RedExtra).url === "string" &&
      typeof (r as RedExtra).iconoUrl === "string",
  );
}

/** URLs de redes sociales configuradas (null si no están definidas). Con caché. */
export async function getRedesSociales(): Promise<RedesSociales> {
  const c = await getConfigValores(["facebook", "instagram", "tiktok", "redes_extra"]);
  return {
    facebook: str(c.facebook),
    instagram: str(c.instagram),
    tiktok: str(c.tiktok),
    extras: parseRedesExtra(c.redes_extra),
  };
}

/** URL del logo de la tienda (null si usa el logo por defecto). Con caché. */
export async function getLogoUrl(): Promise<string | null> {
  return getConfigValor("logo_url");
}
