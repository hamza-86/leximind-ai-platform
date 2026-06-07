"use client";
// src/components/ResultCard.tsx
import { useEffect, useRef, useState } from "react";
import type { SearchResult } from "@/types";

interface Props {
  result: SearchResult;
  onViewDetails: (result: SearchResult) => void;
}

export default function ResultCard({ result, onViewDetails }: Props) {
  const barRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [showExpand, setShowExpand] = useState(false);
  const previewRef = useRef<HTMLParagraphElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Animate similarity bar on mount
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (barRef.current) {
        barRef.current.style.width = `${Math.round(result.score * 100)}%`;
      }
    }, result.rank * 100);
    return () => clearTimeout(timeout);
  }, [result.score, result.rank]);

  // Check if expand button should show
  useEffect(() => {
    const check = () => {
      if (previewRef.current && containerRef.current) {
        if (previewRef.current.scrollHeight > containerRef.current.clientHeight + 10) {
          setShowExpand(true);
        }
      }
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const keywords = ["court", "judgment", "appeal", "petition", "application", "order", "decree", "suit", "case", "law", "act", "section", "article"];
  const highlightText = (text: string) => {
    let result_text = text;
    keywords.forEach(kw => {
      result_text = result_text.replace(new RegExp(`\\b${kw}\\b`, "gi"), `<span class="highlight-keyword">${kw}</span>`);
    });
    return result_text;
  };

  return (
    <div
      style={{ background: "var(--bg-color)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 24, transition: "all 0.3s ease", position: "relative", overflow: "hidden" }}
      onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)"; (e.currentTarget as HTMLDivElement).style.borderColor = "var(--primary-accent)"; }}
      onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-color)"; }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ width: 40, height: 40, background: "linear-gradient(135deg, var(--primary-accent), var(--secondary-accent))", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginRight: 14, flexShrink: 0 }}>
          <span style={{ fontSize: "1.2rem" }}>📄</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4
            className="case-title"
            style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 8, color: "var(--text-color)", lineHeight: 1.3, wordWrap: "break-word", cursor: "pointer" }}
            onMouseOver={e => (e.currentTarget.style.color = "var(--primary-accent)")}
            onMouseOut={e => (e.currentTarget.style.color = "var(--text-color)")}
            onClick={() => onViewDetails(result)}
          >
            {result.case}
          </h4>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-secondary)" }}>Similarity:</span>
              <span style={{ fontWeight: 700, color: "var(--primary-accent)" }}>{(result.score * 100).toFixed(1)}%</span>
            </div>
            <div style={{ flex: 1, height: 6, background: "var(--border-color)", borderRadius: 3, overflow: "hidden" }}>
              <div
                ref={barRef}
                style={{ height: "100%", background: "linear-gradient(90deg, var(--primary-accent), var(--secondary-accent))", borderRadius: 3, width: "0%", transition: "width 1s ease" }}
              />
            </div>
          </div>
        </div>
        <button
          className="view-details-btn"
          onClick={() => onViewDetails(result)}
          style={{ background: "linear-gradient(135deg, var(--primary-accent), var(--secondary-accent))", color: "white", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", flexShrink: 0 }}
        >
          📄 View Details
        </button>
      </div>

      <div style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: 8, padding: 16, position: "relative" }}>
        <div
          ref={containerRef}
          style={{ maxHeight: expanded ? 500 : 120, overflow: "hidden", transition: "max-height 0.3s ease", position: "relative" }}
        >
          <p
            ref={previewRef}
            style={{ color: "var(--text-secondary)", lineHeight: 1.6, margin: 0, fontSize: "0.95rem", wordWrap: "break-word" }}
            dangerouslySetInnerHTML={{ __html: highlightText(result.preview + "...") }}
          />
          {!expanded && showExpand && (
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 30, background: "linear-gradient(to top, var(--card-bg), transparent)", pointerEvents: "none" }} />
          )}
        </div>
        {showExpand && (
          <button
            className="expand-btn"
            onClick={() => setExpanded(p => !p)}
            style={{ background: "linear-gradient(135deg, var(--primary-accent), var(--secondary-accent))", color: "white", border: "none", borderRadius: 6, padding: "6px 12px", fontSize: "0.8rem", fontWeight: 500, cursor: "pointer", marginTop: 8 }}
          >
            {expanded ? "Show Less ▲" : "Show More ▼"}
          </button>
        )}
      </div>
    </div>
  );
}
