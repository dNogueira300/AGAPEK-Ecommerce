import type { Metadata } from "next";
import { LegalPage, type Seccion } from "@/components/tienda/legal-page";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Cómo AGAPEK recopila, usa y protege tus datos personales.",
};

const SECCIONES: Seccion[] = [
  {
    titulo: "Responsable del tratamiento",
    parrafos: [
      "AGAPE FAMILY S.A.C. (AGAPEK), con operaciones en Iquitos, Perú, es responsable del tratamiento de tus datos personales conforme a la Ley N.° 29733, Ley de Protección de Datos Personales, y su reglamento.",
    ],
  },
  {
    titulo: "Datos que recopilamos",
    parrafos: [
      "Recopilamos los datos que nos proporcionas al registrarte y comprar: nombre, DNI o RUC, celular, correo electrónico y dirección de entrega.",
      "También podemos registrar información de tus pedidos y comprobantes de pago para gestionar tus compras.",
    ],
  },
  {
    titulo: "Finalidad del tratamiento",
    parrafos: [
      "Usamos tus datos para procesar y entregar tus pedidos, validar pagos, brindarte asesoría y soporte, y comunicarnos contigo sobre tu compra.",
      "No vendemos ni cedemos tus datos a terceros con fines comerciales.",
    ],
  },
  {
    titulo: "Encargados y proveedores",
    parrafos: [
      "Para operar la tienda utilizamos proveedores de infraestructura (alojamiento y base de datos) y de logística (couriers como Shalom u Olva), que tratan tus datos únicamente para prestar dichos servicios.",
    ],
  },
  {
    titulo: "Conservación y seguridad",
    parrafos: [
      "Conservamos tus datos mientras mantengas una relación con nosotros y por los plazos que exija la ley. Aplicamos medidas técnicas y organizativas razonables para proteger tu información, incluyendo el almacenamiento seguro de los comprobantes de pago.",
    ],
  },
  {
    titulo: "Tus derechos",
    parrafos: [
      "Puedes ejercer tus derechos de acceso, rectificación, cancelación y oposición (ARCO) sobre tus datos personales escribiéndonos por WhatsApp o a través de la sección de Contacto.",
    ],
  },
  {
    titulo: "Cambios en esta política",
    parrafos: [
      "Podemos actualizar esta política para reflejar cambios legales u operativos. La versión vigente será la publicada en esta página.",
    ],
  },
];

export default function PrivacidadPage() {
  return (
    <LegalPage
      title="Política de privacidad"
      actualizado="julio de 2026"
      intro="En AGAPEK cuidamos tu información con el mismo cariño con el que cuidamos tu piel. Aquí te explicamos cómo tratamos tus datos personales."
      secciones={SECCIONES}
    />
  );
}
