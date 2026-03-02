"use client";

import { useState } from "react";

interface ProjectWorkspaceClientProps {
  projectId: string;
  tier: string;
}

export function ProjectWorkspaceClient({ projectId, tier }: ProjectWorkspaceClientProps) {
  const [exporting, setExporting] = useState(false);
  const [sendingToRefinery, setSendingToRefinery] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleExport = async (format: string) => {
    if (format !== "txt" && tier === "FREE") {
      setMessage({ type: "error", text: "Upgrade to Pro to export as .docx or .pdf" });
      setTimeout(() => setMessage(null), 4000);
      return;
    }
    setExporting(true);
    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, format }),
      });
      if (!response.ok) {
        const data = await response.json();
        setMessage({ type: "error", text: data.error ?? "Export failed" });
        setTimeout(() => setMessage(null), 4000);
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `manuscript.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage({ type: "success", text: `Exported as .${format}` });
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage({ type: "error", text: "Export failed. Please try again." });
      setTimeout(() => setMessage(null), 4000);
    } finally {
      setExporting(false);
    }
  };

  const handleSendToRefinery = async () => {
    if (tier === "FREE") {
      setMessage({ type: "error", text: "Refinery integration requires Pro or Studio" });
      setTimeout(() => setMessage(null), 4000);
      return;
    }
    setSendingToRefinery(true);
    try {
      const response = await fetch("/api/refinery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage({ type: "error", text: data.error ?? "Submission failed" });
      } else {
        setMessage({ type: "success", text: data.message ?? "Sent to Refinery!" });
      }
      setTimeout(() => setMessage(null), 5000);
    } catch {
      setMessage({ type: "error", text: "Failed to connect to Refinery" });
      setTimeout(() => setMessage(null), 4000);
    } finally {
      setSendingToRefinery(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-2">
        {/* Export menu */}
        <div className="relative group">
          <button
            disabled={exporting}
            className="px-4 py-2 border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50"
          >
            {exporting ? "Exporting..." : "Export ▾"}
          </button>
          <div className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 min-w-[140px] z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
            <button onClick={() => handleExport("txt")} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 transition-colors">
              Export as .txt {tier === "FREE" && "✓"}
            </button>
            <button onClick={() => handleExport("docx")} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 transition-colors">
              Export as .docx {tier === "FREE" && <span className="text-xs text-amber-400 ml-1">Pro</span>}
            </button>
            <button onClick={() => handleExport("pdf")} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 transition-colors">
              Export as .pdf {tier === "FREE" && <span className="text-xs text-amber-400 ml-1">Pro</span>}
            </button>
          </div>
        </div>

        {/* Send to Refinery */}
        <button
          onClick={handleSendToRefinery}
          disabled={sendingToRefinery || tier === "FREE"}
          className="px-4 py-2 border border-slate-600 hover:border-blue-500 text-slate-300 hover:text-white disabled:opacity-40 text-sm font-medium rounded-lg transition-all"
          title={tier === "FREE" ? "Requires Pro or Studio" : "Send to The Refinery for evaluation"}
        >
          {sendingToRefinery ? "Sending..." : "Send to Refinery"}
          {tier === "FREE" && <span className="text-xs text-amber-400 ml-1">Pro</span>}
        </button>
      </div>

      {/* Toast message */}
      {message && (
        <div className={`text-xs px-3 py-1.5 rounded-lg ${
          message.type === "success"
            ? "bg-green-900/50 border border-green-800 text-green-300"
            : "bg-red-900/50 border border-red-800 text-red-300"
        }`}>
          {message.text}
        </div>
      )}
    </div>
  );
}
