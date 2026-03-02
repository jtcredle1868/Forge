"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/trpc/react";

const GENRES = [
  "Literary Fiction", "Genre Fiction", "Thriller / Mystery", "Science Fiction",
  "Fantasy", "Romance", "Horror", "Memoir", "Creative Non-Fiction", "Other"
];

export default function NewProjectPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [customGenre, setCustomGenre] = useState("");
  const [targetWordCount, setTargetWordCount] = useState<number | "">("");

  const createProject = trpc.projects.create.useMutation();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const project = await createProject.mutateAsync({
      title: title.trim(),
      genre: (genre === "Other" ? customGenre : genre) || undefined,
      targetWordCount: typeof targetWordCount === "number" ? targetWordCount : undefined,
    });
    router.push(`/dashboard/projects/${project.id}`);
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
          <Link href="/dashboard/projects" className="hover:text-slate-300 transition-colors">Projects</Link>
          <span>/</span>
          <span className="text-white">New Project</span>
        </div>
        <h1 className="text-3xl font-black text-white">Create a New Project</h1>
        <p className="text-slate-400 mt-1">Set up your manuscript workspace.</p>
      </div>

      <form onSubmit={onSubmit} className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Project Title <span className="text-red-400">*</span></label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-700/60 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="The Broken Crown"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Genre</label>
          <div className="grid grid-cols-2 gap-2 mb-2">
            {GENRES.map((g) => (
              <button key={g} type="button" onClick={() => setGenre(g)}
                className={`p-2.5 rounded-lg border text-sm text-left transition-all ${genre === g ? "bg-blue-600 border-blue-500 text-white" : "border-slate-600 text-slate-400 hover:border-slate-500 hover:text-white"}`}>
                {g}
              </button>
            ))}
          </div>
          {genre === "Other" && (
            <input value={customGenre} onChange={(e) => setCustomGenre(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-700/60 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              placeholder="Specify genre..." />
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Target Word Count</label>
          <input type="number" min={0} value={targetWordCount}
            onChange={(e) => setTargetWordCount(e.target.value ? Number(e.target.value) : "")}
            className="w-full px-4 py-2.5 bg-slate-700/60 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            placeholder="e.g. 90000" />
          <p className="text-xs text-slate-500 mt-1">Common: Short story 5,000 · Novella 40,000 · Novel 80-100K</p>
        </div>

        {createProject.error && (
          <div className="p-3 bg-red-950/50 border border-red-800 rounded-lg text-red-300 text-sm">
            {createProject.error.message}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={createProject.isPending || !title.trim()}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold rounded-lg transition-all">
            {createProject.isPending ? "Creating..." : "Create Project →"}
          </button>
          <Link href="/dashboard/projects"
            className="px-6 py-2.5 border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white font-medium rounded-lg transition-all text-center">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
