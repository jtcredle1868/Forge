import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { SidebarNav } from "@/components/layout/SidebarNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0c0c14" }}>
      <SidebarNav user={{ name: session.user.name, email: session.user.email }} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
