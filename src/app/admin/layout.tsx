import { redirect } from "next/navigation";
import { getPerfil, ROLES_ADMIN } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLogoUrl } from "@/lib/config";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const data = await getPerfil();
  if (!data) redirect("/login?redirect=/admin");
  if (!ROLES_ADMIN.includes(data.perfil.rol)) redirect("/");

  // Aviso de reclamos por atender (solo roles que ven el módulo) + logo administrable.
  const [reclamosPendientes, logoUrl] = await Promise.all([
    ["ADMIN", "TECNICO"].includes(data.perfil.rol)
      ? prisma.reclamo.count({ where: { atendido: false } })
      : Promise.resolve(0),
    getLogoUrl(),
  ]);

  return (
    <div className="bg-background flex min-h-screen flex-col lg:flex-row">
      <AdminSidebar
        rol={data.perfil.rol}
        nombre={data.perfil.nombre}
        reclamosPendientes={reclamosPendientes}
        logoUrl={logoUrl}
      />
      <main className="flex-1 overflow-x-hidden p-5 sm:p-8">{children}</main>
    </div>
  );
}
