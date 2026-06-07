// src/services/api.ts
import axios from "axios";
import type {
  AnalyzeResponse,
  ChatRequest,
  ChatResponse,
  HealthResponse,
} from "@/types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 120_000, // 2 minutes — models can take time to load
});

// ── Analyze endpoint ──────────────────────────────────────────────────────────
export async function analyzeJudgment(
  formData: FormData
): Promise<AnalyzeResponse> {
  const { data } = await client.post<AnalyzeResponse>("/analyze", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

// ── Chat endpoint ─────────────────────────────────────────────────────────────
export async function sendChatMessage(
  payload: ChatRequest
): Promise<ChatResponse> {
  const { data } = await client.post<ChatResponse>("/chat", payload);
  return data;
}

// ── Health endpoint ───────────────────────────────────────────────────────────
export async function checkHealth(): Promise<HealthResponse> {
  const { data } = await client.get<HealthResponse>("/health");
  return data;
}
