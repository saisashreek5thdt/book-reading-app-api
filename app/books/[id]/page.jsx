"use client";

import { useEffect, useState } from "react";
import React from "react";
import Link from "next/link";

export default function BookDetails({ params }) {
  const id = React.use(params)?.id; // Safe access for App Router
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    async function fetchBook() {
      try {
        const res = await fetch(`${process.env.BASE_URL}/api/books/${id}`);
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

  if (loading) return <p className="text-center py-10">Loading book details...</p>;
  if (error) return <p className="text-red-500 text-center py-10">Error: {error}</p>;
  if (!book) return <p className="text-center py-10">Book not found.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
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
      <div className="mt-8 flex gap-4">
        
        <Link href="/books">
          <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded transition">
            Back to All Books
          </button>
        </Link>
      </div>
    </div>
  );
}