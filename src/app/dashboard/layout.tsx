import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  BookOpen, FolderOpen, Settings, CreditCard,
  Flame, LogOut, ChevronRight
} from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const navItems = [
    { href: "/dashboard", icon: <Flame size={16} />, label: "Dashboard" },
    { href: "/dashboard/projects", icon: <FolderOpen size={16} />, label: "Projects" },
    { href: "/dashboard/settings", icon: <Settings size={16} />, label: "Settings" },
    { href: "/dashboard/billing", icon: <CreditCard size={16} />, label: "Billing" },
  ];

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0c0c14" }}>
      {/* Sidebar */}
      <aside
        className="w-64 flex flex-col flex-shrink-0"
        style={{ background: "#13131f", borderRight: "1px solid #2a2a45" }}
      >
        {/* Logo */}
        <div className="p-6 border-b" style={{ borderColor: "#2a2a45" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
            >
              <Flame size={16} style={{ color: "#0c0c14" }} />
            </div>
            <div>
              <h1 className="text-sm font-bold forge-gradient-text">The Forge</h1>
              <p className="text-xs" style={{ color: "#5a5a7a" }}>Perfect Prose</p>
            </div>
          </div>
        </div>

        {/* User */}
        <div className="px-4 py-4 border-b" style={{ borderColor: "#2a2a45" }}>
          <div
            className="flex items-center gap-3 rounded-xl p-3"
            style={{ background: "#1a1a2e" }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "#f59e0b" }}
            >
              <span className="text-xs font-bold" style={{ color: "#0c0c14" }}>
                {session.user.email?.[0]?.toUpperCase() ?? "W"}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: "#f0f0f8" }}>
                {session.user.name ?? "Writer"}
              </p>
              <p className="text-xs truncate" style={{ color: "#5a5a7a" }}>
                {session.user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-medium transition-all group"
              style={{ color: "#9898b8" }}
              onMouseEnter={(e: React.MouseEvent) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.background = "rgba(255,255,255,0.04)";
                el.style.color = "#f0f0f8";
              }}
              onMouseLeave={(e: React.MouseEvent) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.background = "transparent";
                el.style.color = "#9898b8";
              }}
            >
              <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                {item.icon}
              </span>
              {item.label}
              <ChevronRight size={12} className="ml-auto opacity-0 group-hover:opacity-50" />
            </Link>
          ))}
        </nav>

        {/* Sign out */}
        <div className="p-4 border-t" style={{ borderColor: "#2a2a45" }}>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ color: "#5a5a7a" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.1)";
                (e.currentTarget as HTMLButtonElement).style.color = "#ef4444";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                (e.currentTarget as HTMLButtonElement).style.color = "#5a5a7a";
              }}
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
