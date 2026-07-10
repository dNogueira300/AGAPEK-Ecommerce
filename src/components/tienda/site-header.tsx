"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { contarItems, useCart, useCartHydrated } from "@/stores/cart";
import { BrandLogo } from "@/components/tienda/brand-logo";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/rutinas", label: "Rutinas" },
  { href: "/blog", label: "Blog" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
];

interface SesionHeader {
  nombre: string;
}

export function SiteHeader({
  sesion,
  logoUrl,
}: {
  sesion: SesionHeader | null;
  logoUrl: string | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const items = useCart((s) => s.items);
  const hydrated = useCartHydrated();
  const cartCount = hydrated ? contarItems(items) : 0;
  const primerNombre = sesion?.nombre.split(" ")[0];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname.startsWith("/admin")) return null;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b backdrop-blur transition-[background-color,border-color,box-shadow] duration-300",
        scrolled
          ? "border-border/60 bg-background/85 shadow-foreground/5 supports-[backdrop-filter]:bg-background/70 shadow-md"
          : "bg-background/60 supports-[backdrop-filter]:bg-background/50 border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center">
          <BrandLogo logoUrl={logoUrl} />
        </Link>

        {/* Desktop nav */}
        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-foreground/80 hover:bg-secondary hover:text-foreground rounded-full px-3 py-2 text-sm font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Search */}
        <form
          action="/catalogo"
          className="ml-auto hidden max-w-xs flex-1 items-center md:flex"
        >
          <div className="relative w-full">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <input
              type="search"
              name="q"
              placeholder="Busca productos, marcas o rutinas"
              aria-label="Buscar"
              className="border-input bg-card text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/30 h-10 w-full rounded-full border pr-4 pl-9 text-sm transition-colors outline-none focus-visible:ring-2"
            />
          </div>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-1 md:ml-2">
          <IconButton label="Favoritos" href="/favoritos">
            <Heart className="size-5" />
          </IconButton>
          <IconButton label="Carrito" href="/carrito" badge={cartCount}>
            <ShoppingBag className="size-5" />
          </IconButton>
          <Link
            href={sesion ? "/perfil" : "/login"}
            className="bg-secondary text-secondary-foreground hover:bg-accent ml-1 hidden items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors sm:inline-flex"
          >
            <User className="size-4" />
            {sesion ? (primerNombre ?? "Mi perfil") : "Ingresar"}
          </Link>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            className="text-foreground hover:bg-secondary ml-1 inline-flex size-10 items-center justify-center rounded-full transition-colors lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-border/60 bg-background border-t lg:hidden">
          <div className="mx-auto max-w-7xl space-y-3 px-4 py-3 sm:px-6">
            {/* Buscador (solo cuando el de arriba está oculto) */}
            <form action="/catalogo" className="md:hidden">
              <div className="relative">
                <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <input
                  type="search"
                  name="q"
                  placeholder="Busca productos, marcas…"
                  aria-label="Buscar"
                  className="border-input bg-card text-foreground focus-visible:border-ring focus-visible:ring-ring/30 h-10 w-full rounded-full border pr-4 pl-9 text-sm outline-none focus-visible:ring-2"
                />
              </div>
            </form>

            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-foreground/85 hover:bg-secondary rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              {/* Perfil/login (solo cuando el botón de arriba está oculto) */}
              <Link
                href={sesion ? "/perfil" : "/login"}
                onClick={() => setOpen(false)}
                className="text-foreground/85 hover:bg-secondary flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors sm:hidden"
              >
                <User className="size-4" />
                {sesion ? (primerNombre ?? "Mi perfil") : "Ingresar"}
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

function IconButton({
  children,
  label,
  href,
  badge,
}: {
  children: React.ReactNode;
  label: string;
  href: string;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="text-foreground hover:bg-secondary relative inline-flex size-10 items-center justify-center rounded-full transition-colors"
    >
      {children}
      {typeof badge === "number" && (
        <span
          key={badge}
          className={cn(
            "animate-in zoom-in-50 bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 flex min-w-4.5 items-center justify-center rounded-full px-1 text-[10px] leading-4 font-semibold duration-300 motion-reduce:animate-none",
            badge === 0 && "hidden",
          )}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}
