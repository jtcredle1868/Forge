import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

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
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white border-r border-gray-200 shadow-sm flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900">The Forge</h1>
          <p className="text-sm text-gray-600 mt-1">{session.user.email}</p>
        </div>
        <nav className="mt-6 flex-1">
          <a
            href="/dashboard"
            className="block px-6 py-3 text-gray-700 hover:bg-gray-50 border-l-4 border-transparent hover:border-blue-500"
          >
            Dashboard
          </a>
          <a
            href="/dashboard/projects"
            className="block px-6 py-3 text-gray-700 hover:bg-gray-50 border-l-4 border-transparent hover:border-blue-500"
          >
            Projects
          </a>
        </nav>
        <div className="p-6 border-t border-gray-200">
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg"
            >
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}