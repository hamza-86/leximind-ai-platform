"use client";
// src/components/Chatbot.tsx
import { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "@/services/api";
import type { SearchResult, ContextChunk } from "@/types";

interface Message {
  role: "bot" | "user";
  content: string;
}

interface Props {
  results: SearchResult[];
  originalDocument: string | null;
}

export default function Chatbot({ results, originalDocument }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      content: "Hi! I'm your LexiMind Assistant 🤖. Ask me anything about your document.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiQuotaExceeded, setApiQuotaExceeded] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getContextChunks = (): ContextChunk[] => {
    const chunks: ContextChunk[] = [];
    
    // First priority: original uploaded document
    if (originalDocument && originalDocument.trim().length > 0) {
      chunks.push({
        case: "Your Uploaded Document",
        preview: originalDocument.substring(0, 1000) + (originalDocument.length > 1000 ? "..." : ""),
        full_text: originalDocument,
        score: 1.0,
        rank: 1,
      });
      return chunks;
    }
    
    // Fallback: search result chunks
    if (results && results.length > 0) {
      return results.map((r, index) => ({
        case: r.case,
        preview: r.preview,
        full_text: r.full_text,
        score: r.score,
        rank: r.rank ?? (index + 1),
      }));
    }
    
    return chunks;
  };

  const sendMessage = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setLoading(true);

    try {
      const data = await sendChatMessage({ question: q, context: getContextChunks() });
      if (data.success && data.response) {
        setMessages((prev) => [...prev, { role: "bot", content: data.response! }]);
      } else {
        const errMsg = data.error || "Something went wrong.";
        if (errMsg.toLowerCase().includes("quota")) setApiQuotaExceeded(true);
        setMessages((prev) => [...prev, { role: "bot", content: `❌ ${errMsg}` }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "bot", content: "❌ Failed to connect to the AI service." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestionClick = (suggestionText: string) => {
    setInput(suggestionText);
    inputRef.current?.focus();
  };

  return (
    <>
      {/* Floating Chatbot Toggle Button */}
      {!isOpen && (
        <button
          id="chatbot-toggle-btn"
          onClick={() => setIsOpen(true)}
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            zIndex: 9999,
            background: "linear-gradient(135deg, #8B5CF6, #3B82F6)",
            color: "white",
            border: "none",
            borderRadius: "50%",
            width: 55,
            height: 55,
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.5rem",
            transition: "transform 0.3s ease",
          }}
          title="Open LexiMind Assistant"
        >
          🤖
        </button>
      )}

      {/* Floating Chatbot Panel */}
      <div
        id="chatbot-panel"
        style={{
          position: "fixed",
          bottom: 10,
          right: 0,
          width: 350,
          height: "90vh",
          background: "var(--card-bg)",
          borderLeft: "2px solid var(--border-color)",
          borderTop: "2px solid var(--border-color)",
          borderTopLeftRadius: 16,
          boxShadow: "-4px 0 20px rgba(0,0,0,0.15)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.4s ease-in-out",
          display: "flex",
          flexDirection: "column",
          zIndex: 9998,
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #8B5CF6, #3B82F6)",
            color: "white",
            fontWeight: 700,
            fontSize: "1.1rem",
            padding: "14px 16px",
            borderTopLeftRadius: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>LexiMind Assistant</span>
          <button
            id="chatbot-close-btn"
            onClick={() => setIsOpen(false)}
            style={{
              background: "none",
              border: "none",
              color: "white",
              fontSize: "1.4rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 4,
            }}
          >
            ×
          </button>
        </div>

        {/* Suggested Questions */}
        <div
          id="chat-suggestions"
          style={{
            padding: 12,
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            borderBottom: "1px solid var(--border-color)",
          }}
        >
          <button
            className="chat-suggestion"
            onClick={() => handleSuggestionClick("What does this mean?")}
            style={{
              background: "var(--bg-color)",
              border: "1px solid var(--border-color)",
              borderRadius: 20,
              padding: "6px 12px",
              whiteSpace: "nowrap",
              fontSize: "0.85rem",
              cursor: "pointer",
              color: "var(--text-color)",
              fontFamily: "inherit",
            }}
          >
            What does this mean?
          </button>
          <button
            className="chat-suggestion"
            onClick={() => handleSuggestionClick("Explain this case")}
            style={{
              background: "var(--bg-color)",
              border: "1px solid var(--border-color)",
              borderRadius: 20,
              padding: "6px 12px",
              fontSize: "0.85rem",
              cursor: "pointer",
              color: "var(--text-color)",
              fontFamily: "inherit",
            }}
          >
            Explain this case
          </button>
          <button
            className="chat-suggestion"
            onClick={() => handleSuggestionClick("Explain like I'm not a law student")}
            style={{
              background: "var(--bg-color)",
              border: "1px solid var(--border-color)",
              borderRadius: 20,
              padding: "6px 12px",
              fontSize: "0.85rem",
              cursor: "pointer",
              color: "var(--text-color)",
              fontFamily: "inherit",
            }}
          >
            Explain like I'm not a law student
          </button>
        </div>

        {/* Chat Body */}
        <div
          id="chat-body"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 12,
            background: "var(--bg-color)",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`chat-message ${msg.role === "bot" ? "bot-message" : "user-message"}`}
              style={{
                alignSelf: msg.role === "bot" ? "flex-start" : "flex-end",
                maxWidth: "85%",
                background: msg.role === "bot" ? "linear-gradient(135deg, #8B5CF6, #3B82F6)" : "linear-gradient(135deg, var(--primary-accent), var(--secondary-accent))",
                color: "white",
                padding: "10px 14px",
                borderRadius: 12,
                fontSize: "0.95rem",
                wordBreak: "break-word",
              }}
            >
              {msg.content}
            </div>
          ))}
          {loading && (
            <div
              className="chat-message bot-message"
              style={{
                alignSelf: "flex-start",
                maxWidth: "85%",
                background: "linear-gradient(135deg, #8B5CF6, #3B82F6)",
                color: "white",
                padding: "10px 14px",
                borderRadius: 12,
                fontSize: "0.95rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span>🤖</span>
                <span>Thinking</span>
                <span style={{ animation: "pulse 1s infinite" }}>...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <div
          style={{
            padding: 10,
            display: "flex",
            gap: 8,
            borderTop: "1px solid var(--border-color)",
            background: "var(--card-bg)",
          }}
        >
          <input
            ref={inputRef}
            id="chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your question..."
            style={{
              flex: 1,
              border: "1px solid var(--border-color)",
              borderRadius: 10,
              padding: "8px 12px",
              fontSize: "0.9rem",
              outline: "none",
              background: "var(--bg-color)",
              color: "var(--text-color)",
              fontFamily: "inherit",
            }}
          />
          <button
            id="chat-send-btn"
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            style={{
              background: "linear-gradient(135deg, #8B5CF6, #3B82F6)",
              color: "white",
              border: "none",
              borderRadius: 10,
              padding: "8px 14px",
              fontWeight: 600,
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              opacity: loading || !input.trim() ? 0.7 : 1,
              transition: "opacity 0.2s ease",
            }}
          >
            Send
          </button>
        </div>

        {/* API Status/Quota exceeded warning panel */}
        {apiQuotaExceeded && (
          <div
            id="api-status-notice"
            style={{
              padding: 12,
              background: "rgba(239,68,68,0.1)",
              borderTop: "1px solid rgba(239,68,68,0.2)",
            }}
          >
            <div style={{ fontSize: "0.85rem", color: "#dc2626", marginBottom: 4, fontWeight: 600 }}>
              ⚠️ API Quota Exceeded
            </div>
            <div style={{ fontSize: "0.75rem", color: "#dc2626", lineHeight: 1.4 }}>
              Your Gemini API free tier limit has been reached. Please upgrade to paid plan or try again later.
            </div>
          </div>
        )}
      </div>
    </>
  );
}
