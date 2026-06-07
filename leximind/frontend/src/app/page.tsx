"use client";
// src/app/page.tsx
import { useState } from "react";
import type { AnalyzeResponse } from "@/types";
import ThemeToggle from "@/components/ThemeToggle";
import AnalyzeForm from "@/components/AnalyzeForm";
import ResultsSection from "@/components/ResultsSection";
import Chatbot from "@/components/Chatbot";

export default function Home() {
  const [data, setData] = useState<AnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleReset = () => {
    setData(null);
    setLoading(false);
  };

  return (
    <>
      {/* Floating Sidebar Toggle Button */}
      <button
        id="sidebar-toggle-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          zIndex: 9999,
          background: "linear-gradient(135deg, var(--primary-accent), var(--secondary-accent))",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: 50,
          height: 50,
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.4rem",
          transform: sidebarOpen ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.3s ease",
        }}
        title="Toggle Info Sidebar"
      >
        ⚖️
      </button>

      {/* Right Sidebar */}
      <div
        id="right-sidebar"
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          width: "25%",
          maxWidth: 300,
          height: "calc(100vh - 160px)",
          background: "var(--card-bg)",
          border: "1px solid var(--border-color)",
          borderRadius: 16,
          boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
          overflowY: "auto",
          padding: 30,
          transition: "transform 0.4s ease, opacity 0.3s ease",
          transform: sidebarOpen ? "translateX(0)" : "translateX(110%)",
          opacity: sidebarOpen ? 1 : 0,
          zIndex: 1000,
          textAlign: "center",
        }}
      >
        <div style={{ flexShrink: 0 }}>
          <div
            style={{
              width: 120,
              height: 120,
              background: "linear-gradient(135deg, var(--primary-accent), var(--secondary-accent))",
              borderRadius: 20,
              margin: "0 auto 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              boxShadow: "0 8px 24px rgba(52, 152, 219, 0.3)",
            }}
          >
            <img
              src="/92-922917_scales-of-justice-symbol-of-indian-judiciary-hd.png"
              alt="Scales of Justice"
              style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 16 }}
            />
          </div>
          <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--text-color)", marginBottom: 15 }}>
            Justice &amp; Law
          </h3>
          <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 20 }}>
            Symbol of fairness, equality, and the Indian judicial system.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-color)", marginBottom: 12 }}>
              AI Features
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border-color)" }}>
                <span style={{ fontSize: "1.2rem", marginRight: 8 }}>📄</span>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>PDF Analysis</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border-color)" }}>
                <span style={{ fontSize: "1.2rem", marginRight: 8 }}>🔍</span>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Semantic Search</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border-color)" }}>
                <span style={{ fontSize: "1.2rem", marginRight: 8 }}>🏷️</span>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Category Classification</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", padding: "8px 0" }}>
                <span style={{ fontSize: "1.2rem", marginRight: 8 }}>⚡</span>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Real-time Processing</span>
              </div>
            </div>
          </div>

          <div style={{ paddingTop: 20, borderTop: "1px solid var(--border-color)" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                background: "var(--success-bg)",
                border: "1px solid var(--success-border)",
                borderRadius: 16,
                padding: "8px 14px",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  background: "var(--success-color)",
                  borderRadius: "50%",
                  marginRight: 6,
                }}
              />
              <span style={{ fontSize: "0.8rem", color: "var(--success-color)", fontWeight: 600 }}>System Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className="main-content-container"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: 20,
          display: "flex",
          gap: 30,
          alignItems: "flex-start",
          marginRight: sidebarOpen ? "320px" : "auto",
          transition: "margin-right 0.4s ease-in-out",
        }}
      >
        <div
          style={{
            flex: 3,
            background: "var(--card-bg)",
            borderRadius: 16,
            padding: 40,
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
            border: "1px solid var(--border-color)",
            position: "relative",
            overflow: "hidden",
            width: "100%",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.03,
              backgroundImage:
                "radial-gradient(circle at 25% 25%, var(--primary-accent) 2px, transparent 2px), radial-gradient(circle at 75% 75%, var(--secondary-accent) 2px, transparent 2px)",
              backgroundSize: "40px 40px",
              pointerEvents: "none",
            }}
          />

          <div style={{ textAlign: "center", marginBottom: 50, position: "relative", zIndex: 2 }}>
            <div style={{ position: "absolute", top: 10, right: 10, zIndex: 20 }}>
              <ThemeToggle />
            </div>

            <h1
              style={{
                fontSize: "3rem",
                fontWeight: 800,
                marginBottom: 15,
                color: "var(--text-color)",
                background: "linear-gradient(135deg, var(--primary-accent), var(--secondary-accent))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              LexiMind
            </h1>
            <p
              style={{
                fontSize: "1.2rem",
                color: "var(--text-secondary)",
                maxWidth: 650,
                margin: "0 auto",
                lineHeight: 1.7,
                fontWeight: 500,
              }}
            >
              Advanced AI-powered legal judgment analysis and case similarity search
            </p>
            <div style={{ marginTop: 25, display: "flex", alignItems: "center", gap: 15, justifyContent: "center" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "var(--success-bg)",
                  border: "1px solid var(--success-border)",
                  borderRadius: 20,
                  padding: "8px 16px",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: 8,
                    height: 8,
                    background: "var(--success-color)",
                    borderRadius: "50%",
                    marginRight: 8,
                  }}
                />
                <span style={{ fontSize: "0.9rem", color: "var(--success-color)", fontWeight: 600 }}>
                  AI Models Active &amp; Ready
                </span>
              </div>
              <button
                onClick={handleReset}
                style={{
                  background: "var(--primary-accent)",
                  color: "white",
                  border: "none",
                  borderRadius: 20,
                  padding: "8px 16px",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                🔄 Reset Page
              </button>
            </div>
          </div>

          <AnalyzeForm onResults={setData} onLoadingChange={setLoading} />

          {/* Custom Hand Loading Animation */}
          <div className={`hand-loading ${loading ? "show" : ""}`}>
            <div className="finger" />
            <div className="finger" />
            <div className="finger" />
            <div className="finger" />
            <div className="palm" />
            <div className="thumb" />
          </div>

          {/* Skeleton Loaders */}
          {loading && (
            <div id="loading-skeleton" style={{ marginTop: 25 }}>
              <div
                style={{
                  background: "var(--success-bg)",
                  border: "1px solid var(--success-border)",
                  borderRadius: 12,
                  padding: 24,
                  marginBottom: 25,
                }}
              >
                <div className="skeleton skeleton-title" style={{ width: "60%" }} />
                <div className="skeleton skeleton-text" style={{ width: "40%" }} />
              </div>

              <div
                style={{
                  background: "var(--card-bg)",
                  border: "1px solid var(--border-color)",
                  borderRadius: 16,
                  padding: 30,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", marginBottom: 25 }}>
                  <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 12, marginRight: 16 }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton skeleton-title" style={{ width: "80%", marginBottom: 8 }} />
                    <div className="skeleton skeleton-text" style={{ width: "60%" }} />
                  </div>
                  <div className="skeleton" style={{ width: 60, height: 40, borderRadius: 8 }} />
                </div>

                <div style={{ display: "grid", gap: 20 }}>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="skeleton skeleton-card">
                      <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 16 }}>
                        <div
                          className="skeleton"
                          style={{ width: 40, height: 40, borderRadius: 10, marginRight: 14, flexShrink: 0 }}
                        />
                        <div style={{ flex: 1 }}>
                          <div className="skeleton skeleton-title" style={{ width: "90%", marginBottom: 12 }} />
                          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                            <div className="skeleton skeleton-text" style={{ width: 120 }} />
                            <div className="skeleton" style={{ flex: 1, height: 6, borderRadius: 3 }} />
                          </div>
                        </div>
                        <div className="skeleton" style={{ width: 100, height: 32, borderRadius: 8 }} />
                      </div>
                      <div className="skeleton skeleton-text" style={{ width: "100%" }} />
                      <div className="skeleton skeleton-text" style={{ width: "85%" }} />
                      <div className="skeleton skeleton-text" style={{ width: "70%" }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Results section */}
          {!loading && data && <ResultsSection data={data} />}
        </div>
      </div>

      {/* Floating Chatbot */}
      <Chatbot results={data?.results ?? []} originalDocument={data?.original_document ?? null} />
    </>
  );
}
