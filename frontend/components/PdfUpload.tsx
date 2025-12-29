import React, { useState } from "react";

interface Props {
  backendHttp: string;
  onIngest: () => void;
}

export const PdfUpload: React.FC<Props> = ({ backendHttp, onIngest }) => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");

  const upload = async () => {
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    setStatus("Uploading...");
    const res = await fetch(`${backendHttp}/uploadPdf`, { method:"POST", body: form });
    if (res.ok) {
      setStatus("Uploaded & ingested.");
      onIngest();
    } else {
      setStatus("Upload failed.");
    }
  };

  return (
    <div style={{ marginBottom:"16px" }}>
      <input type="file" accept="application/pdf" onChange={e => setFile(e.target.files?.[0] || null)} />
      <button onClick={upload} disabled={!file} style={{ marginLeft:"8px" }}>Upload PDF</button>
      <div style={{ fontSize:"12px", marginTop:"4px" }}>{status}</div>
    </div>
  );
};