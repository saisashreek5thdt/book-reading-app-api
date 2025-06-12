"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";

import { useEffect } from "react";

export default function TipTapEditor({ content, onChange }) {
  const editor = useEditor({
    extensions: [StarterKit, Underline, Link, Image],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || "");
    }
  }, [content, editor]);

  return (
    <div className="border p-2 rounded col-span-2">
      {editor && <EditorContent editor={editor} />}
    </div>
  );
}
