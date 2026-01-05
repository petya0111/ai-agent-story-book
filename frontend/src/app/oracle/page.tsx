"use client";
import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import NavBar from "../../../components/NavBar";
import { chatWithBook, fetchBookDetails } from "../../../lib/api";

type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
  ts?: number;
};

type Book = {
  id: number;
  title: string;
  author?: string;
  pages: number;
};

const ORACLE_MESSAGES_KEY = "oracle_messages_v1";

function OracleContent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  
  const searchParams = useSearchParams();
  const bookId = searchParams.get('bookId');
  const bookTitle = searchParams.get('title');
  const heroContext = searchParams.get('heroContext');

  useEffect(() => {
    // Check if we have hero context from Tales page
    if (heroContext) {
      try {
        const hero = JSON.parse(decodeURIComponent(heroContext));
        const heroWelcomeText = `Welcome, seeker. I am the Oracle, keeper of ancient wisdom and witness to countless tales. I sense a powerful presence... 

**${hero.taleTitle}**

I see before me ${hero.heroName}, a ${hero.heroAge}-year-old ${hero.heroRole}, whose spirit radiates ${hero.heroPersonality}. 

${hero.taleDescription}

The tapestry of fate has brought this hero to my realm. What visions do you seek about ${hero.heroName}'s destiny? What mysteries of their journey shall I unveil?`;
        
        const heroWelcomeMsg: Message = {
          id: `hero-welcome-${Date.now()}`,
          role: 'assistant',
          text: heroWelcomeText,
          ts: Date.now()
        };
        
        // Always start fresh when hero context is provided
        setMessages([heroWelcomeMsg]);
        return;
      } catch (e) {
        console.warn("Failed to parse hero context", e);
      }
    }
    
    // Load existing messages only if no hero context
    try {
      const raw = localStorage.getItem(ORACLE_MESSAGES_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        setMessages(saved);
      } else {
        // Create default welcome message
        const welcomeText = bookTitle 
          ? `Welcome, seeker. I am the Oracle, keeper of ancient wisdom. I sense you wish to explore the mysteries of "${decodeURIComponent(bookTitle)}". What knowledge do you seek?`
          : "Welcome, seeker. I am the Oracle, keeper of ancient wisdom. Ask me about any story, character, or mystical knowledge you wish to uncover.";
        
        const welcomeMsg: Message = {
          id: 'welcome',
          role: 'assistant',
          text: welcomeText,
          ts: Date.now()
        };
        setMessages([welcomeMsg]);
      }
    } catch (e) {
      console.warn("Failed to load messages", e);
    }

    // Load book details if bookId provided
    if (bookId) {
      loadBookDetails(parseInt(bookId));
    }

    setTimeout(() => textareaRef.current?.focus(), 300);
  }, [bookId, bookTitle, heroContext]);

  useEffect(() => {
    try {
      localStorage.setItem(ORACLE_MESSAGES_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn("Failed to save messages", e);
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadBookDetails(id: number) {
    try {
      const book = await fetchBookDetails(id);
      setCurrentBook(book);
    } catch (error) {
      console.error("Failed to load book details:", error);
    }
  }

  function appendMessage(m: Message) {
    setMessages((prev) => [...prev, m]);
  }

  async function handleSend() {
    if (!input.trim() || loading) return;
    
    const userText = input.trim();
    const userMsg: Message = { 
      id: String(Date.now()), 
      role: "user", 
      text: userText, 
      ts: Date.now() 
    };
    
    appendMessage(userMsg);
    setInput("");
    setLoading(true);

    const tempId = `temp-${Date.now()}`;
    appendMessage({ 
      id: tempId, 
      role: "assistant", 
      text: "🔮 The Oracle consults the ancient texts...", 
      ts: Date.now() 
    });

    try {
      const payload: any = { message: userText };
      if (bookId) {
        payload.bookId = parseInt(bookId);
      }
      
      // Add hero context if available
      if (heroContext) {
        try {
          const hero = JSON.parse(decodeURIComponent(heroContext));
          payload.heroContext = `This conversation is about ${hero.taleTitle} featuring ${hero.heroName}, a ${hero.heroAge}-year-old ${hero.heroRole} who is ${hero.heroPersonality}. ${hero.taleDescription}`;
        } catch (e) {
          console.warn("Failed to parse hero context:", e);
        }
      }

      const resp = await chatWithBook(payload);

      let assistantText = "";
      if (resp?.choices && Array.isArray(resp.choices) && resp.choices[0]?.message?.content) {
        assistantText = resp.choices[0].message.content;
      } else if (typeof resp === "string") {
        assistantText = resp;
      } else if (resp?.content) {
        assistantText = resp.content;
      } else {
        assistantText = "The Oracle's vision is unclear. Please try again.";
      }

      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== tempId);
        const finalMsg: Message = {
          id: String(Date.now()),
          role: "assistant",
          text: assistantText,
          ts: Date.now(),
        };
        return [...filtered, finalMsg];
      });

    } catch (error) {
      console.error("Oracle error:", error);
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== tempId);
        const errorMsg: Message = {
          id: String(Date.now()),
          role: "assistant",
          text: `The mystical connection has been severed. ${error instanceof Error ? error.message : "Unknown error occurred"}`,
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

  function clearConversation() {
    setMessages([]);
    try {
      localStorage.removeItem(ORACLE_MESSAGES_KEY);
    } catch (e) {}
  }

  // Dynamic suggested questions based on context
  const getSuggestedQuestions = () => {
    if (heroContext) {
      try {
        const hero = JSON.parse(decodeURIComponent(heroContext));
        return [
          `What challenges will ${hero.heroName} face as a ${hero.heroRole}?`,
          `How do ${hero.heroName}'s traits influence their destiny?`,
          `What is the deeper meaning of ${hero.taleTitle}?`,
          `What lessons can ${hero.heroName} teach us?`,
          `How does ${hero.heroName}'s story connect to the greater tapestry of fate?`
        ];
      } catch (e) {
        // Fallback if hero context parsing fails
        return [
          "What is the meaning behind Hale's journey?",
          "Explain the symbolism of the Path of Thorns",
          "Who was the old woman in the forest?",
          "What lessons did Hale learn about leadership?",
          "Describe the kingdom of Nomed"
        ];
      }
    } else {
      return [
        "What is the meaning behind Hale's journey?",
        "Explain the symbolism of the Path of Thorns", 
        "Who was the old woman in the forest?",
        "What lessons did Hale learn about leadership?",
        "Describe the kingdom of Nomed"
      ];
    }
  };

  const suggestedQuestions = getSuggestedQuestions();

  return (
    <>
      <NavBar />
      <div className="oracle-page">
        <div className="oracle-header">
          <div className="oracle-art">
            <img src="/assets/hair/hair_front_wisps.png" alt="Oracle art" className="oracle-art-img" />
          </div>
          <div className="oracle-title">
            <h1>Oracle's Wisdom</h1>
            {currentBook && (
              <p className="current-book">
                Currently exploring: <span className="book-name">{currentBook.title}</span>
              </p>
            )}
          </div>
          <div className="mystical-fog">
            {Array.from({length: 15}).map((_, i) => (
              <div key={i} className="fog-particle" style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 6}s`,
                animationDuration: `${4 + Math.random() * 6}s`
              }} />
            ))}
          </div>
        </div>

        <div className="oracle-content">
          <div className="conversation-area">
            <div className="messages-container">
              {messages.map((msg) => (
                <div key={msg.id} className={`message ${msg.role}`}>
                  <div className="message-avatar">
                    {msg.role === "user" ? "🧙‍♂️" : "🔮"}
                  </div>
                  <div className="message-content">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeSanitize]}
                    >
                      {msg.text}
                    </ReactMarkdown>
                    {msg.ts && (
                      <div className="message-time">
                        {new Date(msg.ts).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Always show suggested questions, but smaller after first interaction */}
            <div className={`suggested-questions ${messages.length > 1 ? 'compact' : ''}`}>
              <h3>🌟 Seek Wisdom About:</h3>
              <div className="questions-grid">
                {suggestedQuestions.map((question, index) => (
                  <button 
                    key={index} 
                    className="suggestion-btn"
                    onClick={() => setInput(question)}
                    disabled={loading}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            <div className="input-area">
              <div className="input-container">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Speak your question to the Oracle..."
                  disabled={loading}
                  rows={1}
                  style={{ resize: "none", overflow: "hidden" }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = "auto";
                    target.style.height = target.scrollHeight + "px";
                  }}
                />
                <div className="input-actions">
                  <button 
                    onClick={handleSend} 
                    disabled={!input.trim() || loading}
                    className="send-btn"
                  >
                    <span className="send-icon">✨</span>
                    {loading ? "Consulting..." : "Ask Oracle"}
                  </button>
                </div>
              </div>
              
              <div className="conversation-controls">
                <button onClick={clearConversation} className="clear-btn">
                  🗑️ Clear Visions
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function OraclePage() {
  return (
    <Suspense fallback={<div>Loading Oracle...</div>}>
      <OracleContent />
    </Suspense>
  );
}