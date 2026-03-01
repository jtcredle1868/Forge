"use client";

import { useMemo, useState } from "react";
import { trpc } from "@/trpc/react";
import { Button } from "@/components/ui/button";

interface SceneAIPanelProps {
  projectId: string;
  documentId: string;
  chapterId: string;
  defaultPassage: string;
}

export function SceneAIPanel({
  projectId,
  documentId,
  chapterId,
  defaultPassage,
}: SceneAIPanelProps) {
  const utils = trpc.useUtils();
  const [passage, setPassage] = useState(defaultPassage.slice(0, 2000));
  const [question, setQuestion] = useState("");
  const [styleResult, setStyleResult] = useState<{
    overallScore: number;
    findings: string[];
  } | null>(null);
  const [styleLoading, setStyleLoading] = useState(false);

  const analyzeMutation = trpc.coaching.analyzePassage.useMutation();
  const craftQAMutation = trpc.coaching.craftQA.useMutation();
  const temperatureQuery = trpc.coaching.temperatureCheck.useQuery({ chapterId });

  const canAnalyze = useMemo(() => {
    const words = passage.trim().split(/\s+/).filter(Boolean).length;
    return words >= 50 && words <= 2000;
  }, [passage]);

  return (
    <div className="space-y-6">
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <h3 className="font-semibold text-gray-900 mb-2">Passage Coaching</h3>
        <textarea
          value={passage}
          onChange={(event) => setPassage(event.target.value)}
          rows={8}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          placeholder="Paste at least 50 words for analysis"
        />
        <div className="flex gap-2 mt-3">
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            disabled={!canAnalyze || analyzeMutation.isPending}
            onClick={() =>
              analyzeMutation.mutate({
                documentId,
                selectedText: passage,
                intensity: "STANDARD",
                focusAreas: ["SENTENCE_RHYTHM", "PACING", "WORD_ECONOMY"],
              })
            }
          >
            {analyzeMutation.isPending ? "Analyzing..." : "Analyze Passage"}
          </Button>
          <Button
            variant="outline"
            disabled={!passage.trim() || styleLoading}
            onClick={async () => {
              setStyleLoading(true);
              const result = await utils.style.checkConsistency.fetch({
                documentId,
                passage,
              });
              setStyleResult(result);
              setStyleLoading(false);
            }}
          >
            {styleLoading ? "Checking..." : "Style Check"}
          </Button>
        </div>
        {analyzeMutation.data?.response && (
          <div className="mt-3 p-3 border border-blue-100 bg-blue-50 rounded text-sm whitespace-pre-wrap">
            {analyzeMutation.data.response}
          </div>
        )}
        {styleResult && (
          <div className="mt-3 p-3 border border-gray-200 bg-gray-50 rounded text-sm">
            <p className="font-medium">Style Score: {styleResult.overallScore}</p>
            <p className="text-gray-600 mt-1">Findings: {styleResult.findings.length}</p>
          </div>
        )}
      </div>

      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <h3 className="font-semibold text-gray-900 mb-2">Craft Q&A</h3>
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          placeholder="Ask a craft question about this scene"
        />
        <Button
          className="mt-3 bg-blue-600 hover:bg-blue-700"
          disabled={question.trim().length < 10 || craftQAMutation.isPending}
          onClick={() =>
            craftQAMutation.mutate({
              projectId,
              question,
              context: passage.slice(0, 2000),
            })
          }
        >
          {craftQAMutation.isPending ? "Thinking..." : "Ask Coach"}
        </Button>
        {craftQAMutation.data?.response && (
          <div className="mt-3 p-3 border border-blue-100 bg-blue-50 rounded text-sm whitespace-pre-wrap">
            {craftQAMutation.data.response}
          </div>
        )}
      </div>

      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <h3 className="font-semibold text-gray-900 mb-2">Temperature Check</h3>
        {temperatureQuery.isLoading ? (
          <p className="text-sm text-gray-500">Calculating...</p>
        ) : temperatureQuery.data ? (
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="border border-gray-100 rounded p-2">
              <p className="text-gray-500">Words</p>
              <p className="font-semibold">{temperatureQuery.data.metrics.totalWords}</p>
            </div>
            <div className="border border-gray-100 rounded p-2">
              <p className="text-gray-500">Sentences</p>
              <p className="font-semibold">{temperatureQuery.data.metrics.sentenceCount}</p>
            </div>
            <div className="border border-gray-100 rounded p-2">
              <p className="text-gray-500">Paragraphs</p>
              <p className="font-semibold">{temperatureQuery.data.metrics.paragraphCount}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No data yet.</p>
        )}
      </div>
    </div>
  );
}