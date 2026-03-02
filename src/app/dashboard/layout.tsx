import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-slate-800">
          <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <Image src="/forge-logo.svg" alt="The Forge" width={36} height={36} />
            <div>
              <div className="font-black text-white text-sm leading-tight">The Forge</div>
              <div className="text-xs text-slate-500 leading-none">Perfect Prose Begins Here</div>
            </div>
          </Link>
        </div>

        <div className="px-5 py-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {(session.user.name ?? session.user.email)[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{session.user.name ?? "Writer"}</p>
              <p className="text-xs text-slate-500 truncate">{session.user.email}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          <div className="px-3 mb-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">Workspace</p>
            {[
              { href: "/dashboard", label: "Dashboard", icon: "◉" },
              { href: "/dashboard/projects", label: "Projects", icon: "◈" },
            ].map((item) => (
              <a key={item.href} href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all text-sm font-medium mb-0.5">
                <span className="text-blue-400">{item.icon}</span>{item.label}
              </a>
            ))}
          </div>

          <div className="px-3 mt-4 mb-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">Account</p>
            {[
              { href: "/dashboard/settings", label: "Settings", icon: "⚙" },
              { href: "/dashboard/billing", label: "Billing", icon: "✦" },
            ].map((item) => (
              <a key={item.href} href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all text-sm font-medium mb-0.5">
                <span className="text-blue-400">{item.icon}</span>{item.label}
              </a>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <form action="/api/auth/logout" method="POST">
            <button type="submit"
              className="w-full px-4 py-2 text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600 rounded-lg transition-all">
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-slate-950">
        <div className="p-8 max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
