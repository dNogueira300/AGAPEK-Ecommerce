"use client";

import { cambiarRol } from "@/lib/usuario-actions";

const ROLES = [
  { value: "CLIENTE", label: "Cliente" },
  { value: "VENDEDOR", label: "Vendedor" },
  { value: "TECNICO", label: "Técnico" },
  { value: "ADMIN", label: "Administrador" },
];

export function RolSelect({
  id,
  rol,
  disabled,
}: {
  id: string;
  rol: string;
  disabled?: boolean;
}) {
  return (
    <form action={cambiarRol.bind(null, id)}>
      <select
        name="rol"
        defaultValue={rol}
        disabled={disabled}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="h-9 rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none focus-visible:border-ring disabled:opacity-50"
      >
        {ROLES.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
    </form>
  );
}
