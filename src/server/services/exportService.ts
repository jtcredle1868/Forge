// src/server/services/exportService.ts
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";

interface SceneContent {
  chapterTitle: string;
  sceneTitle: string;
  content: unknown;
  wordCount: number;
}

function extractPlainText(content: unknown): string {
  if (typeof content === "string") return content;
  if (content && typeof content === "object") {
    const c = content as { content?: string; type?: string };
    if (typeof c.content === "string") return c.content;
    // TipTap JSON traversal
    return extractFromTipTap(content as TipTapNode);
  }
  return "";
}

interface TipTapNode {
  type?: string;
  text?: string;
  content?: TipTapNode[];
}

function extractFromTipTap(node: TipTapNode): string {
  if (node.type === "text") return node.text ?? "";
  if (node.content && Array.isArray(node.content)) {
    const parts = node.content.map(extractFromTipTap);
    if (node.type === "paragraph") return parts.join("") + "\n\n";
    if (node.type === "heading") return parts.join("") + "\n\n";
    if (node.type === "blockquote") return parts.join("") + "\n";
    return parts.join("");
  }
  return "";
}

export function exportAsText(title: string, scenes: SceneContent[]): string {
  const lines: string[] = [];
  lines.push(title.toUpperCase());
  lines.push("=".repeat(title.length));
  lines.push("");

  let currentChapter = "";
  for (const scene of scenes) {
    if (scene.chapterTitle !== currentChapter) {
      currentChapter = scene.chapterTitle;
      lines.push("");
      lines.push(currentChapter);
      lines.push("-".repeat(currentChapter.length));
      lines.push("");
    }
    lines.push(`[${scene.sceneTitle}]`);
    lines.push("");
    lines.push(extractPlainText(scene.content));
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  return lines.join("\n");
}

export async function exportAsDocx(title: string, scenes: SceneContent[]): Promise<Buffer> {
  const children: Paragraph[] = [];

  // Title
  children.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.HEADING_1,
    })
  );

  let currentChapter = "";
  for (const scene of scenes) {
    if (scene.chapterTitle !== currentChapter) {
      currentChapter = scene.chapterTitle;
      children.push(
        new Paragraph({
          text: currentChapter,
          heading: HeadingLevel.HEADING_2,
        })
      );
    }

    children.push(
      new Paragraph({
        text: scene.sceneTitle,
        heading: HeadingLevel.HEADING_3,
      })
    );

    const text = extractPlainText(scene.content);
    const paragraphs = text.split(/\n\n+/).filter((p) => p.trim());
    for (const para of paragraphs) {
      children.push(
        new Paragraph({
          children: [new TextRun(para.trim())],
          spacing: { after: 200 },
        })
      );
    }

    // Scene break
    children.push(
      new Paragraph({
        children: [new TextRun({ text: "* * *", italics: true })],
        alignment: "center" as const,
        spacing: { before: 200, after: 200 },
      })
    );
  }

  const doc = new Document({ sections: [{ children }] });
  return Packer.toBuffer(doc);
}
