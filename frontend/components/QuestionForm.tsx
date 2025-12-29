import React, { useState } from "react";

interface Props {
  onAsk: (q: string) => void;
  disabled?: boolean;
}

export const QuestionForm: React.FC<Props> = ({ onAsk, disabled }) => {
  const [q, setQ] = useState("");
  return (
    <form onSubmit={e => { e.preventDefault(); if (q.trim()) onAsk(q.trim()); }}>
      <input
        type="text"
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Ask about the lore..."
        style={{ width:"300px", padding:"8px" }}
        disabled={disabled}
      />
      <button type="submit" disabled={disabled || !q.trim()} style={{ marginLeft:"8px" }}>
        Ask
      </button>
    </form>
  );
};