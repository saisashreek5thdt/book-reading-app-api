"use client";

import { useEffect, useState } from "react";
import React from "react";
import Link from "next/link";

// Toast Component
function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === "success" ? "bg-green-500" : "bg-red-500";

  return (
    <div className={`fixed bottom-4 right-4 ${bgColor} text-white px-4 py-2 rounded shadow-lg z-50`}>
      {message}
    </div>
  );
}

export default function BookDetails({ params }) {
  const id = React.use(params)?.id;
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function fetchBook() {
      try {
        const res = await fetch(`/api/books/${id}`);
        if (!res.ok) throw new Error("Failed to load book");
        const data = await res.json();
        setBook(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchBook();
  }, [id]);

  // Handle Delete from this page
  async function handleDelete(e) {
    e.preventDefault();

    if (!confirm("Are you sure you want to delete this book?")) return;

    setSubmitting(true);
    setToast({ show: true, message: "Deleting book...", type: "success" });

    try {
      const res = await fetch(`/api/books/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete book");

      setToast({
        show: true,
        message: "✅ Book deleted successfully!",
        type: "success",
      });

      setTimeout(() => {
        window.location.href = "/books"; // Redirect after toast
      }, 1500);

    } catch (err) {
      setToast({
        show: true,
        message: `❌ ${err.message || "An error occurred."}`,
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading)
    return (
      <p className="text-center py-10">
        Loading book details... <span className="animate-pulse">•••</span>
      </p>
    );

  if (error)
    return <p className="text-red-500 text-center py-10">Error: {error}</p>;

  if (!book)
    return <p className="text-center py-10">Book not found.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      {/* Cover Image */}
      {book.coverImage && (
        <div className="mb-6">
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-72 object-cover rounded-lg shadow-md"
          />
        </div>
      )}

      {/* Title & Author */}
      <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
      <p className="text-xl text-gray-600 mb-4">by {book.author}</p>

      {/* Language & Page Count */}
      <div className="flex gap-4 text-sm text-gray-500 mb-6">
        <span>Language: {book.language || "N/A"}</span>
        <span>•</span>
        <span>Pages: {book.pageCount || "N/A"}</span>
        <span>•</span>
        <span>Layout: {book.layout || "MIXED"}</span>
      </div>

      {/* Small Description */}
      {book.smallDescription && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Short Description</h2>
          <p className="text-gray-700">{book.smallDescription}</p>
        </section>
      )}

      {/* Content */}
      {book.content && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Content</h2>
          <p className="whitespace-pre-wrap text-gray-800">{book.content}</p>
        </section>
      )}

      {/* Audio Link */}
      {book.audioLink && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Audio Version</h2>
          <audio controls className="w-full">
            <source src={book.audioLink} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </section>
      )}

      {/* Related Info (JSON) */}
      {book.relatedInfo && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Related Info</h2>
          <pre className="bg-gray-100 p-3 rounded overflow-x-auto text-sm">
            {typeof book.relatedInfo === "string"
              ? book.relatedInfo
              : JSON.stringify(book.relatedInfo, null, 2)}
          </pre>
        </section>
      )}

      {/* Images Array */}
      {book.images?.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Additional Images</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {book.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Image ${index + 1}`}
                className="rounded shadow w-full h-40 object-cover"
              />
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      {book.categories?.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Categories</h2>
          <ul className="flex flex-wrap gap-2">
            {book.categories.map((category, index) => (
              <li
                key={index}
                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
              >
                {category.name}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Edit/Delete Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <Link href="/books">
          <button
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded transition"
            disabled={submitting}
          >
            Back to All Books
          </button>
        </Link>

        <Link href={`/books/edit/${id}`}>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition"
            disabled={submitting}
          >
            Edit Book
          </button>
        </Link>

        <button
          onClick={handleDelete}
          disabled={submitting}
          className={`${
            submitting ? "bg-red-300 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"
          } text-white px-4 py-2 rounded transition`}
        >
          {submitting ? "Please wait..." : "Delete Book"}
        </button>
      </div>
    </div>
  );
}