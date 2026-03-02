"use client";

import { CoachingPanel } from "@/components/coaching/CoachingPanel";

interface SceneAIPanelProps {
  projectId: string;
  documentId: string;
  chapterId: string;
  defaultPassage: string;
}

export function SceneAIPanel({ projectId, documentId, chapterId, defaultPassage }: SceneAIPanelProps) {
  return (
    <CoachingPanel
      projectId={projectId}
      documentId={documentId}
      chapterId={chapterId}
      defaultPassage={defaultPassage}
    />
  );
}
