"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  BookOpen,
  ChevronDown,
  ExternalLink,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  Package,
  Quote,
  Settings,
  ShoppingCart,
  Sparkles,
  Store,
  Tag,
  Tags,
  UserCog,
  Users,
  X,
} from "lucide-react";
import type { Rol } from "@prisma/client";
import { signOutAction } from "@/lib/auth-actions";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: typeof Package;
  roles: readonly Rol[];
}

const DASHBOARD: NavItem = {
  href: "/admin",
  label: "Dashboard",
  icon: LayoutDashboard,
  roles: ["ADMIN", "TECNICO"],
};

/** Menú agrupado por categorías (grupos sin ítems visibles para el rol se ocultan). */
const GRUPOS: { id: string; label: string; items: NavItem[] }[] = [
  {
    id: "catalogo",
    label: "Catálogo",
    items: [
      {
        href: "/admin/productos",
        label: "Productos",
        icon: Package,
        roles: ["ADMIN", "TECNICO"],
      },
      {
        href: "/admin/categorias",
        label: "Categorías",
        icon: Tags,
        roles: ["ADMIN", "TECNICO"],
      },
      {
        href: "/admin/marcas",
        label: "Marcas",
        icon: Store,
        roles: ["ADMIN", "TECNICO"],
      },
      {
        href: "/admin/rutinas",
        label: "Rutinas",
        icon: Sparkles,
        roles: ["ADMIN", "TECNICO"],
      },
    ],
  },
  {
    id: "ventas",
    label: "Ventas",
    items: [
      {
        href: "/admin/pedidos",
        label: "Pedidos",
        icon: ShoppingCart,
        roles: ["ADMIN", "TECNICO", "VENDEDOR"],
      },
      {
        href: "/admin/cupones",
        label: "Cupones",
        icon: Tag,
        roles: ["ADMIN", "TECNICO"],
      },
      {
        href: "/admin/clientes",
        label: "Clientes",
        icon: Users,
        roles: ["ADMIN", "TECNICO", "VENDEDOR"],
      },
      {
        href: "/admin/reclamos",
        label: "Reclamos",
        icon: BookOpen,
        roles: ["ADMIN", "TECNICO"],
      },
      {
        href: "/admin/reportes",
        label: "Reportes",
        icon: BarChart3,
        roles: ["ADMIN", "TECNICO"],
      },
    ],
  },
  {
    id: "contenido",
    label: "Contenido",
    items: [
      {
        href: "/admin/banners",
        label: "Banners",
        icon: ImageIcon,
        roles: ["ADMIN", "TECNICO"],
      },
      {
        href: "/admin/blog",
        label: "Blog",
        icon: Newspaper,
        roles: ["ADMIN", "TECNICO"],
      },
      {
        href: "/admin/testimonios",
        label: "Testimonios",
        icon: Quote,
        roles: ["ADMIN", "TECNICO"],
      },
    ],
  },
  {
    id: "sistema",
    label: "Sistema",
    items: [
      {
        href: "/admin/configuracion",
        label: "Configuración",
        icon: Settings,
        roles: ["ADMIN", "TECNICO"],
      },
      {
        href: "/admin/usuarios",
        label: "Usuarios",
        icon: UserCog,
        roles: ["ADMIN", "TECNICO"],
      },
    ],
  },
];

export function AdminSidebar({
  rol,
  nombre,
  reclamosPendientes = 0,
  logoUrl = null,
}: {
  rol: Rol;
  nombre: string;
  reclamosPendientes?: number;
  logoUrl?: string | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // Apertura manual por grupo; si no se ha tocado, se abre el grupo de la ruta activa.
  const [manual, setManual] = useState<Record<string, boolean>>({});

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const grupos = GRUPOS.map((g) => ({
    ...g,
    items: g.items.filter((it) => it.roles.includes(rol)),
  })).filter((g) => g.items.length > 0);

  const abierto = (g: (typeof grupos)[number]) =>
    manual[g.id] ?? g.items.some((it) => isActive(it.href));

  const badgeReclamos = (activo: boolean) => (
    <span
      className={cn(
        "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] leading-none font-semibold",
        activo
          ? "bg-primary-foreground text-primary"
          : "bg-primary text-primary-foreground",
      )}
      aria-label={`${reclamosPendientes} reclamos por atender`}
    >
      {reclamosPendientes > 99 ? "99+" : reclamosPendientes}
    </span>
  );

  const itemLink = (it: NavItem, indent = false) => (
    <Link
      key={it.href}
      href={it.href}
      onClick={() => setOpen(false)}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
        indent && "ml-2",
        isActive(it.href)
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-foreground/75 hover:bg-secondary hover:text-foreground",
      )}
    >
      <it.icon className="size-4.5" />
      <span className="flex-1">{it.label}</span>
      {it.href === "/admin/reclamos" &&
        reclamosPendientes > 0 &&
        badgeReclamos(isActive(it.href))}
    </Link>
  );

  const nav = (
    <nav className="flex flex-col gap-1">
      {DASHBOARD.roles.includes(rol) && itemLink(DASHBOARD)}

      {grupos.map((g) => {
        const isOpen = abierto(g);
        const pendientesOcultos =
          !isOpen &&
          reclamosPendientes > 0 &&
          g.items.some((it) => it.href === "/admin/reclamos");
        return (
          <div key={g.id} className="mt-1">
            <button
              type="button"
              onClick={() => setManual((m) => ({ ...m, [g.id]: !isOpen }))}
              aria-expanded={isOpen}
              className="text-muted-foreground hover:text-foreground flex w-full items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold tracking-[0.14em] uppercase transition-colors"
            >
              <span className="flex-1 text-left">{g.label}</span>
              {pendientesOcultos && badgeReclamos(false)}
              <ChevronDown
                className={cn(
                  "size-4 transition-transform duration-200",
                  !isOpen && "-rotate-90",
                )}
              />
            </button>
            <div
              className={cn(
                "grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="flex flex-col gap-1 overflow-hidden">
                {g.items.map((it) => itemLink(it, true))}
              </div>
            </div>
          </div>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Topbar móvil */}
      <div className="border-border bg-card flex items-center justify-between border-b px-4 py-3 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="AGAPEK" className="h-8 w-auto object-contain" />
          ) : (
            <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-full">
              <Sparkles className="size-4" />
            </span>
          )}
          <span className="font-display text-base font-semibold">AGAPEK Admin</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menú"
          className="hover:bg-secondary inline-flex size-9 items-center justify-center rounded-lg"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open && (
        <div className="border-border bg-card border-b px-4 py-3 lg:hidden">
          {nav}
          <SidebarFooter />
        </div>
      )}

      {/* Sidebar desktop */}
      <aside className="border-border bg-card hidden w-64 shrink-0 flex-col border-r lg:flex">
        <div className="border-border flex h-16 items-center gap-2.5 border-b px-5">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="AGAPEK" className="h-9 w-auto object-contain" />
          ) : (
            <span className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-full">
              <Sparkles className="size-4.5" strokeWidth={2.25} />
            </span>
          )}
          <div className="leading-none">
            <p className="font-display text-base font-semibold">AGAPEK</p>
            <p className="text-muted-foreground text-[10px] tracking-[0.2em] uppercase">
              Admin
            </p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3">{nav}</div>
        <div className="border-border border-t p-3">
          <p className="text-muted-foreground px-3.5 pb-2 text-xs">
            {nombre} · <span className="capitalize">{rol.toLowerCase()}</span>
          </p>
          <SidebarFooter />
        </div>
      </aside>
    </>
  );
}

function SidebarFooter() {
  return (
    <div className="flex flex-col gap-1">
      <Link
        href="/"
        className="text-foreground/75 hover:bg-secondary flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors"
      >
        <ExternalLink className="size-4.5" />
        Ver tienda
      </Link>
      <form action={signOutAction}>
        <button
          type="submit"
          className="text-foreground/75 hover:bg-secondary flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors"
        >
          <LogOut className="size-4.5" />
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
