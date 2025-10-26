import React, { useEffect, useState } from "react";

type Props = {
  chunkId: number;
  onClose: () => void;
  onSaved?: () => void;
};

export default function EditorModal({ chunkId, onClose, onSaved }: Props) {
  const [chunkText, setChunkText] = useState("");
  const [heroName, setHeroName] = useState("");
  const [personality, setPersonality] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/book/chunk/${chunkId}`).then((r) => r.json()).then((j) => {
      setChunkText(j.text || "");
    });
  }, [chunkId]);

  async function generate() {
    setLoading(true);
    setPreview(null);
    const body = {
      chunkIds: [chunkId],
      heroSpec: {
        name: heroName,
        personality: personality.split(",").map((s) => s.trim()).filter(Boolean)
      },
      constraints: { tone: "neutral" },
      nVariants: 1
    };
    const res = await fetch("/api/generate/hero-rewrite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const json = await res.json();
    setLoading(false);
    if (json.results && json.results.length > 0) setPreview(json.results[0]);
    else setPreview("No result");
  }

  async function save() {
    if (!preview) return;
    const res = await fetch("/api/stories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `Rewrite of chunk ${chunkId}`,
        bookId: 1,
        chunkIds: [chunkId],
        content: preview,
        heroSpec: { name: heroName, personality: personality.split(",").map((s) => s.trim()).filter(Boolean) }
      })
    });
    if (res.ok) {
      onSaved?.();
    } else {
      console.error("Save failed", await res.text());
    }
  }

  return (
    <div style={{
      position: "fixed", left: 0, top: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)",
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{ background: "white", padding: 20, width: 800, maxHeight: "90vh", overflow: "auto" }}>
        <h3>Edit Hero — Chunk {chunkId}</h3>
        <div>
          <label>Hero name: <input value={heroName} onChange={(e) => setHeroName(e.target.value)} /></label>
        </div>
        <div>
          <label>Personality (comma-separated): <input value={personality} onChange={(e) => setPersonality(e.target.value)} /></label>
        </div>
        <div style={{ marginTop: 12 }}>
          <button onClick={generate} disabled={loading}>{loading ? "Generating..." : "Generate"}</button>
          <button onClick={onClose} style={{ marginLeft: 8 }}>Close</button>
        </div>

        <h4 style={{ marginTop: 18 }}>Original</h4>
        <pre style={{ whiteSpace: "pre-wrap", background: "#fafafa", padding: 12 }}>{chunkText}</pre>

        <h4 style={{ marginTop: 12 }}>Preview</h4>
        <div style={{ background: "#fff8e1", padding: 12, minHeight: 80 }}>{preview ?? "No preview yet"}</div>

        <div style={{ marginTop: 12 }}>
          <button onClick={save} disabled={!preview}>Save as Story Version</button>
        </div>
      </div>
    </div>
  );
}