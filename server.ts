import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { GroundingSource } from "./types";

let aiInstance: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY environment variable is missing. Please set your Gemini API key in the AI Studio settings or host environment variables."
      );
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

// Helper to extract sources from Gemini response
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

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support higher payloads for DNA data and image uploads
  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ limit: "15mb", extended: true }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "KinSeeker Server is healthy." });
  });

  // 1. Search Archives Route
  app.post("/api/search-archives", async (req, res) => {
    try {
      const { keyword, filters } = req.body;
      if (!keyword) {
        return res.status(400).json({ error: "Keyword is required." });
      }
      
      const ai = getAiClient();
      const filterContext = `
        Focus search on these specific record types: ${(filters?.recordType || []).join(', ')}.
        ${filters?.location ? `Geographic focus: ${filters.location}.` : ''}
        ${filters?.dateRange ? `Time period: ${filters.dateRange}.` : ''}
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
          thinkingConfig: { thinkingBudget: 0 }
        },
      });

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      let closed = false;
      req.on('close', () => { closed = true; });

      let fullResponse: any = null;
      for await (const chunk of responseStream) {
        if (closed) break;
        const text = chunk.text;
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
        fullResponse = chunk;
      }

      if (!closed) {
        const sources = extractSources(fullResponse?.candidates?.[0]);
        res.write(`data: ${JSON.stringify({ done: true, sources })}\n\n`);
        res.end();
      }
    } catch (error: any) {
      console.error("Error in search-archives:", error);
      res.status(500).json({ error: error.message || "An error occurred during search." });
    }
  });

  // 2. Genetic Analysis Route
  app.post("/api/genetic-analysis", async (req, res) => {
    try {
      const { snpData } = req.body;
      if (!snpData) {
        return res.status(400).json({ error: "SNP data is required." });
      }

      const ai = getAiClient();
      const responseStream = await ai.models.generateContentStream({
        model: "gemini-3.1-pro-preview",
        contents: `Analyze the following raw SNP/Genetic markers for biological insights, focusing on:
        1. Possible intersex-related markers or conditions (e.g., Klinefelter, Turner, AIS).
        2. Rare hereditary mutations or health markers that might have been hidden.
        3. Reputable biological links to ancestry or biological heritage.
        Markers: ${snpData.substring(0, 50000)}
        
        IMPORTANT: Frame the response as helpful, educational, and grounded in research. Explicitly point out any findings related to intersex or rare mutations. Mention professional genetic counseling.`,
        config: {
          tools: [{ googleSearch: {} }],
          temperature: 0.1,
        },
      });

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      let closed = false;
      req.on('close', () => { closed = true; });

      let fullResponse: any = null;
      for await (const chunk of responseStream) {
        if (closed) break;
        const text = chunk.text;
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
        fullResponse = chunk;
      }

      if (!closed) {
        const sources = extractSources(fullResponse?.candidates?.[0]);
        res.write(`data: ${JSON.stringify({ done: true, sources })}\n\n`);
        res.end();
      }
    } catch (error: any) {
      console.error("Error in genetic-analysis:", error);
      res.status(500).json({ error: error.message || "An error occurred during genetic analysis." });
    }
  });

  // 3. Paternity Analysis Route
  app.post("/api/paternity-analysis", async (req, res) => {
    try {
      const { data } = req.body;
      if (!data) {
        return res.status(400).json({ error: "Paternity parameters are required." });
      }

      const ai = getAiClient();
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

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      let closed = false;
      req.on('close', () => { closed = true; });

      let fullResponse: any = null;
      for await (const chunk of responseStream) {
        if (closed) break;
        const text = chunk.text;
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
        fullResponse = chunk;
      }

      if (!closed) {
        const sources = extractSources(fullResponse?.candidates?.[0]);
        res.write(`data: ${JSON.stringify({ done: true, sources })}\n\n`);
        res.end();
      }
    } catch (error: any) {
      console.error("Error in paternity-analysis:", error);
      res.status(500).json({ error: error.message || "An error occurred during paternity analysis." });
    }
  });

  // 4. Age Progression Records Route
  app.post("/api/age-progression", async (req, res) => {
    try {
      const { query } = req.body;
      if (!query) {
        return res.status(400).json({ error: "Query is required." });
      }

      const ai = getAiClient();
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

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      let closed = false;
      req.on('close', () => { closed = true; });

      let fullResponse: any = null;
      for await (const chunk of responseStream) {
        if (closed) break;
        const text = chunk.text;
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
        fullResponse = chunk;
      }

      if (!closed) {
        const sources = extractSources(fullResponse?.candidates?.[0]);
        res.write(`data: ${JSON.stringify({ done: true, sources })}\n\n`);
        res.end();
      }
    } catch (error: any) {
      console.error("Error in age-progression:", error);
      res.status(500).json({ error: error.message || "An error occurred during age progression search." });
    }
  });

  // 5. Photo Comparison Route
  app.post("/api/photo-comparison", async (req, res) => {
    try {
      const { imageBase64, mimeType } = req.body;
      if (!imageBase64 || !mimeType) {
        return res.status(400).json({ error: "Image data and mime type are required." });
      }

      const ai = getAiClient();
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

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      let closed = false;
      req.on('close', () => { closed = true; });

      let fullResponse: any = null;
      for await (const chunk of responseStream) {
        if (closed) break;
        const text = chunk.text;
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
        fullResponse = chunk;
      }

      if (!closed) {
        const sources = extractSources(fullResponse?.candidates?.[0]);
        res.write(`data: ${JSON.stringify({ done: true, sources })}\n\n`);
        res.end();
      }
    } catch (error: any) {
      console.error("Error in photo-comparison:", error);
      res.status(500).json({ error: error.message || "An error occurred during photo comparison." });
    }
  });

  // 6. Question Probability Route
  app.post("/api/question-probability", async (req, res) => {
    try {
      const { userQuestion } = req.body;
      if (!userQuestion) {
        return res.status(400).json({ error: "Question is required." });
      }

      const ai = getAiClient();
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
      res.json({ ...result, sources: extractSources(response.candidates?.[0]) });
    } catch (error: any) {
      console.error("Error in question-probability:", error);
      res.status(500).json({ error: error.message || "Failed to process the question probability analysis." });
    }
  });

  // Vite development server / production static asset handler
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT} with NODE_ENV=${process.env.NODE_ENV}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
});
