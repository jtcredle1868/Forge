"use client";

import { useState, useCallback } from "react";
import type { JSONContent } from "@tiptap/core";
import { ForgeEditor } from "@/components/editor/ForgeEditor";
import { CoachingPanel } from "@/components/coaching/CoachingPanel";
import { trpc } from "@/trpc/react";

interface SceneEditorClientProps {
  sceneId: string;
  documentId: string;
  projectId: string;
  chapterId: string;
  initialContent: JSONContent;
  initialWordCount: number;
}

function extractText(content: JSONContent): string {
  if (!content) return "";
  if (content.type === "text") return content.text ?? "";
  if (content.content && Array.isArray(content.content)) {
    return content.content.map(extractText).join(" ");
  }
  return "";
}

export function SceneEditorClient({
  sceneId,
  documentId,
  projectId,
  chapterId,
  initialContent,
  initialWordCount,
}: SceneEditorClientProps) {
  const [wordCount, setWordCount] = useState(initialWordCount);
  const [currentText, setCurrentText] = useState(() => extractText(initialContent));

  const saveMutation = trpc.documents.save.useMutation();

  const handleSave = useCallback(async (content: JSONContent, wc: number) => {
    await saveMutation.mutateAsync({ sceneId, content });
    setWordCount(wc);
    setCurrentText(extractText(content));
  }, [sceneId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4 h-full min-h-0">
      <div className="flex flex-col min-h-0 h-full">
        <ForgeEditor
          sceneId={sceneId}
          documentId={documentId}
          initialContent={initialContent}
          onSave={handleSave}
          onWordCountChange={(wc) => setWordCount(wc)}
        />
      </div>
      <div className="hidden xl:flex flex-col min-h-0 h-full">
        <CoachingPanel
          projectId={projectId}
          documentId={documentId}
          chapterId={chapterId}
          defaultPassage={currentText.slice(0, 2000)}
        />
      </div>
    </div>
  );
}
