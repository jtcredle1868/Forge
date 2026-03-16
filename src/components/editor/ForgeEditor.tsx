"use client";

import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import CharacterCount from "@tiptap/extension-character-count";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback, useEffect, useRef, useState } from "react";
import { EditorToolbar } from "./EditorToolbar";
import {
  Bold, Italic, Underline as UnderlineIcon, Quote, Highlighter,
  Maximize2, Minimize2
} from "lucide-react";

interface ForgeEditorProps {
  content: unknown;
  onUpdate: (content: unknown, wordCount: number) => void;
  onSave?: (content: unknown) => void;
  placeholder?: string;
  readOnly?: boolean;
  onTextSelect?: (selectedText: string, from: number, to: number) => void;
}

export function ForgeEditor({
  content,
  onUpdate,
  onSave,
  placeholder = "Begin your story here...",
  readOnly = false,
  onTextSelect,
}: ForgeEditorProps) {
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxWaitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaveTime = useRef<number>(Date.now());

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Highlight.configure({ multicolor: false }),
      CharacterCount,
      Placeholder.configure({ placeholder }),
    ],
    content: content as never,
    editable: !readOnly,
    editorProps: {
      attributes: { class: "forge-editor focus:outline-none" },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      const words = (editor.storage.characterCount as { words?: () => number })?.words?.() ?? 0;
      onUpdate(json, words);

      if (onSave) {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        const now = Date.now();
        const elapsed = now - lastSaveTime.current;

        if (elapsed >= 60000) {
          lastSaveTime.current = now;
          onSave(json);
          if (maxWaitTimeoutRef.current) clearTimeout(maxWaitTimeoutRef.current);
          maxWaitTimeoutRef.current = null;
        } else {
          saveTimeoutRef.current = setTimeout(() => {
            lastSaveTime.current = Date.now();
            onSave(json);
          }, 3000);

          if (!maxWaitTimeoutRef.current) {
            maxWaitTimeoutRef.current = setTimeout(() => {
              lastSaveTime.current = Date.now();
              onSave(editor.getJSON());
              maxWaitTimeoutRef.current = null;
            }, 60000 - elapsed);
          }
        }
      }
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      if (from !== to) {
        const text = editor.state.doc.textBetween(from, to, " ");
        setSelectedText(text);
        if (onTextSelect && text.trim().length >= 10) {
          onTextSelect(text, from, to);
        }
      } else {
        setSelectedText("");
      }
    },
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "f") {
        e.preventDefault();
        setIsFocusMode((prev) => !prev);
      }
      if (e.key === "Escape" && isFocusMode) {
        setIsFocusMode(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFocusMode]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (maxWaitTimeoutRef.current) clearTimeout(maxWaitTimeoutRef.current);
    };
  }, []);

  const handleFocusModeToggle = useCallback(() => {
    setIsFocusMode((prev) => !prev);
  }, []);

  if (!editor) return null;

  const wordCount = (editor.storage.characterCount as { words?: () => number })?.words?.() ?? 0;

  if (isFocusMode) {
    return (
      <div
        className="fixed inset-0 z-50 overflow-y-auto"
        style={{ background: "#080810" }}
      >
        <div className="max-w-[65ch] mx-auto px-8 py-16">
          <div className="flex justify-end mb-8">
            <button
              onClick={handleFocusModeToggle}
              className="flex items-center gap-2 text-sm text-[#5a5a7a] hover:text-[#f59e0b] transition-colors"
            >
              <Minimize2 size={14} />
              Exit Focus Mode
            </button>
          </div>
          <div className="focus-mode-editor">
            <EditorContent editor={editor} />
          </div>
          <div className="mt-12 text-center text-xs text-[#35354a]">
            {wordCount} words · Press Esc to exit
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <EditorToolbar editor={editor} onFocusMode={handleFocusModeToggle} />

      <BubbleMenu
        editor={editor}
        tippyOptions={{ duration: 150, placement: "top" }}
        shouldShow={({ from, to }) => from !== to}
      >
        <div className="flex items-center gap-1 rounded-lg p-1 shadow-2xl"
          style={{ background: "#1a1a2e", border: "1px solid #35354a" }}>
          <BubbleBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
            <Bold size={13} />
          </BubbleBtn>
          <BubbleBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
            <Italic size={13} />
          </BubbleBtn>
          <BubbleBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline">
            <UnderlineIcon size={13} />
          </BubbleBtn>
          <BubbleBtn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive("highlight")} title="Highlight">
            <Highlighter size={13} />
          </BubbleBtn>
          <div className="w-px h-4 mx-1" style={{ background: "#2a2a45" }} />
          <BubbleBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Quote">
            <Quote size={13} />
          </BubbleBtn>
        </div>
      </BubbleMenu>

      <div className="flex-1 overflow-y-auto p-8 lg:p-12">
        <div className="max-w-[65ch] mx-auto">
          <EditorContent editor={editor} />
        </div>
      </div>

      <div className="border-t px-8 py-2 flex items-center justify-between text-xs"
        style={{ borderColor: "#2a2a45", background: "#0c0c14", color: "#5a5a7a" }}>
        <span>{wordCount} words</span>
        {selectedText && (
          <span style={{ color: "#9898b8" }}>
            {selectedText.trim().split(/\s+/).length} selected
          </span>
        )}
        <button
          onClick={handleFocusModeToggle}
          className="flex items-center gap-1 transition-colors hover:text-amber-400"
          title="Focus Mode (⌘⇧F)"
        >
          <Maximize2 size={11} />
          Focus
        </button>
      </div>
    </div>
  );
}

function BubbleBtn({
  onClick, active, title, children,
}: {
  onClick: () => void; active: boolean; title: string; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="p-1.5 rounded transition-colors"
      style={{
        background: active ? "#f59e0b" : "transparent",
        color: active ? "#0c0c14" : "#9898b8",
      }}
      onMouseEnter={(e) => {
        if (!active) (e.currentTarget as HTMLButtonElement).style.color = "#f0f0f8";
      }}
      onMouseLeave={(e) => {
        if (!active) (e.currentTarget as HTMLButtonElement).style.color = "#9898b8";
      }}
    >
      {children}
    </button>
  );
}
