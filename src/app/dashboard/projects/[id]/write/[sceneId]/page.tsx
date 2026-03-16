"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { ForgeEditor } from "@/components/editor/ForgeEditor";
import { ChapterPanel } from "@/components/editor/ChapterPanel";
import { CoachingPanel } from "@/components/coaching/CoachingPanel";
import { VoiceChecker } from "@/components/characters/VoiceChecker";
import { Save, CheckCircle2, Loader2, MessageCircle, Zap, ArrowLeft, Flame } from "lucide-react";
import Link from "next/link";

interface WritePageProps {
  params: { id: string; sceneId: string };
}

export default function WritePage({ params }: WritePageProps) {
  const { id: projectId, sceneId } = params;
  const [selectedText, setSelectedText] = useState("");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [rightPanel, setRightPanel] = useState<"coaching" | "voice">("coaching");

  const { data: project } = api.projects.get.useQuery({ id: projectId });
  const { data: sceneDoc, refetch: refetchDoc } = api.documents.get.useQuery({ sceneId });
  const saveMutation = api.documents.save.useMutation({
    onMutate: () => setSaveStatus("saving"),
    onSuccess: () => setSaveStatus("saved"),
    onError: () => setSaveStatus("unsaved"),
  });

  const handleSave = (content: unknown) => {
    saveMutation.mutate({ sceneId, content });
  };

  const handleUpdate = (_content: unknown, _wordCount: number) => {
    setSaveStatus("unsaved");
  };

  const handleTextSelect = (text: string) => {
    setSelectedText(text);
  };

  const chapters = project?.chapters ?? [];
  const currentChapter = chapters.find((ch) => ch.scenes.some((sc) => sc.id === sceneId));
  const characters = project?.characters ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorContent: unknown = (sceneDoc as any)?.content ?? { type: "doc", content: [{ type: "paragraph" }] };

  return (
    <div className="flex h-screen" style={{ background: "#0c0c14" }}>
      {/* Chapter Panel */}
      <div className="w-56 flex-shrink-0">
        <ChapterPanel
          projectId={projectId}
          chapters={chapters as Parameters<typeof ChapterPanel>[0]["chapters"]}
          activeSceneId={sceneId}
        />
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col min-w-0" style={{ borderLeft: "1px solid #2a2a45", borderRight: "1px solid #2a2a45" }}>
        {/* Top bar */}
        <div
          className="flex items-center gap-3 px-6 py-3 border-b flex-shrink-0"
          style={{ background: "#13131f", borderColor: "#2a2a45" }}
        >
          <Link
            href={`/dashboard/projects/${projectId}`}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: "#5a5a7a" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#f59e0b")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#5a5a7a")}
          >
            <ArrowLeft size={16} />
          </Link>

          <div className="flex items-center gap-2">
            <Flame size={14} style={{ color: "#f59e0b" }} />
            <span className="text-sm font-semibold" style={{ color: "#f0f0f8" }}>
              {project?.title ?? "Loading..."}
            </span>
          </div>

          <span style={{ color: "#2a2a45" }}>/</span>
          <span className="text-sm" style={{ color: "#9898b8" }}>
            {currentChapter?.title}
          </span>

          <div className="ml-auto flex items-center gap-3">
            {/* Save status */}
            <div className="flex items-center gap-1.5 text-xs">
              {saveStatus === "saved" && (
                <>
                  <CheckCircle2 size={13} style={{ color: "#10b981" }} />
                  <span style={{ color: "#5a5a7a" }}>Saved</span>
                </>
              )}
              {saveStatus === "saving" && (
                <>
                  <Loader2 size={13} className="animate-spin" style={{ color: "#f59e0b" }} />
                  <span style={{ color: "#f59e0b" }}>Saving...</span>
                </>
              )}
              {saveStatus === "unsaved" && (
                <>
                  <span style={{ color: "#5a5a7a" }}>Unsaved</span>
                </>
              )}
            </div>

            <button
              onClick={() => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const c = (sceneDoc as any)?.content; if (c) handleSave(c as unknown);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)" }}
            >
              <Save size={12} />
              Save
            </button>
          </div>
        </div>

        {/* Editor area */}
        <div className="flex-1 overflow-hidden" style={{ background: "#0c0c14" }}>
          {sceneDoc !== undefined ? (
            <ForgeEditor
              content={editorContent}
              onUpdate={handleUpdate}
              onSave={handleSave}
              onTextSelect={handleTextSelect}
              placeholder="Begin writing this scene..."
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Loader2 size={24} className="animate-spin" style={{ color: "#35354a" }} />
            </div>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-80 flex-shrink-0 flex flex-col" style={{ background: "#13131f" }}>
        {/* Panel switcher */}
        <div className="p-3 border-b flex gap-1" style={{ borderColor: "#2a2a45" }}>
          <button
            onClick={() => setRightPanel("coaching")}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all"
            style={{
              background: rightPanel === "coaching" ? "#1a1a2e" : "transparent",
              color: rightPanel === "coaching" ? "#f59e0b" : "#5a5a7a",
              border: rightPanel === "coaching" ? "1px solid #2a2a45" : "1px solid transparent",
            }}
          >
            <Zap size={12} />
            Coach
          </button>
          <button
            onClick={() => setRightPanel("voice")}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all"
            style={{
              background: rightPanel === "voice" ? "#1a1a2e" : "transparent",
              color: rightPanel === "voice" ? "#f59e0b" : "#5a5a7a",
              border: rightPanel === "voice" ? "1px solid #2a2a45" : "1px solid transparent",
            }}
          >
            <MessageCircle size={12} />
            Voice
            <span className="wow-badge ml-1">WOW</span>
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          {rightPanel === "coaching" && (
            <CoachingPanel
              projectId={projectId}
              documentId={(sceneDoc as { id?: string } | undefined)?.id}
              selectedText={selectedText}
              chapterId={currentChapter?.id}
            />
          )}
          {rightPanel === "voice" && (
            <div className="h-full overflow-y-auto p-4">
              <VoiceChecker
                characters={characters as Parameters<typeof VoiceChecker>[0]["characters"]}
                preSelectedText={selectedText}
                sceneId={sceneId}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
