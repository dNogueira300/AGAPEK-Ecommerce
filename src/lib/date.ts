import { formatInTimeZone, toZonedTime } from "date-fns-tz";

/**
 * Zona horaria del negocio. Perú es America/Lima = UTC-5 fijo (sin horario de verano).
 * Regla del proyecto: guardar SIEMPRE en UTC, convertir SOLO al mostrar.
 * Todo formateo de fechas debe pasar por estas funciones para evitar
 * desajustes de hidratación entre servidor (UTC) y cliente.
 */
export const APP_TZ = "America/Lima";

/** Formatea una fecha (Date o ISO string) en hora de Lima. */
export function formatFecha(fecha: Date | string, fmt = "dd/MM/yyyy HH:mm"): string {
  return formatInTimeZone(new Date(fecha), APP_TZ, fmt);
}

/** Solo la fecha, p. ej. 02/07/2026. */
export function formatFechaCorta(fecha: Date | string): string {
  return formatFecha(fecha, "dd/MM/yyyy");
}

/** Convierte una fecha UTC a un Date "en zona Lima" para cálculos locales. */
export function aHoraLima(fecha: Date | string): Date {
  return toZonedTime(new Date(fecha), APP_TZ);
}

/**
 * Indica si el negocio está abierto según horario Lun–Sáb 9:00–18:00 (hora de Lima).
 * El horario definitivo será configurable desde el panel; esto es el valor por defecto.
 */
export function estaAbierto(ahora: Date = new Date()): boolean {
  const local = aHoraLima(ahora);
  const dia = local.getDay(); // 0=Dom, 6=Sáb
  const hora = local.getHours();
  const esDiaHabil = dia >= 1 && dia <= 6; // Lunes a Sábado
  return esDiaHabil && hora >= 9 && hora < 18;
}
