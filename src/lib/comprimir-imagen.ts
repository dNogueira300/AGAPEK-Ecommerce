/**
 * Reduce en el navegador las imágenes pesadas (p. ej. fotos de celular de 3–8 MB)
 * antes de enviarlas a un Server Action, cuyo cuerpo tiene un límite de tamaño
 * (y Vercel corta en 4.5 MB). El servidor vuelve a optimizar con sharp, así que
 * aquí solo importa que el archivo llegue liviano.
 */

const UMBRAL = 900 * 1024; // por debajo de esto no se toca
const LADO_MAX = 2000;
const TIPOS = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

export async function comprimirImagen(file: File): Promise<File> {
  if (file.size <= UMBRAL || !TIPOS.includes(file.type)) return file;
  try {
    const bmp = await createImageBitmap(file);
    const escala = Math.min(1, LADO_MAX / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * escala);
    canvas.height = Math.round(bmp.height * escala);
    canvas.getContext("2d")?.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    bmp.close();
    // WebP conserva la transparencia de los PNG (logos).
    const blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob(res, "image/webp", 0.85),
    );
    if (!blob || blob.size >= file.size) return file;
    const nombre = file.name.replace(/\.[^.]+$/, "") + ".webp";
    return new File([blob], nombre, { type: "image/webp" });
  } catch {
    return file; // formato no decodificable en este navegador → se envía tal cual
  }
}

/**
 * Comprime el archivo elegido en un <input type="file"> y lo reemplaza en el
 * propio input, para que el formulario envíe la versión liviana.
 */
export async function comprimirInput(input: HTMLInputElement): Promise<void> {
  const file = input.files?.[0];
  if (!file) return;
  const nuevo = await comprimirImagen(file);
  if (nuevo === file) return;
  const dt = new DataTransfer();
  dt.items.add(nuevo);
  input.files = dt.files;
}
