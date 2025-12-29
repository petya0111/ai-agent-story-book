"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "../../../components/NavBar";
import { fetchBookMetadata } from "../../../lib/api";

type Book = {
  id: number;
  title: string;
  author?: string;
  pdfPath: string;
  pages: number;
  createdAt: string;
};

export default function ChroniclesPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadBooks();
  }, []);

  async function loadBooks() {
    try {
      setLoading(true);
      const data = await fetchBookMetadata();
      setBooks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load books");
    } finally {
      setLoading(false);
    }
  }

  function handleBookSelect(book: Book) {
    // Navigate to the oracle page with book context
    router.push(`/oracle?bookId=${book.id}&title=${encodeURIComponent(book.title)}`);
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function getBookThumb(title: string) {
    // Generate a gradient based on the book title
    const hue = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360;
    return `linear-gradient(135deg, hsl(${hue}, 70%, 45%), hsl(${(hue + 60) % 360}, 70%, 60%))`;
  }

  return (
    <>
      <NavBar />
      <div className="chronicles-page">
        <div className="chronicles-header">
          <div className="header-content">
            <h1 className="page-title">
              <span className="title-icon">📚</span>
              Ancient Chronicles
            </h1>
            <p className="page-subtitle">
              Discover the sacred texts and legendary tales preserved through the ages. 
              Each chronicle holds wisdom, adventure, and the power to transport you to other realms.
            </p>
          </div>
          <div className="mystical-particles">
            {Array.from({length: 20}).map((_, i) => (
              <div key={i} className="particle" style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }} />
            ))}
          </div>
        </div>

        <div className="chronicles-content">
          {loading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Unveiling the ancient texts...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <div className="error-icon">⚠️</div>
              <h3>The Archive is Sealed</h3>
              <p>{error}</p>
              <button onClick={loadBooks} className="retry-button">
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className="books-grid">
              {books.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📖</div>
                  <h3>The Archive Awaits</h3>
                  <p>No chronicles have been discovered yet. The ancient texts remain hidden...</p>
                </div>
              ) : (
                books.map((book) => (
                  <div key={book.id} className="book-card" onClick={() => handleBookSelect(book)}>
                    <div className="book-cover" style={{ background: getBookThumb(book.title) }}>
                      <div className="book-glow"></div>
                      <div className="book-title-overlay">
                        <h3>{book.title}</h3>
                        {book.author && <p className="book-author">by {book.author}</p>}
                      </div>
                    </div>
                    <div className="book-info">
                      <div className="book-stats">
                        <span className="stat">
                          <span className="stat-icon">📄</span>
                          {book.pages} pages
                        </span>
                        <span className="stat">
                          <span className="stat-icon">📅</span>
                          {formatDate(book.createdAt)}
                        </span>
                      </div>
                      <div className="book-actions">
                        <button className="primary-action">
                          <span className="action-icon">🔮</span>
                          Begin Journey
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}