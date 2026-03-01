"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/trpc/react";
import { Button } from "@/components/ui/button";

export default function NewProjectPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [targetWordCount, setTargetWordCount] = useState<number | "">("");

  const createProject = trpc.projects.create.useMutation({
    onSuccess: (project) => {
      router.push(`/dashboard/projects/${project.id}`);
    },
  });

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) return;

    createProject.mutate({
      title: title.trim(),
      genre: genre.trim() || undefined,
      targetWordCount:
        typeof targetWordCount === "number" ? targetWordCount : undefined,
    });
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Project</h1>
      <p className="text-gray-600 mb-8">Start a new manuscript workspace.</p>

      <form
        onSubmit={onSubmit}
        className="bg-white rounded-lg border border-gray-200 p-6 space-y-5"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="The Broken Crown"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Genre</label>
          <input
            value={genre}
            onChange={(event) => setGenre(event.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="Epic Fantasy"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Target Word Count</label>
          <input
            type="number"
            min={0}
            value={targetWordCount}
            onChange={(event) =>
              setTargetWordCount(
                event.target.value ? Number(event.target.value) : "",
              )
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="90000"
          />
        </div>

        {createProject.error && (
          <div className="p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">
            {createProject.error.message}
          </div>
        )}

        <div className="flex gap-3">
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={createProject.isPending}
          >
            {createProject.isPending ? "Creating..." : "Create Project"}
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/projects">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}