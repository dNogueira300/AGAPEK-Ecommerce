import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
  description: "Resolvemos tus dudas sobre productos, pagos, envíos y más en AGAPEK.",
};

const FAQS = [
  {
    q: "¿Los productos son originales?",
    a: "Sí. Trabajamos solo con productos coreanos originales de marcas reconocidas como Beauty of Joseon, COSRX, Anua, Round Lab, SKIN1004 e Isntree.",
  },
  {
    q: "¿Cómo hago un pedido?",
    a: "Agrega los productos al carrito, inicia sesión y completa el checkout con tus datos, método de entrega y pago. Recibirás un código de pedido para seguir su estado.",
  },
  {
    q: "¿Qué métodos de pago aceptan?",
    a: "Yape, Plin, transferencia y depósito BCP, y pago contra entrega. Para los pagos digitales deberás subir tu comprobante en el checkout para validar el pedido.",
  },
  {
    q: "¿Cuánto cuesta el delivery?",
    a: "En Iquitos: S/ 5.00 en zona céntrica y S/ 10.00 en otras zonas. También puedes recoger en almacén. Los envíos nacionales se coordinan por WhatsApp según el courier (Shalom / Olva).",
  },
  {
    q: "¿En cuánto tiempo llega mi pedido?",
    a: "En Iquitos, a partir de las 12 horas de realizado el pedido. Para envíos locales y nacionales, depende de la disponibilidad del operador logístico.",
  },
  {
    q: "¿Puedo consultar por un producto agotado?",
    a: "Sí. Los productos agotados muestran la opción “Consultar por WhatsApp” para avisarte cuando vuelvan a estar disponibles.",
  },
  {
    q: "¿Cómo sigo mi pedido?",
    a: "Con el código que recibes al finalizar la compra puedes consultar el estado de tu pedido en cualquier momento desde la página de seguimiento.",
  },
  {
    q: "¿Dan asesoría de skincare?",
    a: "¡Sí! Escríbenos por WhatsApp y te ayudamos a armar la rutina ideal según tu tipo de piel y objetivos.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Ayuda</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Preguntas frecuentes
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Resolvemos las dudas más comunes. ¿No encuentras tu respuesta? Escríbenos.
        </p>
      </header>

      <div className="mt-10 space-y-3">
        {FAQS.map((f) => (
          <details
            key={f.q}
            className="group rounded-2xl border border-border bg-card p-5 [&_svg]:open:rotate-180"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-medium text-foreground">
              {f.q}
              <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform" />
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
          </details>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-border bg-secondary/50 p-6 text-center">
        <p className="text-sm text-muted-foreground">¿Tienes otra pregunta?</p>
        <Link
          href="/contacto"
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5"
        >
          <MessageCircle className="size-4" />
          Contáctanos
        </Link>
      </div>
    </div>
  );
}
