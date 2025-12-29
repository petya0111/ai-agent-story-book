import { useEffect, useState, useRef } from "react";
import { chatWithBook } from "../lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import NavBar from "../components/NavBar";

type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
  ts?: number;
};

type QAHistoryItem = {
  id: string;
  question: string;
  answer: string;
  ts: number;
};

const MESSAGES_KEY = "book_agent_messages_v1";
const HISTORY_KEY = "book_agent_history_v1";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<QAHistoryItem[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(MESSAGES_KEY);
      if (raw) setMessages(JSON.parse(raw));
    } catch (e) {
      console.warn("Failed to load messages from localStorage", e);
    }
    try {
      const rawH = localStorage.getItem(HISTORY_KEY);
      if (rawH) setHistory(JSON.parse(rawH));
    } catch (e) {
      console.warn("Failed to load history from localStorage", e);
    }

    setTimeout(() => textareaRef.current?.focus(), 120);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    try {
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
    } catch (e) {
      // ignore
    }
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
      // ignore
    }
  }, [history]);

  function appendMessage(m: Message) {
    setMessages((prev) => [...prev, m]);
  }

  function saveQAToHistory(question: string, answer: string) {
    const item: QAHistoryItem = {
      id: String(Date.now()),
      question,
      answer,
      ts: Date.now(),
    };
    setHistory((prev) => [item, ...prev].slice(0, 200));
  }

  async function handleSend() {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    const userMsg: Message = { id: String(Date.now()), role: "user", text: userText, ts: Date.now() };
    appendMessage(userMsg);
    setInput("");
    setLoading(true);

    const tempAssistantId = `temp-${Date.now()}`;
    appendMessage({ id: tempAssistantId, role: "assistant", text: "Assistant is typing...", ts: Date.now() });

    const payload: any = { message: userText };

    try {
      const resp = await chatWithBook(payload);

      let assistantText = "";
      try {
        if (resp?.choices && Array.isArray(resp.choices) && resp.choices[0]?.message?.content) {
          assistantText = resp.choices[0].message.content;
        } else if (resp?.choices && Array.isArray(resp.choices) && resp.choices[0]?.text) {
          assistantText = resp.choices[0].text;
        } else {
          assistantText = JSON.stringify(resp);
        }
      } catch (e) {
        assistantText = JSON.stringify(resp);
      }

      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => m.id !== tempAssistantId);
        return [...withoutTemp, { id: String(Date.now() + 1), role: "assistant", text: assistantText, ts: Date.now() }];
      });

      saveQAToHistory(userText, assistantText);
    } catch (err) {
      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => m.id !== tempAssistantId);
        return [
          ...withoutTemp,
          { id: String(Date.now() + 2), role: "assistant", text: "Error contacting server. Please try again.", ts: Date.now() },
        ];
      });
      console.error(err);
    } finally {
      setLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function insertHistoryItem(h: QAHistoryItem) {
    appendMessage({ id: `q-${h.id}`, role: "user", text: h.question, ts: h.ts });
    appendMessage({ id: `a-${h.id}`, role: "assistant", text: h.answer, ts: h.ts + 1 });
  }

  function clearHistory() {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch (e) {}
  }

  function clearChat() {
    setMessages([]);
    try {
      localStorage.removeItem(MESSAGES_KEY);
    } catch (e) {}
  }

  return (
    <>
      <NavBar />
      <div className="full-chat-root with-nav">
        <div className="full-chat-area">
          {/* Messages panel */}
          <div className="messages-panel" role="log" aria-live="polite">
            {messages.length === 0 && <div className="no-messages">No messages yet — ask your assistant anything.</div>}
            {messages.map((m) => (
              <div key={m.id} className="chat-message">
                <div className="role">
                  {m.role} <small className="ts">{m.ts ? new Date(m.ts).toLocaleTimeString() : ""}</small>
                </div>
                <div className={`message-bubble ${m.role === "assistant" ? "assistant small-answer" : "user"}`}>
                  {m.role === "assistant" ? (
                    <div className="chat-markdown">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                        {m.text}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div style={{ whiteSpace: "pre-wrap" }}>{m.text}</div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Sticky composer */}
          <div className="composer-panel sticky-composer" aria-hidden={false}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={loading ? "Waiting for assistant..." : "Ask a question (Enter to send, Shift+Enter for newline)..."}
              rows={3}
              disabled={loading}
              className="composer-textarea"
            />

            <div className="composer-actions">
              <button className="button" onClick={handleSend} disabled={loading || !input.trim()}>
                {loading ? "Sending..." : "Send"}
              </button>
              {loading && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div className="spinner" aria-hidden />
                  <small>Assistant is typing...</small>
                </div>
              )}
              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                <button className="button" onClick={clearChat} disabled={loading}>
                  Clear Chat
                </button>
              </div>
            </div>

            <div className="history-panel">
              <div className="history-header">
                <h4>Previous Q&A</h4>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="button" onClick={clearHistory} disabled={loading || history.length === 0}>
                    Clear
                  </button>
                </div>
              </div>

              <div className="history-list">
                {history.length === 0 && <div className="no-history">No history yet.</div>}
                {history.map((h) => (
                  <div key={h.id} className="history-item">
                    <div className="history-meta">{new Date(h.ts).toLocaleString()}</div>
                    <div className="history-question">{h.question}</div>
                    <div className="history-answer chat-markdown">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                        {h.answer}
                      </ReactMarkdown>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <button className="button" onClick={() => insertHistoryItem(h)}>
                        Insert into chat
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* end composer */}
        </div>
      </div>
    </>
  );
}