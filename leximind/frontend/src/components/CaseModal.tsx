"use client";
// src/components/CaseModal.tsx
import { useEffect, useCallback } from "react";
import type { SearchResult } from "@/types";

interface Props {
  result: SearchResult | null;
  onClose: () => void;
}

export default function CaseModal({ result, onClose }: Props) {
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    if (result) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleEscape);
    } else {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEscape);
    }
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [result, handleEscape]);

  const copyContent = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.full_text).then(() => {
      const btn = document.getElementById("modal-copy-btn");
      if (btn) {
        const orig = btn.innerHTML;
        btn.innerHTML = "✅ Copied!";
        setTimeout(() => { btn.innerHTML = orig; }, 2000);
      }
    });
  };

  if (!result) return null;

  return (
    <div
      id="case-modal"
      className="modal-overlay show"
      onClick={onClose}
    >
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 id="modal-case-title" className="modal-title">{result.case}</h3>
          <button id="modal-close" className="modal-close" onClick={onClose} type="button">&times;</button>
        </div>
        <div className="modal-body">
          <div className="case-meta">
            <div className="meta-item">
              <div className="meta-label">Similarity Score</div>
              <div id="modal-similarity" className="meta-value">{(result.score * 100).toFixed(1)}%</div>
            </div>
            <div className="meta-item">
              <div className="meta-label">Rank</div>
              <div id="modal-rank" className="meta-value">#{result.rank}</div>
            </div>
          </div>
          <div id="modal-case-content" className="case-content">{result.full_text}</div>
        </div>
        <div className="modal-actions">
          <button id="modal-copy-btn" className="modal-btn" onClick={copyContent}>📋 Copy Text</button>
          <button id="modal-close-bottom" className="modal-btn primary" onClick={onClose} type="button">Close</button>
        </div>
      </div>
    </div>
  );
}
