"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { urlWhatsApp } from "@/lib/whatsapp";

const input =
  "h-11 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";

export function ContactForm({ whatsapp }: { whatsapp: string | null }) {
  const [nombre, setNombre] = useState("");
  const [mensaje, setMensaje] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsapp) return;
    const texto = `¡Hola AGAPEK! 🌸 Soy ${nombre || "un cliente"}.\n${mensaje}`;
    window.open(urlWhatsApp(whatsapp, texto), "_blank", "noopener,noreferrer");
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-6">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground" htmlFor="nombre">Tu nombre</label>
        <input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} className={input} placeholder="Nombre" />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground" htmlFor="mensaje">Mensaje</label>
        <textarea
          id="mensaje"
          required
          rows={4}
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
          placeholder="Cuéntanos en qué te ayudamos…"
        />
      </div>
      <button
        type="submit"
        disabled={!whatsapp}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 disabled:opacity-60"
      >
        <MessageCircle className="size-4" />
        Enviar por WhatsApp
      </button>
    </form>
  );
}
