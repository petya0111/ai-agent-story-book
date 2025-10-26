export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export async function fetchBookMetadata() {
  const res = await fetch(`${API_BASE}/book/metadata`);
  if (!res.ok) throw new Error("Failed to load metadata");
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