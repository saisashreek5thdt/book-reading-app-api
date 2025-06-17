"use client";

import React, { useEffect, useState } from "react"; // Reuse the same form component
import BooksForm from "@/components/BookForm";

export default function EditBookPage({ params }) {
  const id = React.use(params)?.id;
  const [bookData, setBookData] = useState(null);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchBook();
  }, [id]);

  if (loading) return <p>Loading book data...</p>;
  if (!bookData) return <p>Book not found</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Book</h1>
      <BooksForm initialData={bookData} />
    </div>
  );
}