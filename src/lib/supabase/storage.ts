/**
 * Buckets de Supabase Storage (2 buckets):
 *  - `publico`      → público, imágenes servidas a todos. Carpetas: productos/ banners/ marcas/
 *  - `comprobantes` → PRIVADO, evidencias de pago. Acceso solo por signed URL para admin.
 */
export const BUCKET = {
  publico: "publico",
  comprobantes: "comprobantes",
} as const;

export const CARPETA = {
  productos: "productos",
  banners: "banners",
  marcas: "marcas",
  rutinas: "rutinas",
} as const;

export type CarpetaPublica = keyof typeof CARPETA;

/** URL pública de un archivo del bucket `publico`. */
export function urlPublica(supabaseUrl: string, path: string): string {
  return `${supabaseUrl}/storage/v1/object/public/${BUCKET.publico}/${path}`;
}

/** Construye la ruta dentro del bucket público, p. ej. productos/abc.webp */
export function rutaPublica(carpeta: CarpetaPublica, nombreArchivo: string): string {
  return `${CARPETA[carpeta]}/${nombreArchivo}`;
}
