// components/SimpleRichTextEditor.jsx
"use client";

import { useEffect, useRef } from "react";

export default function SimpleRichTextEditor({ content, onChange }) {
  const editorRef = useRef(null);

  // Load initial content
  useEffect(() => {
    if (editorRef.current && content) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    triggerChange();
  };

  const triggerChange = () => {
    if (onChange) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="border rounded p-2">
      {/* Toolbar */}
      <div className="flex gap-2 border-b pb-2 mb-2">
        <button type="button" onClick={() => execCommand("bold")} className="px-2 py-1 bg-gray-200 hover:bg-gray-300">B</button>
        <button type="button" onClick={() => execCommand("italic")} className="px-2 py-1 bg-gray-200 hover:bg-gray-300">I</button>
        <button type="button" onClick={() => execCommand("underline")} className="px-2 py-1 bg-gray-200 hover:bg-gray-300">U</button>
        <button type="button" onClick={() => execCommand("formatBlock", "<h1>")} className="px-2 py-1 bg-gray-200 hover:bg-gray-300">H1</button>
        <button type="button" onClick={() => execCommand("insertUnorderedList")} className="px-2 py-1 bg-gray-200 hover:bg-gray-300">UL</button>
        <button type="button" onClick={() => execCommand("insertOrderedList")} className="px-2 py-1 bg-gray-200 hover:bg-gray-300">OL</button>
      </div>

      {/* Editable Area */}
      <div
        ref={editorRef}
        contentEditable
        onBlur={triggerChange}
        className="min-h-[200px] p-2 outline-none border rounded"
        dangerouslySetInnerHTML={{ __html: content || "<p>Start writing here...</p>" }}
      />
    </div>
  );
}