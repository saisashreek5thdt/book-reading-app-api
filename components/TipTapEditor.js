"use client";

import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import "./TipTapEditor.css"; // Ensure you have a CSS file for styling

export default function TipTapEditor({ content, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["paragraph", "heading"] }),
      Link,
      TextStyle,
      Color,
      Highlight,
    ],
    placeholder: "Start writing your content...",
    content: content || "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;
  if (!editor) {
  console.log("Editor not ready yet");
  return null;
}


  return (
    <>
      <BubbleMenu  className="bubble-menu" editor={editor}>
        <button onClick={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().chain().focus().toggleBold().run()}>
          <b>B</b>
        </button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!editor.can().chain().focus().toggleItalic().run()}>
          <i>I</i>
        </button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <u>U</u>
        </button>
        <button onClick={() => editor.chain().focus().toggleStrike().run()}>
          S̶
        </button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>H1</button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
        <button onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</button>
        <button onClick={() => editor.chain().focus().setTextAlign("left").run()}>Left</button>
        <button onClick={() => editor.chain().focus().setTextAlign("center").run()}>Center</button>
        <button onClick={() => editor.chain().focus().setTextAlign("right").run()}>Right</button>
        <button onClick={() => editor.chain().focus().toggleHighlight().run()}>Mark</button>
      </BubbleMenu>

      <EditorContent editor={editor} />
    </>
  );
}