"use client";
import React, { useEffect, useState } from "react";
import NavBar from "../../../components/NavBar";
import { fetchBookMetadata, fetchPages } from "../../../lib/api";
import { deriveQuestionsFromTexts } from "../../../lib/derive";

export default function PreviewPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [start, setStart] = useState(1);
  const [end, setEnd] = useState(5);
  const [chunks, setChunks] = useState<any[]>([]);
  const [questions, setQuestions] = useState<string[]>([]);

  useEffect(() => {
    fetchBookMetadata().then((b) => {
      setBooks(b || []);
      if ((b || []).length > 0) setSelected((b[0] as any).id);
    }).catch((e) => console.error(e));
  }, []);

  async function loadChunks() {
    if (!selected) return;
    try {
      const resp = await fetchPages(selected, start, end);
      setChunks(resp || []);
      const texts = (resp || []).map((c: any) => c.text || "");
      const derived = deriveQuestionsFromTexts(texts, 10);
      setQuestions(derived);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div>
      <NavBar />
      <main className="preview-page">
        <div className="controls">
          <label>
            Book:
            <select value={selected ?? ""} onChange={(e) => setSelected(Number(e.target.value))}>
              {books.map((b) => (
                <option key={b.id} value={b.id}>{b.title}</option>
              ))}
            </select>
          </label>
          <label>
            Start page:
            <input type="number" value={start} onChange={(e) => setStart(Number(e.target.value))} min={1} />
          </label>
          <label>
            End page:
            <input type="number" value={end} onChange={(e) => setEnd(Number(e.target.value))} min={start} />
          </label>
          <button onClick={loadChunks}>Load Chunks</button>
        </div>

        <section className="chunks-list">
          <h2>Chunks</h2>
          {chunks.length === 0 && <p>No chunks loaded. Choose a range and press "Load Chunks".</p>}
          {chunks.map((c: any) => (
            <article key={c.id} className="chunk">
              <h4>Chunk #{c.id} — page {c.pageNumber}</h4>
              <p style={{ whiteSpace: "pre-wrap" }}>{c.text}</p>
            </article>
          ))}
        </section>

        <section className="derived-questions">
          <h2>Derived Suggested Questions</h2>
          {questions.length === 0 && <p>No suggestions yet.</p>}
          <ul>
            {questions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
