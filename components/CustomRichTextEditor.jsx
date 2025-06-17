"use client";
import { useRef, useEffect } from "react";

export default function CustomRichTextEditor({ content, onChange }) {
  const editorRef = useRef(null);

  const format = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus(); // Keep focus inside editor
    onChange(editorRef.current.innerHTML); // Sync HTML with parent
  };

  const handleInput = () => {
    onChange(editorRef.current.innerHTML);
  };

  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="flex gap-2 flex-wrap mb-2">
        <button type="button" onClick={() => format("bold")} className="px-2 py-1 border rounded">B</button>
        <button type="button" onClick={() => format("italic")} className="px-2 py-1 border rounded">I</button>
        <button type="button" onClick={() => format("underline")} className="px-2 py-1 border rounded">U</button>
        <button type="button" onClick={() => format("insertUnorderedList")} className="px-2 py-1 border rounded">• List</button>
        <button type="button" onClick={() => format("formatBlock", "H1")} className="px-2 py-1 border rounded">H1</button>
        <button type="button" onClick={() => format("formatBlock", "H2")} className="px-2 py-1 border rounded">H2</button>
        <button type="button" onClick={() => format("removeFormat")} className="px-2 py-1 border rounded">Clear</button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning={true}
        onInput={handleInput}
        className="min-h-[200px] border p-3 rounded bg-white shadow-inner outline-none whitespace-pre-wrap focus:outline-blue-400"
        style={{
          fontFamily: "inherit",
        }}
      />
    </div>
  );
}
