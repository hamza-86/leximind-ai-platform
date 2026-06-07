"use client";
// src/components/AnalyzeForm.tsx
import { useState, useRef } from "react";
import type { AnalyzeResponse } from "@/types";
import { analyzeJudgment } from "@/services/api";

interface Props {
  onResults: (data: AnalyzeResponse) => void;
  onLoadingChange?: (loading: boolean) => void;
}

export default function AnalyzeForm({ onResults, onLoadingChange }: Props) {
  const [textInput, setTextInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const wordCount = textInput.trim() === "" ? 0 : textInput.trim().split(/\s+/).length;
  const isValid = wordCount >= 5 || file !== null;

  const handleFileChange = (f: File | null) => {
    if (!f) return;
    if (f.type !== "application/pdf") { alert("Please select a PDF file only."); return; }
    setFile(f);
    setTextInput("");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files[0]) handleFileChange(e.dataTransfer.files[0]);
  };

  const simulateProgress = () => {
    setProgress(0);
    progressRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) { clearInterval(progressRef.current!); return 90; }
        return p + Math.random() * 15;
      });
    }, 200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);
    if (onLoadingChange) onLoadingChange(true);
    setError(null);
    simulateProgress();

    const fd = new FormData();
    if (file) fd.append("file", file);
    else fd.append("text_input", textInput);

    try {
      const data = await analyzeJudgment(fd);
      setProgress(100);
      onResults(data);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "An error occurred while processing your request.";
      setError(msg);
    } finally {
      clearInterval(progressRef.current!);
      setLoading(false);
      if (onLoadingChange) onLoadingChange(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 40 }}>
      {/* Text Input */}
      <div style={{ marginBottom: 35 }}>
        <label style={{ display: "block", fontSize: "1.3rem", fontWeight: 600, marginBottom: 12, color: "var(--text-color)", alignItems: "center" }}>
          <span style={{ fontSize: "1.5rem", marginRight: 8 }}>📝</span>
          Judgment Text Input
        </label>
        <div style={{ position: "relative" }}>
          <textarea
            name="text_input"
            rows={6}
            value={textInput}
            onChange={(e) => { setTextInput(e.target.value); setFile(null); }}
            style={{ width: "100%", padding: 18, border: "2px solid var(--border-color)", borderRadius: 12, fontSize: "1rem", resize: "vertical", boxSizing: "border-box", background: "var(--card-bg)", color: "var(--text-color)", fontFamily: "inherit", lineHeight: 1.5 }}
            placeholder="Paste your legal judgment text here..."
            onFocus={e => { e.target.style.borderColor = "var(--primary-accent)"; e.target.style.boxShadow = "0 0 0 3px rgba(52,152,219,0.1)"; }}
            onBlur={e => { e.target.style.borderColor = "var(--border-color)"; e.target.style.boxShadow = "none"; }}
          />
          <div style={{ position: "absolute", bottom: 12, right: 12, fontSize: "0.8rem", background: "var(--bg-color)", padding: "4px 8px", borderRadius: 4, border: "1px solid var(--border-color)" }}>
            <span style={{ color: wordCount < 5 && wordCount > 0 ? "#e74c3c" : wordCount >= 5 ? "#27ae60" : "var(--text-secondary)" }}>{wordCount}</span> words
          </div>
        </div>
        {wordCount > 0 && wordCount < 5 && (
          <div style={{ marginTop: 8, fontSize: "0.9rem", color: "#e74c3c" }}>⚠️ Need {5 - wordCount} more word{5 - wordCount === 1 ? "" : "s"} (minimum 5 words)</div>
        )}
        {wordCount >= 5 && <div style={{ marginTop: 8, fontSize: "0.9rem", color: "#27ae60" }}>✅ Sufficient words for analysis</div>}
      </div>

      {/* Divider */}
      <div style={{ textAlign: "center", margin: "30px 0", position: "relative" }}>
        <div style={{ borderTop: "1px solid var(--border-color)", margin: "20px 0" }} />
        <span style={{ background: "var(--card-bg)", padding: "0 20px", fontWeight: "bold", color: "var(--text-secondary)" }}>OR</span>
      </div>

      {/* File Upload */}
      <div style={{ marginBottom: 35 }}>
        <label style={{ display: "block", fontSize: "1.3rem", fontWeight: 600, marginBottom: 12, color: "var(--text-color)" }}>
          <span style={{ fontSize: "1.5rem", marginRight: 8 }}>📄</span>
          Document Upload
        </label>
        <div style={{ position: "relative" }}>
          <input
            ref={fileInputRef}
            type="file"
            name="file"
            accept="application/pdf"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer", zIndex: 2 }}
            onChange={e => handleFileChange(e.target.files?.[0] || null)}
          />
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            style={{ border: `2px dashed ${file ? "var(--success-color)" : "var(--border-color)"}`, borderRadius: 12, padding: 24, background: file ? "linear-gradient(135deg, var(--card-bg), rgba(72,187,120,0.05))" : "var(--card-bg)", textAlign: "center" }}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📄</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 600, color: file ? "var(--success-color)" : "var(--text-color)", marginBottom: 8 }}>
              {file ? `📄 ${file.name.length > 30 ? file.name.substring(0, 27) + "..." : file.name}` : "Choose PDF File"}
            </div>
            <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: 12 }}>Drag &amp; drop or click to browse</div>
            <div style={{ display: "inline-flex", alignItems: "center", background: "var(--bg-color)", border: "1px solid var(--border-color)", borderRadius: 16, padding: "6px 12px" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--text-secondary)" }}>Max: 10 MB • PDF only</span>
            </div>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div style={{ paddingTop: 10 }}>
        <button
          type="submit"
          disabled={!isValid || loading}
          style={{ width: "100%", background: "linear-gradient(135deg, var(--primary-accent), var(--secondary-accent))", color: "white", fontSize: "1.2rem", fontWeight: 700, padding: "18px 24px", border: "none", borderRadius: 12, cursor: isValid && !loading ? "pointer" : "not-allowed", opacity: isValid && !loading ? 1 : 0.6, transition: "all 0.3s ease" }}
        >
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <span style={{ display: "inline-block", width: 20, height: 20, border: "3px solid rgba(255,255,255,0.3)", borderRadius: "50%", borderTopColor: "white", animation: "spin-enhanced 1s ease-in-out infinite" }} />
              Analyzing...
            </span>
          ) : (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <span>Analyze Judgment</span>
              <span style={{ fontSize: "1.2rem" }}>⚡</span>
            </span>
          )}
        </button>

        {/* Progress Bar */}
        {loading && (
          <div style={{ marginTop: 15 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>Processing...</span>
              <span style={{ fontSize: "0.9rem", color: "var(--primary-accent)", fontWeight: 600 }}>{Math.round(progress)}%</span>
            </div>
            <div style={{ width: "100%", height: 4, background: "var(--border-color)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", background: "linear-gradient(90deg, var(--primary-accent), var(--secondary-accent))", borderRadius: 2, width: `${progress}%`, transition: "width 0.3s ease" }} />
            </div>
          </div>
        )}

        {error && (
          <div style={{ marginTop: 15, padding: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, color: "#dc2626", fontSize: "0.9rem" }}>
            {error}
          </div>
        )}
      </div>
    </form>
  );
}
