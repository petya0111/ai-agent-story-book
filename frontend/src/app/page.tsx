"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import NavBar from "../../components/NavBar";
import welcomeImg from "../../resources/Hail-Battle_01-04_.png";

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

import { chatWithBook } from "../../lib/api";

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<QAHistoryItem[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const router = useRouter();

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
    try {
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn("Failed to save messages to localStorage", e);
    }
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn("Failed to save history to localStorage", e);
    }
  }, [history]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
        } else if (typeof resp === "string") {
          assistantText = resp;
        } else if (resp?.content) {
          assistantText = resp.content;
        } else {
          assistantText = JSON.stringify(resp);
        }
      } catch (parseErr) {
        console.warn("Error parsing assistant response:", parseErr);
        assistantText = "Sorry, I received an unexpected response format.";
      }

      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== tempAssistantId);
        const finalMsg: Message = {
          id: String(Date.now()),
          role: "assistant",
          text: assistantText,
          ts: Date.now(),
        };
        return [...filtered, finalMsg];
      });

      saveQAToHistory(userText, assistantText);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== tempAssistantId);
        const errorMsg: Message = {
          id: String(Date.now()),
          role: "assistant",
          text: `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
          ts: Date.now(),
        };
        return [...filtered, errorMsg];
      });
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function insertHistoryItem(item: QAHistoryItem) {
    appendMessage({ id: String(Date.now()), role: "user", text: item.question, ts: Date.now() });
    appendMessage({ id: String(Date.now()), role: "assistant", text: item.answer, ts: Date.now() });
  }

  function clearHistory() {
    setHistory([]);
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
            {messages.length === 0 && (
              <div className="welcome-section">
                <div className="welcome-hero">
                  <div className="welcome-visual">
                    <img src={welcomeImg} alt="Hale silhouette" className="welcome-image" />
                  </div>
                  <h1 className="welcome-title">
                    <span className="title-line">Welcome to</span>
                    <span className="title-main">Hale's Legacy</span>
                  </h1>
                  <p className="welcome-subtitle">
                    Enter the realm of ancient wisdom and mystical tales. Ask the Oracle, explore the chronicles,
                    and uncover the secrets of Hale, the last descendant.
                  </p>
                  <div className="welcome-features">
                    <div className="feature" onClick={() => router.push('/chronicles')}>
                      <span className="feature-icon">📚</span>
                      <span className="feature-text">Ancient Chronicles</span>
                      <span className="feature-desc">Explore the sacred library</span>
                    </div>
                    <div className="feature" onClick={() => router.push('/oracle')}>
                      <span className="feature-icon">🔮</span>
                      <span className="feature-text">Oracle's Wisdom</span>
                      <span className="feature-desc">Seek mystical guidance</span>
                    </div>
                    <div className="feature" onClick={() => router.push('/tales')}>
                      <span className="feature-icon">⚔️</span>
                      <span className="feature-text">Heroic Tales</span>
                      <span className="feature-desc">Forge legendary heroes</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id} className="chat-message">
                <div className="role">
                  {m.role === "user" ? "Seeker" : "Oracle"} <small className="ts">{m.ts ? new Date(m.ts).toLocaleTimeString() : ""}</small>
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
              placeholder={
                loading
                  ? "The Oracle contemplates..."
                  : "Ask about Hale's story, characters, places, or events... (Enter to send, Shift+Enter for new line)"
              }
              rows={3}
              disabled={loading}
              className="composer-textarea"
            />

            <div className="composer-actions">
              <button className="button" onClick={handleSend} disabled={loading || !input.trim()}>
                {loading ? "Seeking..." : "Ask Oracle"}
              </button>
              {loading && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div className="spinner" aria-hidden />
                  <small>The Oracle speaks...</small>
                </div>
              )}
              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                <button className="button" onClick={clearChat} disabled={loading}>
                  Clear Chronicle
                </button>
              </div>
            </div>

            <div className="history-panel">
              <div className="history-header">
                <h3>Ancient Scrolls</h3>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="button" onClick={clearHistory} disabled={loading || history.length === 0}>
                    Clear Scrolls
                  </button>
                </div>
              </div>

              <div className="history-list">
                {history.length === 0 && <div className="no-history">No ancient wisdom recorded yet...</div>}
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
                        Recall Wisdom
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