"use client";

import React, { useEffect, useState } from "react";
import BooksForm from "@/components/BookForm";

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

export default function EditBookPage({ params }) {
  const id = React.use(params)?.id;
  const [bookData, setBookData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // Fetch existing book data when page loads
  useEffect(() => {
    async function fetchBook() {
      try {
        const res = await fetch(`/api/books/${id}`);
        if (!res.ok) throw new Error("Failed to load book");
        const data = await res.json();
        setBookData(data);
      } catch (err) {
        console.error(err);
        setToast({
          show: true,
          message: `❌ ${err.message || "Failed to load book."}`,
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchBook();
  }, [id]);

  const handleSuccess = (updatedBook) => {
    setToast({
      show: true,
      message: "✅ Book updated successfully!",
      type: "success",
    });

    // Optionally redirect or update UI
    setTimeout(() => {
      window.location.href = `/books/${updatedBook.id}`;
    }, 1500);
  };

  const handleError = (err) => {
    setToast({
      show: true,
      message: `❌ ${err.message || "An error occurred while updating the book."}`,
      type: "error",
    });
  };

  if (loading) return <p>Loading book data...</p>;
  if (!bookData) return <p>Book not found</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      <h1 className="text-2xl font-bold mb-6">Edit Book</h1>

      {/* Pass callbacks for feedback */}
      <BooksForm initialData={bookData} onSuccess={handleSuccess} onError={handleError} />
    </div>
  );
}