import type { TipoCupon } from "@prisma/client";

/** Redondea a 2 decimales (céntimos). */
function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Descuento en soles para un subtotal dado. Nunca supera el subtotal.
 * PORCENTAJE: `valor` es 0-100. MONTO_FIJO: `valor` es soles.
 */
export function calcularDescuento(
  tipo: TipoCupon,
  valor: number,
  subtotal: number,
): number {
  if (subtotal <= 0) return 0;
  const bruto = tipo === "PORCENTAJE" ? (subtotal * valor) / 100 : valor;
  return r2(Math.min(Math.max(bruto, 0), subtotal));
}
