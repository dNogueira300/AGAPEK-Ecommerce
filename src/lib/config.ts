import { getConfigValor, getConfigValores } from "@/lib/cache";
import type { RedesSociales } from "@/components/tienda/social-links";

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);

/** URLs de redes sociales configuradas (null si no están definidas). Con caché. */
export async function getRedesSociales(): Promise<RedesSociales> {
  const c = await getConfigValores(["facebook", "instagram", "tiktok"]);
  return {
    facebook: str(c.facebook),
    instagram: str(c.instagram),
    tiktok: str(c.tiktok),
  };
}

/** URL del logo de la tienda (null si usa el logo por defecto). Con caché. */
export async function getLogoUrl(): Promise<string | null> {
  return getConfigValor("logo_url");
}
