"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Flame, FolderOpen, Settings, CreditCard, LogOut,
  BookOpen, ChevronRight
} from "lucide-react";

interface SidebarNavProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

const NAV_ITEMS = [
  { href: "/dashboard", icon: Flame, label: "Dashboard", exact: true },
  { href: "/dashboard/projects", icon: FolderOpen, label: "Projects", exact: false },
  { href: "/dashboard/settings", icon: Settings, label: "Settings", exact: false },
  { href: "/dashboard/billing", icon: CreditCard, label: "Billing", exact: false },
];

export function SidebarNav({ user }: SidebarNavProps) {
  const pathname = usePathname();

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : user.email?.[0]?.toUpperCase() ?? "W";

  return (
    <aside
      className="w-64 flex flex-col flex-shrink-0 h-screen sticky top-0"
      style={{ background: "#13131f", borderRight: "1px solid #2a2a45" }}
    >
      {/* Logo */}
      <div className="p-6 border-b" style={{ borderColor: "#2a2a45" }}>
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
          >
            <Flame size={16} style={{ color: "#0c0c14" }} />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: "#f0f0f8" }}>The Forge</p>
            <p className="text-xs" style={{ color: "#5a5a7a" }}>Perfect Prose</p>
          </div>
        </Link>
      </div>

      {/* User */}
      <div className="px-4 py-4 border-b" style={{ borderColor: "#2a2a45" }}>
        <div
          className="flex items-center gap-3 rounded-xl p-3"
          style={{ background: "#1a1a2e" }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
            style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#0c0c14" }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: "#f0f0f8" }}>
              {user.name ?? "Writer"}
            </p>
            <p className="text-xs truncate" style={{ color: "#5a5a7a" }}>
              {user.email}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <p className="px-3 text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#35354a" }}>
          Workspace
        </p>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-sm font-medium transition-all group"
              style={{
                background: active ? "rgba(245,158,11,0.1)" : "transparent",
                color: active ? "#f59e0b" : "#9898b8",
                borderLeft: active ? "2px solid #f59e0b" : "2px solid transparent",
              }}
            >
              <item.icon size={15} />
              {item.label}
              {active && <ChevronRight size={12} className="ml-auto" style={{ color: "#f59e0b" }} />}
            </Link>
          );
        })}

        <div className="mt-6 pt-6 border-t" style={{ borderColor: "#2a2a45" }}>
          <p className="px-3 text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#35354a" }}>
            Resources
          </p>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium"
            style={{ color: "#9898b8" }}
          >
            <BookOpen size={15} />
            Writing Guides
          </Link>
        </div>
      </nav>

      {/* Sign out */}
      <div className="p-4 border-t" style={{ borderColor: "#2a2a45" }}>
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group"
            style={{ color: "#5a5a7a" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.08)";
              (e.currentTarget as HTMLButtonElement).style.color = "#ef4444";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              (e.currentTarget as HTMLButtonElement).style.color = "#5a5a7a";
            }}
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}
