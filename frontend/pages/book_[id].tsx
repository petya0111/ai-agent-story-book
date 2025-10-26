import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import EditorModal from "../components/EditorModal";

type Chunk = { id: number; pageNumber: number; text: string };

export default function BookReader() {
  const router = useRouter();
  const { id } = router.query;
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [page, setPage] = useState(1);
  const [openEditor, setOpenEditor] = useState<null | { chunkId: number }>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/book/pages?start=${page}&end=${page}`);
      const json = await res.json();
      setChunks(json.chunks || []);
    }
    if (id) load();
  }, [id, page]);

  return (
    <main style={{ padding: 24 }}>
      <h2>Reader</h2>
      <div>
        <button onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
        <span style={{ margin: "0 12px" }}>Page {page}</span>
        <button onClick={() => setPage((p) => p + 1)}>Next</button>
      </div>

      <div style={{ marginTop: 20 }}>
        {chunks.map((c) => (
          <article key={c.id} style={{ marginBottom: 20, borderBottom: "1px solid #eee", paddingBottom: 10 }}>
            <h4>Page {c.pageNumber}</h4>
            <p>{c.text}</p>
            <button onClick={() => setOpenEditor({ chunkId: c.id })}>Edit Hero</button>
          </article>
        ))}
      </div>

      {openEditor && (
        <EditorModal
          chunkId={openEditor.chunkId}
          onClose={() => setOpenEditor(null)}
          onSaved={() => {
            setOpenEditor(null);
            // refresh chunks
            fetch(`/api/book/pages?start=${page}&end=${page}`)
              .then((r) => r.json())
              .then((j) => setChunks(j.chunks || []));
          }}
        />
      )}
    </main>
  );
}