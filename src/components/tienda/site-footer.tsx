"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SocialLinks, type RedesSociales } from "@/components/tienda/social-links";
import { BrandLogo } from "@/components/tienda/brand-logo";

const COLUMNS = [
  {
    title: "Tienda",
    links: [
      { href: "/catalogo", label: "Catálogo" },
      { href: "/catalogo", label: "Marcas" },
      { href: "/rutinas", label: "Arma tu rutina" },
      { href: "/blog", label: "Tips de skincare" },
    ],
  },
  {
    title: "Ayuda",
    links: [
      { href: "/contacto", label: "Contacto" },
      { href: "/preguntas-frecuentes", label: "Preguntas frecuentes" },
      { href: "/pedido", label: "Seguir mi pedido" },
      { href: "/nosotros", label: "Nosotros" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/terminos", label: "Términos y condiciones" },
      { href: "/privacidad", label: "Política de privacidad" },
      { href: "/libro-de-reclamaciones", label: "Libro de reclamaciones" },
    ],
  },
];

export function SiteFooter({
  redes,
  logoUrl,
}: {
  redes: RedesSociales;
  logoUrl: string | null;
}) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="border-t border-border/60 bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-xs">
            <BrandLogo logoUrl={logoUrl} />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Skincare coreano para la piel loretana. Productos originales,
              rutinas a tu medida y asesoría personalizada por WhatsApp.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Iquitos, Perú · Lun a Sáb 9:00 a.m. – 6:00 p.m.
            </p>
            <SocialLinks redes={redes} className="mt-5" />
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-foreground">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} AGAPE FAMILY S.A.C. Todos los derechos reservados.</p>
          <p>Hecho con cuidado y amor 🌸</p>
        </div>
      </div>
    </footer>
  );
}
