"use client";

import { useState } from "react";
import { saveImage } from "@/utils/saveImage";

export default function BooksForm({ initialData = null }) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    author: initialData?.author || "",
    language: initialData?.language || "",
    coverImage: initialData?.coverImage || null,
    smallDescription: initialData?.smallDescription || "",
    content: initialData?.content || "",
    pageCount: initialData?.pageCount || "",
    audioLink: initialData?.audioLink || "",
    relatedInfo: initialData?.relatedInfo || "",
    layout: initialData?.layout || "MIXED",
    categoryNames: initialData?.categories?.map((cat) => cat.name) || [],
    contentBlocks: initialData?.contentBlocks || [],
    images: initialData?.images || [],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const method = initialData ? "PUT" : "POST";
    const url = initialData
      ? `/api/books/${initialData.id}`
      : `/api/books`;

    const body = new FormData();

    for (const key in formData) {
      if (Array.isArray(formData[key])) {
        formData[key].forEach((val) => body.append(key, val));
      } else if (formData[key] !== undefined && formData[key] !== null) {
        body.append(key, formData[key]);
      }
    }

    const res = await fetch(url, {
      method,
      body,
    });

    const result = await res.json();

    if (res.ok) {
      alert(initialData ? "Book updated!" : "Book created!");
      window.location.href = "/books"; // Redirect
    } else {
      alert("Error saving book");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full border px-3 py-2 rounded-md"
          required
        />
      </div>

      {/* Author */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Author</label>
        <input
          type="text"
          value={formData.author}
          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          className="w-full border px-3 py-2 rounded-md"
          required
        />
      </div>

      {/* Language */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Language</label>
        <input
          type="text"
          value={formData.language}
          onChange={(e) => setFormData({ ...formData, language: e.target.value })}
          className="w-full border px-3 py-2 rounded-md"
          required
        />
      </div>

      {/* Cover Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Cover Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            setFormData({ ...formData, coverImage: file });
          }}
          className="w-full border px-3 py-2 rounded-md"
        />
        {formData.coverImage && (
          <div className="mt-2 flex items-center space-x-2">
            {formData.coverImage instanceof File ? (
              <img
                src={URL.createObjectURL(formData.coverImage)}
                alt="Cover Preview"
                className="h-20 w-20 object-cover rounded"
                onLoad={() =>
                  URL.revokeObjectURL(URL.createObjectURL(formData.coverImage))
                }
              />
            ) : (
              <img
                src={formData.coverImage}
                alt="Saved Cover"
                className="h-20 w-20 object-cover rounded"
              />
            )}
            <p className="text-sm text-gray-600">
              {formData.coverImage instanceof File
                ? formData.coverImage.name
                : "Saved Image"}
            </p>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, coverImage: null })}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {/* Categories */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Categories</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 max-h-40 overflow-y-auto border rounded p-2">
          {[
            "Fiction",
            "Non-Fiction",
            "Science Fiction",
            "Fantasy",
            "History",
            "Biography",
            "Mystery",
            "Self-Help",
          ].map((category) => (
            <label key={category} className="inline-flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.categoryNames.includes(category)}
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  if (isChecked) {
                    setFormData({
                      ...formData,
                      categoryNames: [...formData.categoryNames, category],
                    });
                  } else {
                    setFormData({
                      ...formData,
                      categoryNames: formData.categoryNames.filter((c) => c !== category),
                    });
                  }
                }}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Layout Options */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Choose Layout</label>
        <div className="grid grid-cols-2 gap-4 mt-2">
          {[
            { value: "FULL_TEXT", label: "Full Text", icon: "📄" },
            { value: "IMAGE_TOP_TEXT_BOTTOM", label: "Image Top, Text Bottom", icon: "🖼️📄" },
            { value: "TEXT_TOP_IMAGE_BOTTOM", label: "Text Top, Image Bottom", icon: "📄🖼️" },
            { value: "MIXED", label: "Mixed", icon: "🧩" },
          ].map((layoutOption) => (
            <label
              key={layoutOption.value}
              className="flex items-start space-x-2 p-2 border rounded cursor-pointer hover:bg-gray-50"
            >
              <input
                type="radio"
                name="layout"
                value={layoutOption.value}
                checked={formData.layout === layoutOption.value}
                onChange={() =>
                  setFormData({ ...formData, layout: layoutOption.value })
                }
                className="mt-1"
              />
              <span>
                <strong>{layoutOption.icon}</strong>
                <br />
                <small>{layoutOption.label}</small>
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Small Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Small Description</label>
        <textarea
          value={formData.smallDescription}
          onChange={(e) =>
            setFormData({ ...formData, smallDescription: e.target.value })
          }
          className="w-full border px-3 py-2 rounded-md"
          rows="2"
        />
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Content</label>
        <textarea
          value={formData.content}
          onChange={(e) =>
            setFormData({ ...formData, content: e.target.value })
          }
          className="w-full border px-3 py-2 rounded-md"
          rows="10"
        />
      </div>

      {/* Book Images Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Book Images</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => {
            const files = Array.from(e.target.files);
            setFormData({ ...formData, images: files });
          }}
          className="w-full border px-3 py-2 rounded-md"
        />
        {formData.images.length > 0 && (
          <div className="mt-2 grid grid-cols-3 gap-4">
            {formData.images.map((file, index) => (
              <div key={index} className="relative group">
                {file instanceof File ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index}`}
                    className="h-24 w-full object-cover rounded"
                    onLoad={() => URL.revokeObjectURL(URL.createObjectURL(file))}
                  />
                ) : (
                  <img
                    src={file}
                    alt="Saved"
                    className="h-24 w-full object-cover rounded"
                  />
                )}
                <p className="text-xs text-gray-600 truncate mt-1">{file.name || "Saved Image"}</p>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      images: formData.images.filter((_, i) => i !== index),
                    })
                  }
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
      >
        {initialData ? "Update Book" : "Create Book"}
      </button>
    </form>
  );
}