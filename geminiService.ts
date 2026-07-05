import { SearchResult, GroundingSource, SearchFilters, QuestionResult } from "./types";

/**
 * Helper function to handle SSE streaming from the backend.
 * Parses line-by-line data sent from the Express server.
 */
const handleStreamResponse = async (
  url: string,
  body: any,
  onChunk: (text: string) => void
): Promise<GroundingSource[]> => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed request: HTTP ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Response body is not readable");
  }

  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let sources: GroundingSource[] = [];

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (trimmed.startsWith("data: ")) {
        try {
          const parsed = JSON.parse(trimmed.slice(6));
          if (parsed.text) {
            onChunk(parsed.text);
          }
          if (parsed.done && parsed.sources) {
            sources = parsed.sources;
          }
        } catch (e) {
          console.error("Failed to parse stream chunk:", trimmed, e);
        }
      }
    }
  }

  // Parse remaining buffer
  const finalTrimmed = buffer.trim();
  if (finalTrimmed.startsWith("data: ")) {
    try {
      const parsed = JSON.parse(finalTrimmed.slice(6));
      if (parsed.text) {
        onChunk(parsed.text);
      }
      if (parsed.done && parsed.sources) {
        sources = parsed.sources;
      }
    } catch (e) {
      console.error("Failed to parse final stream buffer:", finalTrimmed, e);
    }
  }

  return sources;
};

export const streamAdvancedArchivesSearch = async (
  keyword: string, 
  filters: SearchFilters,
  onChunk: (text: string) => void
): Promise<GroundingSource[]> => {
  return handleStreamResponse("/api/search-archives", { keyword, filters }, onChunk);
};

export const streamGeneticAnalysis = async (
  snpData: string,
  onChunk: (text: string) => void
): Promise<GroundingSource[]> => {
  return handleStreamResponse("/api/genetic-analysis", { snpData }, onChunk);
};

export const streamPaternityAnalysis = async (
  data: { userBT: string, p1BT: string, p2BT: string, traits: string },
  onChunk: (text: string) => void
): Promise<GroundingSource[]> => {
  return handleStreamResponse("/api/paternity-analysis", { data }, onChunk);
};

export const streamAgeProgressionRecords = async (
  query: string,
  onChunk: (text: string) => void
): Promise<GroundingSource[]> => {
  return handleStreamResponse("/api/age-progression", { query }, onChunk);
};

export const streamPhotoComparison = async (
  imageBase64: string, 
  mimeType: string,
  onChunk: (text: string) => void
): Promise<GroundingSource[]> => {
  return handleStreamResponse("/api/photo-comparison", { imageBase64, mimeType }, onChunk);
};

export const analyzeQuestionProbability = async (userQuestion: string): Promise<QuestionResult> => {
  const response = await fetch("/api/question-probability", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userQuestion }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed request: HTTP ${response.status}`);
  }

  return response.json();
};
