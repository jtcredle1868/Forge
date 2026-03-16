"use client";

import { api } from "@/trpc/react";
import { ArrowLeft, Zap, Loader2, MessageSquare } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface CoachPageProps {
  params: { id: string };
}

const TYPE_LABELS: Record<string, string> = {
  PASSAGE_ANALYSIS: "Passage Analysis",
  CRAFT_QA: "Craft Q&A",
  TEMPERATURE_CHECK: "Temperature Check",
  STYLE_CHECK: "Style Check",
  VOICE_CHECK: "Voice Check",
};

const INTENSITY_COLORS: Record<string, string> = {
  LIGHT_TOUCH: "#10b981",
  STANDARD: "#f59e0b",
  DEEP_DIVE: "#ef4444",
};

export default function CoachPage({ params }: CoachPageProps) {
  const projectId = params.id;
  const { data: project } = api.projects.get.useQuery({ id: projectId });
  const { data: interactions } = api.coaching.getInteractions.useQuery({ projectId });

  if (!project || !interactions) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: "#0c0c14" }}>
        <Loader2 size={24} className="animate-spin" style={{ color: "#35354a" }} />
      </div>
    );
  }

  return (
    <div className="p-8" style={{ background: "#0c0c14", minHeight: "100%" }}>
      <div className="mb-8">
        <Link href={`/dashboard/projects/${projectId}`} className="inline-flex items-center gap-2 text-sm mb-4" style={{ color: "#9898b8" }}>
          <ArrowLeft size={14} /> Back to Project
        </Link>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#f97316" + "18" }}>
            <Zap size={18} style={{ color: "#f97316" }} />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "#f0f0f8" }}>Coaching History</h1>
        </div>
        <p className="text-sm ml-12" style={{ color: "#9898b8" }}>{project.title} — {interactions.length} session{interactions.length !== 1 ? "s" : ""}</p>
      </div>

      {interactions.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ background: "#13131f", border: "1px solid #2a2a45" }}>
          <MessageSquare size={32} className="mx-auto mb-3" style={{ color: "#35354a" }} />
          <p className="text-sm font-medium mb-1" style={{ color: "#9898b8" }}>No coaching sessions yet</p>
          <p className="text-xs" style={{ color: "#5a5a7a" }}>Select text in the editor and request AI coaching to get started.</p>
          <Link href={`/dashboard/projects/${projectId}`} className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: "#f97316", color: "#0c0c14" }}>
            Open Project
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {interactions.map((item) => (
            <div key={item.id} className="rounded-2xl p-5" style={{ background: "#13131f", border: "1px solid #2a2a45" }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: "#f97316" + "15", color: "#f97316" }}>
                    {TYPE_LABELS[item.requestType] ?? item.requestType}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: (INTENSITY_COLORS[item.feedbackIntensity] ?? "#9898b8") + "18", color: INTENSITY_COLORS[item.feedbackIntensity] ?? "#9898b8" }}>
                    {item.feedbackIntensity.replace(/_/g, " ")}
                  </span>
                </div>
                <span className="text-xs" style={{ color: "#5a5a7a" }}>
                  {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                </span>
              </div>
              <p className="text-xs mb-3 line-clamp-2" style={{ color: "#9898b8", fontStyle: "italic" }}>
                &ldquo;{item.requestText}&rdquo;
              </p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "#d0d0e8" }}>
                {item.responseText}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
