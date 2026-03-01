import { getSession } from "@/lib/session";
import { db } from "@/server/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const projectCount = await db.project.count({
    where: { userId: session.userId },
  });

  const recentProjects = await db.project.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 3,
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
    },
  });

  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-900 mb-2">
        Welcome back, {session.user.name ?? "Writer"}!
      </h1>
      <p className="text-gray-600 mb-8">Ready to perfect your prose?</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Projects</h3>
          <p className="text-4xl font-bold text-gray-900">{projectCount}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Plan</h3>
          <p className="text-2xl font-bold text-blue-600">Free</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">AI Coaching Calls</h3>
          <p className="text-2xl font-bold text-gray-900">Unlimited</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Projects</h2>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/dashboard/projects">View All</Link>
          </Button>
        </div>

        {recentProjects.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No projects yet</p>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/dashboard/projects">Create Your First Project</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {recentProjects.map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 rounded border border-gray-100"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">{project.title}</h3>
                  <p className="text-sm text-gray-600">
                    {project.createdAt.toLocaleDateString()}
                  </p>
                </div>
                <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded">
                  {project.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}