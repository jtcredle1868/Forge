// src/components/editor/ForgeEditor.tsx
"use client";

import React from "react";

interface ForgeEditorProps {
  content?: string;
  onSave?: (content: string) => void;
  sceneId: string;
}

export function ForgeEditor({ content, onSave, sceneId }: ForgeEditorProps) {
  return (
    <div className="w-full h-full bg-white rounded-lg border border-gray-200 p-6">
      <div className="text-center text-gray-500">
        <p>Editor component for scene: {sceneId}</p>
        <p className="text-sm mt-2">TipTap editor will be integrated here</p>
      </div>
    </div>
  );
}
