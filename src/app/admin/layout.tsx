import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import AdminSidebar from "@/components/admin/Sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Don't gate the login page
  // Layout wraps all /admin/* routes including /admin/login
  // We check pathname via a different mechanism — just check session for non-login pages

  if (!session) {
    // Allow login page to render without redirect loop
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}
