import type { Metadata } from "next";
import { LegalPage, type Seccion } from "@/components/tienda/legal-page";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description: "Términos y condiciones de uso y compra en la tienda AGAPEK.",
};

const SECCIONES: Seccion[] = [
  {
    titulo: "Generalidades",
    parrafos: [
      "AGAPEK es una tienda virtual operada por AGAPE FAMILY S.A.C., dedicada a la venta de productos de skincare coreano (K-Beauty). Al usar este sitio y realizar una compra, aceptas los presentes términos y condiciones.",
      "Nos reservamos el derecho de actualizar estos términos en cualquier momento. La versión vigente será siempre la publicada en esta página.",
    ],
  },
  {
    titulo: "Productos y precios",
    parrafos: [
      "Los precios se muestran en soles (S/) e incluyen los impuestos aplicables. Los precios y la disponibilidad de los productos pueden variar sin previo aviso.",
      "Nos esforzamos por mostrar la información de los productos de forma precisa; sin embargo, las imágenes son referenciales y pueden presentar ligeras variaciones respecto al producto físico.",
    ],
  },
  {
    titulo: "Pedidos y pagos",
    parrafos: [
      "El pedido se registra al finalizar la compra y queda pendiente hasta que confirmemos el pago y el stock. Para pagos con Yape, Plin, transferencia o depósito, deberás subir tu comprobante para su validación.",
      "Nos reservamos el derecho de rechazar o cancelar pedidos ante indicios de error, fraude o falta de stock, informándote oportunamente.",
    ],
  },
  {
    titulo: "Envíos y entregas",
    parrafos: [
      "Realizamos delivery en Iquitos y envíos nacionales a través de couriers (Shalom, Olva). Los costos y tiempos de entrega dependen de la zona y del operador logístico, y se informan durante el checkout o por WhatsApp.",
      "También ofrecemos recojo en almacén, coordinado por WhatsApp.",
    ],
  },
  {
    titulo: "Cambios y devoluciones",
    parrafos: [
      "Por tratarse de productos de cuidado personal, solo se aceptan cambios o devoluciones por producto defectuoso o error en el despacho, dentro de los plazos que establece la ley. Para gestionarlo, escríbenos por WhatsApp con tu código de pedido.",
    ],
  },
  {
    titulo: "Propiedad intelectual",
    parrafos: [
      "Las marcas, logotipos, textos e imágenes del sitio pertenecen a sus respectivos titulares. Queda prohibida su reproducción sin autorización.",
    ],
  },
  {
    titulo: "Protección de datos y Libro de Reclamaciones",
    parrafos: [
      "El tratamiento de tus datos personales se rige por nuestra Política de Privacidad, conforme a la Ley N.° 29733.",
      "Contamos con un Libro de Reclamaciones virtual, disponible en la sección correspondiente, conforme a la normativa de Indecopi.",
    ],
  },
  {
    titulo: "Contacto",
    parrafos: [
      "Para cualquier consulta sobre estos términos, escríbenos por WhatsApp o a través de la sección de Contacto.",
    ],
  },
];

export default function TerminosPage() {
  return (
    <LegalPage
      title="Términos y condiciones"
      actualizado="julio de 2026"
      intro="Estos términos regulan el uso de la tienda AGAPEK y la compra de nuestros productos. Te recomendamos leerlos antes de realizar tu pedido."
      secciones={SECCIONES}
    />
  );
}
