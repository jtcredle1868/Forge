// src/components/coaching/CoachingPanel.tsx
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";

interface CoachingPanelProps {
  projectId: string;
  documentId: string;
  selectedText?: string;
}

export function CoachingPanel({
  projectId,
  documentId,
  selectedText,
}: CoachingPanelProps) {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!selectedText) return;

    setLoading(true);
    try {
      // Call coaching router
      console.log("Analyzing passage...", {
        documentId,
        selectedText,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold mb-4">Writing Coach</h2>

      {selectedText && (
        <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
          <p className="text-sm text-blue-900 line-clamp-3">{selectedText}</p>
          <p className="text-xs text-blue-700 mt-2">
            {selectedText.split(/\s+/).length} words selected
          </p>
        </div>
      )}

      <Button
        onClick={handleAnalyze}
        disabled={!selectedText || loading}
        className="w-full mb-4"
      >
        {loading ? "Analyzing..." : "Get Coaching Feedback"}
      </Button>

      {response && (
        <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{response}</p>
        </div>
      )}
    </div>
  );
}
