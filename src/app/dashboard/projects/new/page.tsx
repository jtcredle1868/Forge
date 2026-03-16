"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/trpc/react";
import { ArrowLeft, ArrowRight, Flame } from "lucide-react";

const GENRES = [
  { value: "Romance", color: "#ec4899", emoji: "💕" },
  { value: "Thriller", color: "#ef4444", emoji: "🔪" },
  { value: "Mystery", color: "#8b5cf6", emoji: "🔍" },
  { value: "Fantasy", color: "#f59e0b", emoji: "⚔️" },
  { value: "Sci-Fi", color: "#3b82f6", emoji: "🚀" },
  { value: "Literary Fiction", color: "#10b981", emoji: "📖" },
  { value: "Memoir", color: "#f97316", emoji: "✍️" },
  { value: "Horror", color: "#6b7280", emoji: "👻" },
];

const TARGET_WORDS = [
  { label: "Short story", value: 10000 },
  { label: "Novella", value: 40000 },
  { label: "Novel", value: 80000 },
  { label: "Epic", value: 150000 },
];

export default function NewProjectPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [targetWordCount, setTargetWordCount] = useState<number | "">(80000);

  const createProject = api.projects.create.useMutation({
    onSuccess: (project) => {
      router.push(`/dashboard/projects/${project.id}`);
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    createProject.mutate({
      title: title.trim(),
      genre: genre || undefined,
      targetWordCount: typeof targetWordCount === "number" ? targetWordCount : undefined,
    });
  };

  return (
    <div className="min-h-full p-8" style={{ background: "#0c0c14" }}>
      <div className="max-w-2xl mx-auto">
        <Link
          href="/dashboard/projects"
          className="inline-flex items-center gap-2 text-xs mb-8"
          style={{ color: "#9898b8" }}
        >
          <ArrowLeft size={14} />
          Back to Projects
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "#f0f0f8" }}>
            New Project
          </h1>
          <p style={{ color: "#9898b8" }}>
            Set up your manuscript workspace. You can change these settings later.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-8">
          {/* Title */}
          <div
            className="rounded-2xl p-6"
            style={{ background: "#13131f", border: "1px solid #2a2a45" }}
          >
            <label className="block text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#5a5a7a" }}>
              Manuscript Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="The Broken Crown"
              required
              autoFocus
              className="w-full text-2xl font-bold bg-transparent focus:outline-none"
              style={{ color: "#f0f0f8", caretColor: "#f59e0b" }}
            />
            <div className="h-px mt-4" style={{ background: title ? "#f59e0b" : "#2a2a45" }} />
          </div>

          {/* Genre */}
          <div
            className="rounded-2xl p-6"
            style={{ background: "#13131f", border: "1px solid #2a2a45" }}
          >
            <label className="block text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#5a5a7a" }}>
              Genre
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {GENRES.map((g) => {
                const selected = genre === g.value;
                return (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setGenre(selected ? "" : g.value)}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-medium transition-all"
                    style={{
                      background: selected ? `${g.color}15` : "#1a1a2e",
                      border: `1px solid ${selected ? g.color + "60" : "#2a2a45"}`,
                      color: selected ? g.color : "#9898b8",
                    }}
                  >
                    <span className="text-lg">{g.emoji}</span>
                    {g.value}
                  </button>
                );
              })}
            </div>
            <div className="mt-3">
              <input
                value={GENRES.find((g) => g.value === genre) ? "" : genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="Or type a custom genre…"
                className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
                style={{
                  background: "#1a1a2e",
                  border: "1px solid #2a2a45",
                  color: "#f0f0f8",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#f59e0b")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#2a2a45")}
              />
            </div>
          </div>

          {/* Target word count */}
          <div
            className="rounded-2xl p-6"
            style={{ background: "#13131f", border: "1px solid #2a2a45" }}
          >
            <label className="block text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#5a5a7a" }}>
              Target Word Count
            </label>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {TARGET_WORDS.map((t) => {
                const selected = targetWordCount === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTargetWordCount(t.value)}
                    className="p-3 rounded-xl text-center transition-all"
                    style={{
                      background: selected ? "rgba(245,158,11,0.12)" : "#1a1a2e",
                      border: `1px solid ${selected ? "rgba(245,158,11,0.4)" : "#2a2a45"}`,
                    }}
                  >
                    <p className="text-sm font-bold" style={{ color: selected ? "#f59e0b" : "#f0f0f8" }}>
                      {(t.value / 1000).toFixed(0)}K
                    </p>
                    <p className="text-xs" style={{ color: "#5a5a7a" }}>{t.label}</p>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0}
                value={targetWordCount}
                onChange={(e) => setTargetWordCount(e.target.value ? Number(e.target.value) : "")}
                className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
                style={{
                  background: "#1a1a2e",
                  border: "1px solid #2a2a45",
                  color: "#f0f0f8",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#f59e0b")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#2a2a45")}
              />
              <span className="text-sm flex-shrink-0" style={{ color: "#5a5a7a" }}>words</span>
            </div>
          </div>

          {createProject.error && (
            <div
              className="px-4 py-3 rounded-xl text-sm"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5" }}
            >
              {createProject.error.message}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={createProject.isPending || !title.trim()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all"
              style={{
                background: createProject.isPending || !title.trim() ? "#b45309" : "#f59e0b",
                color: "#0c0c14",
                cursor: createProject.isPending || !title.trim() ? "not-allowed" : "pointer",
                opacity: !title.trim() ? 0.6 : 1,
              }}
            >
              {createProject.isPending ? (
                <>
                  <Flame size={16} className="animate-pulse" />
                  Creating…
                </>
              ) : (
                <>
                  Start Writing
                  <ArrowRight size={16} />
                </>
              )}
            </button>
            <Link
              href="/dashboard/projects"
              className="px-6 py-3 rounded-xl text-sm font-medium"
              style={{ background: "#1a1a2e", color: "#9898b8", border: "1px solid #2a2a45" }}
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
