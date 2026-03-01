"use client";

import React from "react";
import { trpc } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ProjectsPage() {
  const { data: projects, isLoading } = trpc.projects.list.useQuery();

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <Link href="/dashboard/projects/new">New Project</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading projects...</p>
        </div>
      ) : !projects || projects.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No projects yet</h2>
          <p className="text-gray-600 mb-6">
            Create your first project to get started with The Forge.
          </p>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/dashboard/projects/new">Create Project</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              className="block p-6 bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.title}</h3>
              {project.genre && <p className="text-sm text-gray-600 mb-2">{project.genre}</p>}
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {project.status}
                </span>
                <span className="text-xs text-gray-500">{project.chapters.length} chapters</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}