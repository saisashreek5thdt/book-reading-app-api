"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TipTapEditor from "@/components/TipTapEditor";



export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingBook, setEditingBook] = useState(null);
  const [showForm, setShowForm] = useState(false); // <-- Control form visibility

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    language: "",
    coverImage: null,
    smallDescription: "",
    content: "",
    pageCount: "",
    audioLink: "",
    relatedInfo: "",
    layout: "MIXED",
    categoryNames: [],
    contentBlocks: [],
    images: [],
  });

  // Load books on mount
  useEffect(() => {
    fetchBooks();
  }, []);

  async function fetchBooks() {
    try {
      const res = await fetch("http://localhost:3000/api/books");
      if (!res.ok) throw new Error("Failed to fetch books");
      const data = await res.json();
      setBooks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateOrUpdate(e) {
    e.preventDefault();
    const method = editingBook ? "PUT" : "POST";
    const url = editingBook
      ? `http://localhost:3000/api/books/${editingBook.id}`
      : "http://localhost:3000/api/books";

    const body = new FormData();

    // Append all fields
    for (const key in formData) {
      if (key === "coverImageFile" && formData.coverImage) {
        body.append("coverImage", formData.coverImage);
      } else if (key === "imageFiles") {
        formData.images.forEach((file) => body.append("images", file));
      } else if (Array.isArray(formData[key])) {
        formData[key].forEach((val) => body.append(key, val));
      } else if (formData[key] !== undefined && formData[key] !== null) {
        body.append(key, formData[key]);
      }
    }

    try {
      const res = await fetch(url, {
        method,
        // headers: { "Content-Type": "application/json" },
        body,
      });

      if (!res.ok) throw new Error(`Failed to ${editingBook ? "update" : "create"} book`);

      const updatedBook = await res.json();

      if (editingBook) {
        setBooks((prev) =>
          prev.map((book) => (book.id === updatedBook.id ? updatedBook : book))
        );
      } else {
        setBooks((prev) => [...prev, updatedBook]);
      }

      setFormData({
        title: "",
        author: "",
        language: "",
        coverImage: null,
        smallDescription: "",
        content: "",
        pageCount: "",
        audioLink: "",
        relatedInfo: "",
        layout: "MIXED",
        categoryNames: [],
        contentBlocks: [],
        images: []
      });
      setEditingBook(null);
      setShowForm(false); // Hide form after submit
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleEdit(book) {
    setEditingBook(book);
    setFormData({
      title: book.title || "",
      author: book.author || "",
      language: book.language || "",
      coverImage: book.coverImage || "",
      smallDescription: book.smallDescription || "",
      content: book.content || "",
      pageCount: book.pageCount || "",
      audioLink: book.audioLink || "",
      relatedInfo: book.relatedInfo || "",
      layout: book.layout || "MIXED",
      categoryNames: book.categories?.map((cat) => cat.name) || [],
      contentBlocks: book.contentBlocks || [],
      images: book.images || [],
    });
    setShowForm(true); // Show form when editing
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this book?")) return;

    try {
      const res = await fetch(`http://localhost:3000/api/books/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete book");

      setBooks((prev) => prev.filter((book) => book.id !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="text-red-500 p-6">Error: {error}</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Heading + Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📚 Book Manager</h1>
        {!showForm && (
          <button
            onClick={() => {
              setShowForm(true);
              setEditingBook(null);
              setFormData({
                title: "",
                author: "",
                language: "",
                coverImage: null,
                smallDescription: "",
                content: "",
                pageCount: "",
                audioLink: "",
                relatedInfo: "",
                layout: "MIXED",
                categoryNames: [],
                contentBlocks: [],
                images: []
              });
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add New Book <span className="text-xl font-bold">+</span>
          </button>
        )}
      </div>

      {/* Conditional Form Render */}
      {showForm && (
        <form onSubmit={handleCreateOrUpdate} className="mb-8 bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">{editingBook ? "Edit Book" : "Add New Book"}</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="border p-2 rounded"
              required
            />
            <input
              placeholder="Author"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className="border p-2 rounded"
              required
            />
            <input
              placeholder="Language"
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              className="border p-2 rounded"
              required
            />
            <input
              placeholder="Page Count"
              type="number"
              value={formData.pageCount}
              onChange={(e) => setFormData({ ...formData, pageCount: e.target.value })}
              className="border p-2 rounded"
            />
            {/* Cover Image Upload */}
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">Cover Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setFormData({ ...formData, coverImage: file });
                }}
                className="border p-2 rounded w-full"
              />
              {formData.coverImage && (
                <div className="mt-2 flex items-center space-x-2">
                  <img
                    src={URL.createObjectURL(formData.coverImage)}
                    alt="Cover Preview"
                    className="h-20 w-20 object-cover rounded"
                  />
                  <p className="text-sm text-gray-600">{formData.coverImage.name}</p>
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
            {/* <input
              placeholder="Cover Image URL"
              value={formData.coverImage}
              onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
              className="border p-2 rounded"
            /> */}
            {/* <input
              placeholder="Audio Link"
              value={formData.audioLink}
              onChange={(e) => setFormData({ ...formData, audioLink: e.target.value })}
              className="border p-2 rounded"
            /> */}
            {/* <input
              placeholder="Category Names (comma-separated)"
              value={formData.categoryNames.join(",")}
              onChange={(e) =>
                setFormData({ ...formData, categoryNames: e.target.value.split(",").map((s) => s.trim()) })
              }
              className="border p-2 rounded"
            /> */}
            <div className="mb-4 col-span-2">
              <label className="block mb-2 text-sm font-medium text-gray-700">Select Categories</label>

              {/* Selected Tags Display */}
              <div className="flex flex-wrap gap-2 mb-2 min-h-[36px] border rounded-md p-2 bg-gray-50">
                {formData.categoryNames.length === 0 && (
                  <span className="text-gray-400 text-sm">No categories selected</span>
                )}
                {formData.categoryNames.map((category) => (
                  <span
                    key={category}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {category}
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          categoryNames: formData.categoryNames.filter((c) => c !== category),
                        })
                      }
                      className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-gray-400 hover:bg-blue-200 hover:text-blue-900 focus:outline-none"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>

              {/* Checkbox List */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 mt-2 max-h-40 overflow-y-auto border-t pt-2">
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

            {/* <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">Choose Layout</label>
              <select
                value={formData.layout}
                onChange={(e) => setFormData({ ...formData, layout: e.target.value })}
                className="block w-full mt-1 rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              >
                <option value="" disabled>
                  Choose layout
                </option>
                <option value="FULL_TEXT">Full Text</option>
                <option value="IMAGE_TOP_TEXT_BOTTOM">Image Top, Text Bottom</option>
                <option value="TEXT_TOP_IMAGE_BOTTOM">Text Top, Image Bottom</option>
                <option value="MIXED">Mixed</option>
              </select>
            </div> */}

            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">Choose Layout</label>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: "FULL_TEXT", label: "Full Text", icon: "📄" },
                  { value: "IMAGE_TOP_TEXT_BOTTOM", label: "Image Top, Text Bottom", icon: `🖼️📄` },
                  { value: "TEXT_TOP_IMAGE_BOTTOM", label: "Text Top, Image Bottom", icon: "📄\n🖼️" },
                  { value: "MIXED", label: "Mixed", icon: "🧩" },
                ].map((layoutOption) => (
                  <label key={layoutOption.value} className="flex items-start space-x-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="layout"
                      value={layoutOption.value}
                      checked={formData.layout === layoutOption.value}
                      onChange={() => setFormData({ ...formData, layout: layoutOption.value })}
                      className="mt-1"
                    />
                    <span>
                      <strong>{layoutOption.icon}</strong><br />
                      <small>{layoutOption.label}</small>
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <input
              placeholder="Small Description"
              value={formData.smallDescription}
              onChange={(e) => setFormData({ ...formData, smallDescription: e.target.value })}
              className="border p-2 rounded col-span-2"
            />
            <textarea
              placeholder="Content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="border p-2 rounded col-span-2"
              rows="20"
            ></textarea>
            {/* <TipTapEditor
              content={formData.content}
              onChange={(value) => setFormData({ ...formData, content: value })}
            /> */}
            

            {/* <textarea
              placeholder="Related Info (JSON)"
              value={formData.relatedInfo}
              onChange={(e) => setFormData({ ...formData, relatedInfo: e.target.value })}
              className="border p-2 rounded col-span-2"
              rows="3"
            ></textarea> */}
            {/* <textarea
              placeholder="Images Array (JSON)"
              value={formData.images}
              onChange={(e) => setFormData({ ...formData, images: e.target.value })}
              className="border p-2 rounded col-span-2"
              rows="3"
            ></textarea> */}
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">Book Images</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  setFormData({ ...formData, images: files });
                }}
                className="border p-2 rounded w-full"
              />
              {formData.images.length > 0 && (
                <div className="mt-2 grid grid-cols-3 gap-4">
                  {formData.images.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index}`}
                        className="h-24 w-full object-cover rounded"
                      />
                      <p className="text-xs text-gray-600 truncate mt-1">{file.name}</p>
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
          </div>
          <button
            type="submit"
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {editingBook ? "Update Book" : "Create Book"}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowForm(false);
              setEditingBook(null);
            }}
            className="ml-2 mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Only show book list if form isn't visible */}
      {!showForm && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {books.map((book) => (
            <div key={book.id} className="border rounded shadow p-4 flex flex-col justify-between">
              <div>
                <h2 className="font-bold text-lg">{book.title}</h2>
                <p className="text-sm text-gray-600">by {book.author}</p>
                <p className="text-sm mt-2 truncate">{book.smallDescription}</p>
              </div>
              <div className="mt-4 space-x-2">
                <Link href={`/books/${book.id}`}>
                  <button className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">
                    View
                  </button>
                </Link>
                <button
                  onClick={() => handleEdit(book)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(book.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>

          ))}
        </div>
      )}
    </div>
  );
}