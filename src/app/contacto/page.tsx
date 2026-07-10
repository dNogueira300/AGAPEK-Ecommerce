import type { Metadata } from "next";
import { Clock, Share2, MapPin, MessageCircle } from "lucide-react";
import { getConfigValores } from "@/lib/cache";
import { ContactForm } from "@/components/tienda/contact-form";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Escríbenos por WhatsApp y recibe asesoría personalizada de skincare coreano.",
};
export const dynamic = "force-dynamic";

const str = (v: unknown, def = "") => (typeof v === "string" ? v : def);

export default async function ContactoPage() {
  const c = await getConfigValores(["whatsapp", "horario"]);
  const whatsapp = str(c.whatsapp) || null;
  const horario = str(c.horario, "Lun a Sáb 9:00 a.m. – 6:00 p.m.");
  const waDisplay = whatsapp ? whatsapp.replace(/^51/, "") : "—";

  const items = [
    { icon: MessageCircle, titulo: "WhatsApp", texto: waDisplay },
    { icon: Clock, titulo: "Horario", texto: horario },
    { icon: MapPin, titulo: "Ubicación", texto: "Iquitos, Perú · Envíos nacionales" },
    { icon: Share2, titulo: "Redes", texto: "AgapeK (Facebook / Instagram)" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="text-center">
        <h1 className="font-display text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
          Contáctanos
        </h1>
        <p className="text-muted-foreground mx-auto mt-3 max-w-xl text-sm leading-relaxed">
          Estamos para ayudarte a elegir tus productos y armar tu rutina. La forma más
          rápida es por WhatsApp.
        </p>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {/* Info */}
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((it) => (
            <div key={it.titulo} className="border-border bg-card rounded-2xl border p-6">
              <span className="bg-secondary text-primary flex size-11 items-center justify-center rounded-xl">
                <it.icon className="size-5" />
              </span>
              <h2 className="font-display text-foreground mt-4 text-base font-semibold">
                {it.titulo}
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">{it.texto}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <div>
          <ContactForm whatsapp={whatsapp} />
        </div>
      </div>
    </div>
  );
}
