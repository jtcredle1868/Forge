"use client";

import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Legend, Area, AreaChart
} from "recharts";
import { BarChart3, Eye, EyeOff } from "lucide-react";
import { EMOTION_COLORS } from "@/server/services/emotionalScoringService";

interface ArcDataPoint {
  sceneIndex: number;
  sceneId: string;
  title: string;
  chapterTitle: string;
  tension: number;
  romance: number;
  action: number;
  hope: number;
  fear: number;
  sadness: number;
  joy: number;
  intensity: number;
  dominant: string;
}

type EmotionKey = "tension" | "romance" | "action" | "hope" | "fear" | "sadness" | "joy" | "intensity";

const EMOTION_LINES: Array<{ key: EmotionKey; label: string; color: string }> = [
  { key: "intensity", label: "Overall", color: "#f0f0f8" },
  { key: "tension", label: "Tension", color: EMOTION_COLORS.tension },
  { key: "romance", label: "Romance", color: EMOTION_COLORS.romance },
  { key: "action", label: "Action", color: EMOTION_COLORS.action },
  { key: "hope", label: "Hope", color: EMOTION_COLORS.hope },
  { key: "fear", label: "Fear", color: EMOTION_COLORS.fear },
  { key: "sadness", label: "Sadness", color: EMOTION_COLORS.sadness },
  { key: "joy", label: "Joy", color: EMOTION_COLORS.joy },
];

interface EmotionalArcChartProps {
  data: ArcDataPoint[];
  genre?: string;
}

export function EmotionalArcChart({ data, genre }: EmotionalArcChartProps) {
  const [activeLines, setActiveLines] = useState<Set<EmotionKey>>(
    new Set(["intensity", "tension", "romance"])
  );
  const [hoveredPoint, setHoveredPoint] = useState<ArcDataPoint | null>(null);

  const toggleLine = (key: EmotionKey) => {
    setActiveLines((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size > 1) next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const CustomTooltip = ({
    active, payload, label,
  }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: number;
  }) => {
    if (!active || !payload?.length) return null;
    const point = data.find((d) => d.sceneIndex === label);
    if (!point) return null;

    return (
      <div
        className="rounded-xl p-3 text-xs shadow-xl"
        style={{
          background: "#1a1a2e",
          border: "1px solid #35354a",
          minWidth: "160px",
        }}
      >
        <p className="font-semibold mb-1" style={{ color: "#f0f0f8" }}>
          {point.title}
        </p>
        <p className="mb-2" style={{ color: "#5a5a7a" }}>{point.chapterTitle}</p>
        {payload.map((entry) => (
          <div key={entry.name} className="flex justify-between items-center gap-4 mb-0.5">
            <span className="flex items-center gap-1" style={{ color: entry.color }}>
              <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
              {entry.name}
            </span>
            <span style={{ color: "#f0f0f8" }}>{entry.value.toFixed(1)}</span>
          </div>
        ))}
      </div>
    );
  };

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <BarChart3 size={32} className="mb-3" style={{ color: "#35354a" }} />
        <p className="text-sm font-medium mb-1" style={{ color: "#9898b8" }}>
          No emotional data yet
        </p>
        <p className="text-xs" style={{ color: "#5a5a7a" }}>
          Analyze scenes to build your emotional arc
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 size={16} style={{ color: "#f59e0b" }} />
          <span className="text-sm font-semibold" style={{ color: "#f0f0f8" }}>
            Emotional Arc
          </span>
          {genre && (
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)" }}
            >
              {genre}
            </span>
          )}
        </div>
        <span className="text-xs" style={{ color: "#5a5a7a" }}>
          {data.length} scenes
        </span>
      </div>

      {/* Emotion toggles */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {EMOTION_LINES.map(({ key, label, color }) => {
          const isActive = activeLines.has(key);
          return (
            <button
              key={key}
              onClick={() => toggleLine(key)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition-all"
              style={{
                background: isActive ? `${color}15` : "transparent",
                color: isActive ? color : "#5a5a7a",
                border: `1px solid ${isActive ? `${color}40` : "#2a2a45"}`,
              }}
            >
              {isActive ? <Eye size={10} /> : <EyeOff size={10} />}
              {label}
            </button>
          );
        })}
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
          >
            <defs>
              {EMOTION_LINES.map(({ key, color }) => (
                <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>

            <XAxis
              dataKey="sceneIndex"
              tick={{ fill: "#5a5a7a", fontSize: 10 }}
              axisLine={{ stroke: "#2a2a45" }}
              tickLine={false}
              label={{ value: "Scene", position: "insideBottom", fill: "#5a5a7a", fontSize: 10 }}
            />
            <YAxis
              domain={[0, 10]}
              tick={{ fill: "#5a5a7a", fontSize: 10 }}
              axisLine={{ stroke: "#2a2a45" }}
              tickLine={false}
            />

            <Tooltip content={<CustomTooltip />} />

            <ReferenceLine y={5} stroke="#2a2a45" strokeDasharray="3 3" />

            {EMOTION_LINES.filter(({ key }) => activeLines.has(key)).map(({ key, label, color }) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                name={label}
                stroke={color}
                strokeWidth={key === "intensity" ? 2 : 1.5}
                fill={`url(#grad-${key})`}
                dot={false}
                activeDot={{ r: 4, fill: color, stroke: "#0c0c14", strokeWidth: 2 }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Summary stats */}
      {data.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mt-4">
          {[
            { label: "Avg Intensity", value: (data.reduce((a, d) => a + d.intensity, 0) / data.length).toFixed(1) },
            { label: "Peak Scene", value: data.reduce((max, d) => d.intensity > max.intensity ? d : max, data[0]!)?.title?.slice(0, 12) + "..." },
            { label: "Romance", value: (data.reduce((a, d) => a + d.romance, 0) / data.length).toFixed(1) },
            { label: "Tension", value: (data.reduce((a, d) => a + d.tension, 0) / data.length).toFixed(1) },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-lg p-2 text-center"
              style={{ background: "#1a1a2e", border: "1px solid #2a2a45" }}
            >
              <p className="text-xs font-medium" style={{ color: "#f0f0f8" }}>{String(value)}</p>
              <p className="text-xs" style={{ color: "#5a5a7a" }}>{label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
