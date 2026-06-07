// src/types/index.ts
export interface SearchResult {
  case: string;
  score: number;
  rank: number;
  preview: string;
  full_text: string;
}

export interface AnalyzeResponse {
  category: string;
  results: SearchResult[];
  original_document: string | null;
}

export interface ContextChunk {
  case: string;
  preview: string;
  full_text: string;
  score: number;
  rank: number;
}

export interface ChatRequest {
  question: string;
  context: ContextChunk[];
}

export interface ChatResponse {
  success: boolean;
  response?: string;
  sources?: string[];
  error?: string;
}

export interface HealthResponse {
  status: string;
  models_loaded: boolean;
  gemini_ready: boolean;
  message: string;
}
