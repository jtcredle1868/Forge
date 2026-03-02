"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import CharacterCount from "@tiptap/extension-character-count";
import Placeholder from "@tiptap/extension-placeholder";
import type { JSONContent } from "@tiptap/core";

interface ForgeEditorProps {
  sceneId: string;
  documentId: string;
  initialContent?: JSONContent | null;
  onSave?: (content: JSONContent, wordCount: number) => Promise<void>;
  onWordCountChange?: (count: number) => void;
}

function EditorToolbar({ editor, focusMode, setFocusMode }: {
  editor: ReturnType<typeof useEditor>;
  focusMode: boolean;
  setFocusMode: (v: boolean) => void;
}) {
  if (!editor) return null;

  const btnClass = (active: boolean) =>
    `px-2.5 py-1.5 rounded text-sm font-medium transition-all ${
      active ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-700"
    }`;

  return (
    <div className="flex items-center gap-1 px-3 py-2 border-b border-slate-700 flex-wrap">
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive("bold"))} title="Bold"><strong>B</strong></button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive("italic"))} title="Italic"><em>I</em></button>
      <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={btnClass(editor.isActive("underline"))} title="Underline"><u>U</u></button>
      <button onClick={() => editor.chain().focus().toggleHighlight().run()} className={btnClass(editor.isActive("highlight"))} title="Highlight">H</button>
      <div className="w-px h-5 bg-slate-700 mx-1" />
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btnClass(editor.isActive("heading", { level: 1 }))} title="Heading 1">H1</button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnClass(editor.isActive("heading", { level: 2 }))} title="Heading 2">H2</button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btnClass(editor.isActive("heading", { level: 3 }))} title="Heading 3">H3</button>
      <div className="w-px h-5 bg-slate-700 mx-1" />
      <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btnClass(editor.isActive("blockquote"))} title="Block Quote">"</button>
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive("bulletList"))} title="Bullet List">•</button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive("orderedList"))} title="Numbered List">1.</button>
      <div className="w-px h-5 bg-slate-700 mx-1" />
      <button onClick={() => editor.chain().focus().undo().run()} className="px-2.5 py-1.5 rounded text-sm text-slate-400 hover:text-white hover:bg-slate-700 transition-all" title="Undo">↩</button>
      <button onClick={() => editor.chain().focus().redo().run()} className="px-2.5 py-1.5 rounded text-sm text-slate-400 hover:text-white hover:bg-slate-700 transition-all" title="Redo">↪</button>
      <div className="ml-auto">
        <button
          onClick={() => setFocusMode(!focusMode)}
          className={btnClass(focusMode)}
          title="Focus Mode (Ctrl+Shift+F)"
        >
          {focusMode ? "Exit Focus" : "Focus Mode"}
        </button>
      </div>
    </div>
  );
}

function FindReplaceBar({ editor, onClose }: {
  editor: ReturnType<typeof useEditor>;
  onClose: () => void;
}) {
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");

  const handleReplace = () => {
    if (!editor || !find) return;
    const content = editor.getText();
    const newContent = content.replace(new RegExp(find, "g"), replace);
    editor.commands.setContent(newContent);
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-700 bg-slate-800/80">
      <input
        type="text"
        value={find}
        onChange={(e) => setFind(e.target.value)}
        placeholder="Find..."
        className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 w-40"
      />
      <input
        type="text"
        value={replace}
        onChange={(e) => setReplace(e.target.value)}
        placeholder="Replace with..."
        className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 w-40"
      />
      <button onClick={handleReplace} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-all">Replace All</button>
      <button onClick={onClose} className="px-2 py-1.5 text-slate-400 hover:text-white text-sm transition-all">✕</button>
    </div>
  );
}

export function ForgeEditor({
  sceneId,
  documentId,
  initialContent,
  onSave,
  onWordCountChange,
}: ForgeEditorProps) {
  const [wordCount, setWordCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [focusMode, setFocusMode] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const maxWaitRef = useRef<ReturnType<typeof setTimeout>>();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight.configure({ multicolor: false }),
      Underline,
      CharacterCount,
      Placeholder.configure({
        placeholder: "Begin writing here... Your prose coach is ready when you need it.",
      }),
    ],
    content: initialContent ?? {
      type: "doc",
      content: [{ type: "paragraph" }],
    },
    editorProps: {
      attributes: {
        class: "prose-editor",
      },
    },
    onUpdate: ({ editor }) => {
      const words = editor.storage.characterCount?.words?.() ?? 0;
      setWordCount(words);
      onWordCountChange?.(words);
      scheduleSave(editor.getJSON());
    },
  });

  const scheduleSave = useCallback((content: JSONContent) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      doSave(content);
    }, 3000);

    if (!maxWaitRef.current) {
      maxWaitRef.current = setTimeout(() => {
        if (editor) doSave(editor.getJSON());
        maxWaitRef.current = undefined;
      }, 60000);
    }
  }, [editor]); // eslint-disable-line react-hooks/exhaustive-deps

  const doSave = async (content: JSONContent) => {
    if (!onSave) return;
    setSaving(true);
    try {
      await onSave(content, wordCount);
      setLastSaved(new Date());
    } catch {
      // Save failed
    } finally {
      setSaving(false);
    }
  };

  const handleManualSave = async () => {
    if (!editor || !onSave) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    if (maxWaitRef.current) clearTimeout(maxWaitRef.current);
    maxWaitRef.current = undefined;
    await doSave(editor.getJSON());
  };

  // Focus mode keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "F") {
        e.preventDefault();
        setFocusMode((prev) => !prev);
      }
      if (e.key === "Escape" && focusMode) {
        setFocusMode(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "h") {
        e.preventDefault();
        setShowFindReplace((prev) => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleManualSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const editorContent = (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
      {!focusMode && (
        <>
          <EditorToolbar editor={editor} focusMode={focusMode} setFocusMode={setFocusMode} />
          {showFindReplace && editor && (
            <FindReplaceBar editor={editor} onClose={() => setShowFindReplace(false)} />
          )}
        </>
      )}

      <div className={`flex-1 overflow-auto ${focusMode ? "px-0" : ""}`}>
        <EditorContent editor={editor} className="h-full" />
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-slate-700 bg-slate-800/50 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span>{wordCount.toLocaleString()} words</span>
          <span className="text-slate-600">Ctrl+Shift+F: Focus Mode</span>
          <span className="text-slate-600">Ctrl+H: Find & Replace</span>
        </div>
        <div className="flex items-center gap-3">
          {saving && <span className="text-blue-400">Saving...</span>}
          {!saving && lastSaved && (
            <span>Saved {lastSaved.toLocaleTimeString()}</span>
          )}
          <button
            onClick={handleManualSave}
            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded transition-all"
          >
            Save (Ctrl+S)
          </button>
        </div>
      </div>
    </div>
  );

  if (focusMode) {
    return (
      <div className="focus-mode-overlay">
        <div className="max-w-[65ch] mx-auto py-16 px-8">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setFocusMode(false)}
              className="text-slate-600 hover:text-slate-400 text-sm transition-colors"
            >
              Exit Focus (Esc)
            </button>
          </div>
          <EditorContent editor={editor} />
          <div className="mt-8 text-center text-slate-700 text-xs">
            {wordCount.toLocaleString()} words
          </div>
        </div>
      </div>
    );
  }

  return editorContent;
}
