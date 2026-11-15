import { z } from "zod";

/**
 * Política de contraseñas compartida por registro, restablecimiento y el cambio
 * desde el panel admin. Se valida igual en el cliente (checklist) y el servidor.
 */
export const REQUISITOS_PASSWORD: { texto: string; cumple: (p: string) => boolean }[] = [
  { texto: "Al menos 8 caracteres", cumple: (p) => p.length >= 8 },
  { texto: "Una letra mayúscula", cumple: (p) => /[A-ZÁÉÍÓÚÑ]/.test(p) },
  { texto: "Una letra minúscula", cumple: (p) => /[a-záéíóúñ]/.test(p) },
  { texto: "Un número", cumple: (p) => /\d/.test(p) },
];

export const passwordSchema = z.string().superRefine((p, ctx) => {
  const faltan = REQUISITOS_PASSWORD.filter((r) => !r.cumple(p)).map((r) =>
    r.texto.toLowerCase(),
  );
  if (faltan.length) {
    ctx.addIssue({
      code: "custom",
      message: `La contraseña debe tener: ${faltan.join(", ")}.`,
    });
  }
});

/** Traduce los errores de Supabase Auth al cambiar una contraseña. */
export function mensajeErrorPassword(error: {
  code?: string;
  message: string;
  reasons?: string[];
}): string {
  switch (error.code) {
    case "weak_password": {
      const r = error.reasons ?? [];
      if (r.includes("pwned"))
        return "Esa contraseña aparece en filtraciones de datos conocidas. Elige otra distinta.";
      if (r.includes("characters"))
        return "La contraseña debe combinar mayúsculas, minúsculas, números y símbolos (p. ej. ! @ # $).";
      if (r.includes("length")) return "La contraseña es demasiado corta.";
      return "La contraseña es demasiado débil. Usa una más segura.";
    }
    case "same_password":
      return "La nueva contraseña debe ser distinta de la actual.";
    case "user_not_found":
      return "El usuario ya no existe.";
    default:
      return `No se pudo cambiar la contraseña (${error.message}).`;
  }
}
