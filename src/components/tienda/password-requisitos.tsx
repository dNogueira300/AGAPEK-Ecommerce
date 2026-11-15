import { Check, Circle } from "lucide-react";
import { REQUISITOS_PASSWORD } from "@/lib/password";
import { cn } from "@/lib/utils";

/** Checklist en vivo de los requisitos mínimos de la contraseña. */
export function PasswordRequisitos({ valor }: { valor: string }) {
  return (
    <ul className="grid gap-1 text-xs sm:grid-cols-2">
      {REQUISITOS_PASSWORD.map((r) => {
        const ok = r.cumple(valor);
        return (
          <li
            key={r.texto}
            className={cn(
              "flex items-center gap-1.5",
              ok ? "text-[color:var(--chart-5)]" : "text-muted-foreground",
            )}
          >
            {ok ? <Check className="size-3.5" /> : <Circle className="size-3" />}
            {r.texto}
          </li>
        );
      })}
    </ul>
  );
}
