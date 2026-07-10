import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import { SiteHeader } from "@/components/tienda/site-header";
import { SiteFooter } from "@/components/tienda/site-footer";
import { SmoothScroll } from "@/components/tienda/smooth-scroll";
import { getSesionUI } from "@/lib/auth";
import { getRedesSociales, getLogoUrl } from "@/lib/config";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AGAPEK | Boutique K-Beauty",
    template: "%s | AGAPEK",
  },
  description:
    "Skincare coreano para la piel loretana. Compra productos originales, arma tu rutina y recibe asesoría personalizada por WhatsApp.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sesion, redes, logoUrl] = await Promise.all([
    getSesionUI(),
    getRedesSociales(),
    getLogoUrl(),
  ]);

  return (
    <html
      lang="es"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="bg-background text-foreground flex min-h-full flex-col">
        <NextTopLoader
          color="#e65d99"
          height={3}
          showSpinner={false}
          shadow="0 0 8px rgba(230, 93, 153, 0.5)"
        />
        <SmoothScroll />
        <SiteHeader sesion={sesion} logoUrl={logoUrl} />
        <main className="flex-1">{children}</main>
        <SiteFooter redes={redes} logoUrl={logoUrl} />
      </body>
    </html>
  );
}
