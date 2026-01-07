// Default to the deployed Heroku backend API if NEXT_PUBLIC_API_URL isn't set in the environment.
// You can override this at deploy time by setting NEXT_PUBLIC_API_URL on the hosting platform.
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://ai-story-book-backend.herokuapp.com/api";

export async function fetchBookMetadata() {
  const res = await fetch(`${API_BASE}/book/metadata`);
  if (!res.ok) throw new Error("Failed to load metadata");
  return res.json();
}

export async function fetchBookDetails(bookId: number) {
  const res = await fetch(`${API_BASE}/book/${bookId}`);
  if (!res.ok) throw new Error("Failed to load book details");
  return res.json();
}

export async function fetchPages(bookId: number, start: number, end: number) {
  const res = await fetch(`${API_BASE}/book/pages?bookId=${bookId}&start=${start}&end=${end}`);
  if (!res.ok) throw new Error("Failed to load pages");
  return res.json();
}

export async function generateHeroRewrite(payload: any) {
  const res = await fetch(`${API_BASE}/generate/hero-rewrite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function saveStory(payload: any) {
  const res = await fetch(`${API_BASE}/stories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return res.json();
}

// Chat with book using the available story context
export async function chatWithBook(payload: any) {
  // Always include the Hale story book ID for context
  const chatPayload = {
    ...payload,
    bookId: 2 // The ID of the ingested Hale story
  };
  
  const res = await fetch(`${API_BASE}/generate/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(chatPayload)
  });
  
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  
  return res.json();
}