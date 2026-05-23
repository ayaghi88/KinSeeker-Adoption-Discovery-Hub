
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { SearchResult, GroundingSource, SearchFilters, QuestionResult, PaternityResult } from "./types";

const aiClient = (): GoogleGenAI => {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "undefined") {
    throw new Error(
      "Gemini API Key is missing. To fix this, log in to your Netlify dashboard, go to your Site Settings > Build & deploy > Environment variables, add 'GEMINI_API_KEY' with your Google AI Studio API Key, and then redeploy your site. If building via GitHub Actions, add 'GEMINI_API_KEY' as a repository secret."
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Generic helper to extract sources from a response
const extractSources = (candidate: any): GroundingSource[] => {
  const sources: GroundingSource[] = [];
  const chunks = candidate?.groundingMetadata?.groundingChunks;
  if (chunks) {
    chunks.forEach((chunk: any) => {
      if (chunk.web?.uri && chunk.web?.title) {
        sources.push({ title: chunk.web.title, uri: chunk.web.uri });
      }
    });
  }
  return sources;
};

export const streamAdvancedArchivesSearch = async (
  keyword: string, 
  filters: SearchFilters,
  onChunk: (text: string) => void
): Promise<GroundingSource[]> => {
  const ai = aiClient();
  const filterContext = `
    Focus search on these specific record types: ${filters.recordType.join(', ')}.
    ${filters.location ? `Geographic focus: ${filters.location}.` : ''}
    ${filters.dateRange ? `Time period: ${filters.dateRange}.` : ''}
    Special interest: Hard-to-find archived records, children featured in historical commercials/advertisements, and specific orphan asylum ledgers.
  `;

  const responseStream = await ai.models.generateContentStream({
    model: "gemini-3.5-flash",
    contents: `Search for verifiable historical records, archives, and reputable databases regarding: "${keyword}". 
    ${filterContext}
    Provide detailed information and direct links to databases or archival entries.`,
    config: {
      tools: [{ googleSearch: {} }],
      temperature: 0.1,
      thinkingConfig: { thinkingBudget: 0 } // Faster response
    },
  });

  let fullResponse: GenerateContentResponse | null = null;
  for await (const chunk of responseStream) {
    const text = chunk.text;
    if (text) onChunk(text);
    fullResponse = chunk;
  }

  return extractSources(fullResponse?.candidates?.[0]);
};

export const streamGeneticAnalysis = async (
  snpData: string,
  onChunk: (text: string) => void
): Promise<GroundingSource[]> => {
  const ai = aiClient();
  const responseStream = await ai.models.generateContentStream({
    model: "gemini-3.1-pro-preview",
    contents: `Analyze the following raw SNP/Genetic markers for biological insights, focusing on:
    1. Possible intersex-related markers or conditions (e.g., Klinefelter, Turner, AIS).
    2. Rare hereditary mutations or health markers that might have been hidden.
    3. Reputable biological links to ancestry or biological heritage.
    Markers: ${snpData.substring(0, 50000)} // Limit input size for stability
    
    IMPORTANT: Frame the response as helpful, educational, and grounded in research. Explicitly point out any findings related to intersex or rare mutations. Mention professional genetic counseling.`,
    config: {
      tools: [{ googleSearch: {} }],
      temperature: 0.1,
    },
  });

  let fullResponse: GenerateContentResponse | null = null;
  for await (const chunk of responseStream) {
    const text = chunk.text;
    if (text) onChunk(text);
    fullResponse = chunk;
  }

  return extractSources(fullResponse?.candidates?.[0]);
};

export const streamPaternityAnalysis = async (
  data: { userBT: string, p1BT: string, p2BT: string, traits: string },
  onChunk: (text: string) => void
): Promise<GroundingSource[]> => {
  const ai = aiClient();
  const responseStream = await ai.models.generateContentStream({
    model: "gemini-3.5-flash",
    contents: `Analyze the probability of biological paternity based on:
    - User Blood Type: ${data.userBT}
    - Parent 1 Blood Type: ${data.p1BT}
    - Parent 2 Blood Type: ${data.p2BT}
    - Distinct / Dominant Traits: ${data.traits}
    
    Tasks:
    1. Calculate and explain the biological possibility of the user's blood type given the parents' types (using Punnett squares logic).
    2. Analyze the dominant traits (eye color, hair, etc.) for any inconsistencies.
    3. Provide an estimated probability percentage of paternity based solely on blood type, then adjust for traits.
    4. Provide a supportive, factual analysis of whether these markers indicate mistaken paternity or hidden adoption.`,
    config: {
      tools: [{ googleSearch: {} }],
      temperature: 0.1,
      thinkingConfig: { thinkingBudget: 0 }
    },
  });

  let fullResponse: GenerateContentResponse | null = null;
  for await (const chunk of responseStream) {
    const text = chunk.text;
    if (text) onChunk(text);
    fullResponse = chunk;
  }

  return extractSources(fullResponse?.candidates?.[0]);
};

export const streamAgeProgressionRecords = async (
  query: string,
  onChunk: (text: string) => void
): Promise<GroundingSource[]> => {
  const ai = aiClient();
  const responseStream = await ai.models.generateContentStream({
    model: "gemini-3.5-flash",
    contents: `Find reputable missing person databases and archived records that feature age-progression photos for: "${query}". 
    Focus on cases where the person was never found. Look for resources like NCMEC archives, Doe Network, and cold case records.`,
    config: {
      tools: [{ googleSearch: {} }],
      temperature: 0.1,
      thinkingConfig: { thinkingBudget: 0 }
    },
  });

  let fullResponse: GenerateContentResponse | null = null;
  for await (const chunk of responseStream) {
    const text = chunk.text;
    if (text) onChunk(text);
    fullResponse = chunk;
  }

  return extractSources(fullResponse?.candidates?.[0]);
};

export const streamPhotoComparison = async (
  imageBase64: string, 
  mimeType: string,
  onChunk: (text: string) => void
): Promise<GroundingSource[]> => {
  const ai = aiClient();
  const responseStream = await ai.models.generateContentStream({
    model: "gemini-3.5-flash",
    contents: [
      { inlineData: { data: imageBase64, mimeType } },
      { text: `Analyze this image against historical missing persons, age-progression techniques, and archives. Frame this as an 'Identity Comparison Analysis'.` }
    ],
    config: {
      tools: [{ googleSearch: {} }],
      temperature: 0.1,
      thinkingConfig: { thinkingBudget: 0 }
    },
  });

  let fullResponse: GenerateContentResponse | null = null;
  for await (const chunk of responseStream) {
    const text = chunk.text;
    if (text) onChunk(text);
    fullResponse = chunk;
  }

  return extractSources(fullResponse?.candidates?.[0]);
};

export const analyzeQuestionProbability = async (userQuestion: string): Promise<QuestionResult> => {
  const ai = aiClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `You are a researcher for KinSeeker. The user asks: "${userQuestion}". Estimate the percentage of similar cases that led to adoption discovery.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            percentage: { type: Type.NUMBER },
            confidence: { type: Type.STRING }
          },
          required: ["text", "percentage", "confidence"]
        }
      }
    });

    const result = JSON.parse(response.text);
    return { ...result, sources: extractSources(response.candidates?.[0]) };
  } catch (error) {
    console.error("Question analysis failed:", error);
    throw new Error("Failed to process the question probability analysis.");
  }
};
