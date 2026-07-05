"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  BookOpen,
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
  Tags,
  UserCog,
  Users,
  X,
} from "lucide-react";
import type { Rol } from "@prisma/client";
import { signOutAction } from "@/lib/auth-actions";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "TECNICO"] },
  { href: "/admin/productos", label: "Productos", icon: Package, roles: ["ADMIN", "TECNICO"] },
  { href: "/admin/categorias", label: "Categorías", icon: Tags, roles: ["ADMIN", "TECNICO"] },
  { href: "/admin/marcas", label: "Marcas", icon: Store, roles: ["ADMIN", "TECNICO"] },
  { href: "/admin/blog", label: "Blog", icon: Newspaper, roles: ["ADMIN", "TECNICO"] },
  { href: "/admin/banners", label: "Banners", icon: ImageIcon, roles: ["ADMIN", "TECNICO"] },
  { href: "/admin/testimonios", label: "Testimonios", icon: Quote, roles: ["ADMIN", "TECNICO"] },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart, roles: ["ADMIN", "TECNICO", "VENDEDOR"] },
  { href: "/admin/clientes", label: "Clientes", icon: Users, roles: ["ADMIN", "TECNICO", "VENDEDOR"] },
  { href: "/admin/reclamos", label: "Reclamos", icon: BookOpen, roles: ["ADMIN", "TECNICO"] },
  { href: "/admin/reportes", label: "Reportes", icon: BarChart3, roles: ["ADMIN", "TECNICO"] },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings, roles: ["ADMIN", "TECNICO"] },
  { href: "/admin/usuarios", label: "Usuarios", icon: UserCog, roles: ["ADMIN", "TECNICO"] },
] as const;

export function AdminSidebar({ rol, nombre }: { rol: Rol; nombre: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = NAV.filter((n) => (n.roles as readonly string[]).includes(rol));

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const nav = (
    <nav className="flex flex-col gap-1">
      {items.map((it) => (
        <Link
          key={it.href}
          href={it.href}
          onClick={() => setOpen(false)}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
            isActive(it.href)
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-foreground/75 hover:bg-secondary hover:text-foreground",
          )}
        >
          <it.icon className="size-4.5" />
          {it.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <>
      {/* Topbar móvil */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          <span className="font-display text-base font-semibold">AGAPEK Admin</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menú"
          className="inline-flex size-9 items-center justify-center rounded-lg hover:bg-secondary"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open && (
        <div className="border-b border-border bg-card px-4 py-3 lg:hidden">
          {nav}
          <SidebarFooter />
        </div>
      )}

      {/* Sidebar desktop */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Sparkles className="size-4.5" strokeWidth={2.25} />
          </span>
          <div className="leading-none">
            <p className="font-display text-base font-semibold">AGAPEK</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Admin</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3">{nav}</div>
        <div className="border-t border-border p-3">
          <p className="px-3.5 pb-2 text-xs text-muted-foreground">
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
        className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-foreground/75 transition-colors hover:bg-secondary"
      >
        <ExternalLink className="size-4.5" />
        Ver tienda
      </Link>
      <form action={signOutAction}>
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-foreground/75 transition-colors hover:bg-secondary"
        >
          <LogOut className="size-4.5" />
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
