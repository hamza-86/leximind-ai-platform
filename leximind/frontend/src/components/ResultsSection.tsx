"use client";
// src/components/ResultsSection.tsx
import { useState } from "react";
import type { SearchResult, AnalyzeResponse } from "@/types";
import ResultCard from "./ResultCard";
import CaseModal from "./CaseModal";

interface Props {
  data: AnalyzeResponse;
}

export default function ResultsSection({ data }: Props) {
  const [sortType, setSortType] = useState("similarity-desc");
  const [filterMin, setFilterMin] = useState(0);
  const [selectedCase, setSelectedCase] = useState<SearchResult | null>(null);

  const sorted = [...data.results]
    .filter(r => r.score >= filterMin)
    .sort((a, b) => {
      switch (sortType) {
        case "similarity-desc": return b.score - a.score;
        case "similarity-asc": return a.score - b.score;
        case "name-asc": return a.case.localeCompare(b.case);
        case "name-desc": return b.case.localeCompare(a.case);
        default: return 0;
      }
    })
    .map((r, i) => ({ ...r, rank: i + 1 }));

  return (
    <>
      {/* Category */}
      <div id="category-result" style={{ background: "var(--success-bg)", border: "1px solid var(--success-border)", borderRadius: 12, padding: 24, marginBottom: 25 }}>
        <h3 style={{ fontSize: "1.3rem", fontWeight: 600, marginBottom: 12, color: "var(--text-color)" }}>🏷️ Predicted Category</h3>
        <p style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--success-color)", margin: 0 }}>{data.category}</p>
      </div>

      {/* Results */}
      <div id="search-results" style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: 16, padding: 30, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg, var(--primary-accent), var(--secondary-accent))" }} />

        <div style={{ display: "flex", alignItems: "center", marginBottom: 25 }}>
          <div style={{ width: 48, height: 48, background: "linear-gradient(135deg, var(--primary-accent), var(--secondary-accent))", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginRight: 16 }}>
            <span style={{ fontSize: "1.3rem", color: "white" }}>🔍</span>
          </div>
          <div>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 4, color: "var(--text-color)" }}>Similar Cases Found</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>AI-powered semantic search results</p>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--primary-accent)" }}>{sorted.length}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 500 }}>matches</div>
          </div>
        </div>

        {/* Sort/Filter controls */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <select
            id="sort-select"
            value={sortType}
            onChange={e => setSortType(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--card-bg)", color: "var(--text-color)", fontSize: "0.9rem" }}
          >
            <option value="similarity-desc">Similarity ↓</option>
            <option value="similarity-asc">Similarity ↑</option>
            <option value="name-asc">Name A–Z</option>
            <option value="name-desc">Name Z–A</option>
          </select>
          <select
            id="filter-select"
            value={filterMin}
            onChange={e => setFilterMin(parseFloat(e.target.value))}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--card-bg)", color: "var(--text-color)", fontSize: "0.9rem" }}
          >
            <option value={0}>All scores</option>
            <option value={0.5}>≥ 50%</option>
            <option value={0.7}>≥ 70%</option>
            <option value={0.85}>≥ 85%</option>
          </select>
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", alignSelf: "center" }}>
            Showing <strong>{sorted.length}</strong> of <strong>{data.results.length}</strong>
          </span>
        </div>

        <div style={{ display: "grid", gap: 20 }}>
          {sorted.length === 0 ? (
            <div id="no-results" style={{ textAlign: "center", padding: 40, color: "var(--text-secondary)" }}>
              No results match your current filter.
            </div>
          ) : (
            sorted.map((r) => (
              <ResultCard key={r.case + r.rank} result={r} onViewDetails={setSelectedCase} />
            ))
          )}
        </div>
      </div>


      {/* Modal */}
      <CaseModal result={selectedCase} onClose={() => setSelectedCase(null)} />
    </>
  );
}
