"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingBook, setEditingBook] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    language: "",
    coverImage: "",
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
      const res = await fetch("/api/books");
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
    const url = editingBook ? `/api/books/${editingBook.id}` : "/api/books";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok)
        throw new Error(`Failed to ${editingBook ? "update" : "create"} book`);

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
        coverImage: "",
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
      setEditingBook(null);
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
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this book?")) return;

    try {
      const res = await fetch(`/api/books/${id}`, {
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
      <h1 className="text-2xl font-bold mb-6">📚 Book Manager</h1>

      {/* Form for create/edit */}
      <form
        onSubmit={handleCreateOrUpdate}
        className="mb-8 bg-white shadow rounded-lg p-6"
      >
        <h2 className="text-xl font-semibold mb-4">
          {editingBook ? "Edit Book" : "Add New Book"}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <input
            placeholder="Title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="border p-2 rounded"
            required
          />
          <input
            placeholder="Author"
            value={formData.author}
            onChange={(e) =>
              setFormData({ ...formData, author: e.target.value })
            }
            className="border p-2 rounded"
            required
          />
          <input
            placeholder="Language"
            value={formData.language}
            onChange={(e) =>
              setFormData({ ...formData, language: e.target.value })
            }
            className="border p-2 rounded"
            required
          />
          <input
            placeholder="Cover Image URL"
            value={formData.coverImage}
            onChange={(e) =>
              setFormData({ ...formData, coverImage: e.target.value })
            }
            className="border p-2 rounded"
          />
          <input
            placeholder="Page Count"
            type="number"
            value={formData.pageCount}
            onChange={(e) =>
              setFormData({ ...formData, pageCount: e.target.value })
            }
            className="border p-2 rounded"
          />
          <input
            placeholder="Audio Link"
            value={formData.audioLink}
            onChange={(e) =>
              setFormData({ ...formData, audioLink: e.target.value })
            }
            className="border p-2 rounded"
          />
          <input
            placeholder="Category Names (comma-separated)"
            value={formData.categoryNames.join(",")}
            onChange={(e) =>
              setFormData({
                ...formData,
                categoryNames: e.target.value.split(",").map((s) => s.trim()),
              })
            }
            className="border p-2 rounded"
          />
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Choose Layout
            </label>
            <select
              value={formData.layout}
              onChange={(e) =>
                setFormData({ ...formData, layout: e.target.value })
              }
              className="block w-full mt-1 rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="" disabled>
                Choose layout
              </option>
              <option value="FULL_TEXT">Full Text</option>
              <option value="IMAGE_TOP_TEXT_BOTTOM">
                Image Top, Text Bottom
              </option>
              <option value="TEXT_TOP_IMAGE_BOTTOM">
                Text Top, Image Bottom
              </option>
              <option value="MIXED">Mixed</option>
            </select>
          </div>
          <input
            placeholder="Small Description"
            value={formData.smallDescription}
            onChange={(e) =>
              setFormData({ ...formData, smallDescription: e.target.value })
            }
            className="border p-2 rounded col-span-2"
          />
          <textarea
            placeholder="Content"
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            className="border p-2 rounded col-span-2"
            rows="20"
          ></textarea>
          <textarea
            placeholder="Related Info (JSON)"
            value={formData.relatedInfo}
            onChange={(e) =>
              setFormData({ ...formData, relatedInfo: e.target.value })
            }
            className="border p-2 rounded col-span-2"
            rows="3"
          ></textarea>
          <textarea
            placeholder="Images Array (JSON)"
            value={formData.images}
            onChange={(e) =>
              setFormData({ ...formData, images: e.target.value })
            }
            className="border p-2 rounded col-span-2"
            rows="3"
          ></textarea>
        </div>
        <button
          type="submit"
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {editingBook ? "Update Book" : "Create Book"}
        </button>
      </form>

      {/* Book List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {books.map((book) => (
          <div
            key={book.id}
            className="border rounded shadow p-4 flex flex-col justify-between"
          >
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
    </div>
  );
}
