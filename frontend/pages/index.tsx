import { useEffect, useState } from "react";
import { fetchBookMetadata, fetchPages, generateHeroRewrite, saveStory } from "../lib/api";

export default function Home() {
  const [books, setBooks] = useState<any[]>([]);
  const [bookId, setBookId] = useState<number | null>(null);
  const [chunks, setChunks] = useState<any[]>([]);
  const [selectedChunk, setSelectedChunk] = useState<any | null>(null);
  const [heroName, setHeroName] = useState("");
  const [generated, setGenerated] = useState<any>(null);

  useEffect(() => {
    fetchBookMetadata().then(setBooks).catch(console.error);
  }, []);

  useEffect(() => {
    if (books.length > 0) {
      setBookId(books[0].id);
    }
  }, [books]);

  useEffect(() => {
    if (bookId != null) {
      fetchPages(bookId, 1, 3).then((data) => setChunks(data)).catch(console.error);
    }
  }, [bookId]);

  return (
    <div className="container">
      <h1>Book Agent — Reader</h1>
      <div>
        <label>Book: </label>
        <select onChange={(e) => setBookId(Number(e.target.value))} value={bookId ?? undefined}>
          {books.map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}
        </select>
      </div>

      <h2>Pages / Chunks</h2>
      <ul>
        {chunks.map((c) => (
          <li key={c.id}>
            <div style={{ whiteSpace: "pre-wrap" }}>{c.text}</div>
            <button onClick={() => setSelectedChunk(c)} className="button">Edit Hero</button>
          </li>
        ))}
      </ul>

      {selectedChunk && (
        <div style={{ marginTop: 20 }}>
          <h3>Edit chunk #{selectedChunk.id}</h3>
          <div>
            <label>New hero name:</label>
            <input value={heroName} onChange={(e) => setHeroName(e.target.value)} />
            <button className="button" onClick={async () => {
              const resp = await generateHeroRewrite({
                chunkIds: [selectedChunk.id],
                heroSpec: { name: heroName, age: null, personality: [], role: null },
                constraints: {},
                nVariants: 1
              });
              setGenerated(resp);
            }}>Generate</button>
          </div>

          {generated && (
            <div style={{ marginTop: 12 }}>
              <h4>Generated</h4>
              <pre style={{ whiteSpace: "pre-wrap", background: "#f3f4f6", padding: 12 }}>{JSON.stringify(generated, null, 2)}</pre>
              <button className="button" onClick={async () => {
                // Simplified save request — adapt metadata as needed
                const saved = await saveStory({
                  title: `Edited chunk ${selectedChunk.id}`,
                  bookId,
                  chunkIds: [selectedChunk.id],
                  content: (generated as any).choices?.[0]?.message?.content || JSON.stringify(generated),
                  authorId: null,
                  parentVersionId: null,
                  metadata: { heroName }
                });
                alert("Saved version id: " + saved.id);
              }}>Save</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}