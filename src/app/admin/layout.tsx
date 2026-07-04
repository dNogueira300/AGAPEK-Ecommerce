import { redirect } from "next/navigation";
import { getPerfil, ROLES_ADMIN } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await getPerfil();
  if (!data) redirect("/login?redirect=/admin");
  if (!ROLES_ADMIN.includes(data.perfil.rol)) redirect("/");

  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      <AdminSidebar rol={data.perfil.rol} nombre={data.perfil.nombre} />
      <main className="flex-1 overflow-x-hidden p-5 sm:p-8">{children}</main>
    </div>
  );
}
