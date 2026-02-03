import { GoogleGenAI, Type } from "@google/genai";
import { AgentReport, NewsSource, StreamUpdate } from "../types";

// Declare process to satisfy TypeScript compiler
declare const process: {
  env: {
    API_KEY?: string;
  }
};

// Helper to safely extract the JSON object
const cleanJsonString = (text: string): string => {
  const startIndex = text.indexOf('{');
  const endIndex = text.lastIndexOf('}');
  
  if (startIndex === -1 || endIndex === -1) {
    return text.replace(/```json/g, '').replace(/```/g, '').trim();
  }
  return text.substring(startIndex, endIndex + 1);
};

// Helper to extract sources
const extractSources = (response: any): NewsSource[] => {
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const sources: NewsSource[] = [];

  chunks.forEach((chunk: any) => {
    if (chunk.web) {
      sources.push({
        title: chunk.web.title || "News Source",
        uri: chunk.web.uri,
      });
    }
  });
  return sources;
};

// Lazy initialization of the AI client
const getAiClient = () => {
  // Vite replaces process.env.API_KEY with the actual string during build.
  // We access it directly to ensure the replacement happens.
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.warn("API_KEY is missing. Please check your Vercel environment variables.");
    throw new Error("API_KEY configuration missing.");
  }
  
  return new GoogleGenAI({ apiKey });
};

export const generateNewsReport = async (
  onProgress: (update: StreamUpdate) => void
): Promise<AgentReport> => {
  try {
    const ai = getAiClient();
    
    const today = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });
    
    const model = "gemini-3-flash-preview";

    // --- STEP 1: DISCOVERY (Key Facts, Tweet & Sources) ---
    
    const discoverySchema = {
      type: Type.OBJECT,
      properties: {
        germanSubject: { type: Type.STRING, description: "Neutral German subject line." },
        keyFacts: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "5-7 strictly factual bullet points in German." 
        },
        tweet: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING, description: "The exact content of the tweet." },
            url: { type: Type.STRING, description: "The specific URL to the tweet status (must contain /status/). If specific URL is not found, use https://x.com/elonmusk" },
            date: { type: Type.STRING, description: "Rough relative time, e.g. '2h ago'." }
          },
          required: ["text", "url", "date"],
          description: "One significant recent tweet from @elonmusk."
        }
      },
      required: ["germanSubject", "keyFacts", "tweet"],
    };

    const discoveryPrompt = `Current Date: ${today}
    
    TASK: Fast Discovery of Elon Musk News (Last 48h).
    
    1. **Search**: Find the absolute latest breaking news about Elon Musk, Tesla, SpaceX, X.
    2. **TWEET**: Find the most significant or discussed tweet posted by @elonmusk in the last 48 hours. If multiple exist, pick the most relevant one. Return its text and TRY HARD to find the specific link (ending in /status/123...).
    3. **Filter**: Select the 5-7 most important facts.
    4. **Output**: Return the facts, the tweet, and a subject line in German.
    
    Strictly neutral. Focus on international accuracy, prioritize German context if available.`;

    const discoveryResponse = await ai.models.generateContent({
      model: model,
      contents: discoveryPrompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: discoverySchema,
      },
    });

    const discoveryText = discoveryResponse.text;
    if (!discoveryText) throw new Error("No response from Step 1");

    let discoveryData;
    try {
      discoveryData = JSON.parse(cleanJsonString(discoveryText));
    } catch (e) {
      throw new Error("Failed to parse Discovery JSON");
    }

    const sourcesStep1 = extractSources(discoveryResponse);

    // EMIT STEP 1 DATA
    onProgress({
      stage: 'WRITING', // Moving to writing stage, but data is ready
      partialReport: {
        generatedAt: new Date().toISOString(),
        germanSubject: discoveryData.germanSubject,
        keyFacts: discoveryData.keyFacts,
        germanBody: "", // Not ready yet
        sources: sourcesStep1,
        tweet: discoveryData.tweet,
      }
    });

    // --- STEP 2: WRITING (Detailed Body) ---
    // Uses the facts from Step 1 to write a detailed report.
    
    const writingSchema = {
      type: Type.OBJECT,
      properties: {
        germanBody: {
          type: Type.STRING,
          description: "A comprehensive, neutral German summary. Use Markdown headings.",
        },
      },
      required: ["germanBody"],
    };

    const writingPrompt = `Current Date: ${today}
    
    TASK: Write a detailed Daily Briefing based on these Key Facts and this Tweet:
    Facts: ${JSON.stringify(discoveryData.keyFacts)}
    Tweet: ${JSON.stringify(discoveryData.tweet)}
    
    Requirements:
    - Search for additional details if necessary to make the report comprehensive.
    - Structure:
        1. 🚨 **Highlights**: 1 sentence on the biggest story.
        2. 🧍 **Privat & Unterwegs**: Location and personal updates.
        3. 🚀 **Unternehmen & Projekte**: Company news.
        4. 📱 **Auf X (Twitter)**: Mention the tweet and context.
    - Tone: Professional, Neutral, German.
    `;

    const writingResponse = await ai.models.generateContent({
      model: model,
      contents: writingPrompt,
      config: {
        tools: [{ googleSearch: {} }], // Allow search for details
        responseMimeType: "application/json",
        responseSchema: writingSchema,
      },
    });

    const writingText = writingResponse.text;
    if (!writingText) throw new Error("No response from Step 2");

    let writingData;
    try {
      writingData = JSON.parse(cleanJsonString(writingText));
    } catch (e) {
      throw new Error("Failed to parse Writing JSON");
    }

    const sourcesStep2 = extractSources(writingResponse);
    
    // Merge and Deduplicate Sources
    const allSources = [...sourcesStep1, ...sourcesStep2];
    const uniqueSources = allSources.filter((v, i, a) => a.findIndex(t => (t.uri === v.uri)) === i).slice(0, 15);

    const finalReport: AgentReport = {
      generatedAt: new Date().toISOString(),
      germanSubject: discoveryData.germanSubject,
      germanBody: writingData.germanBody,
      keyFacts: discoveryData.keyFacts,
      sources: uniqueSources,
      tweet: discoveryData.tweet,
    };

    return finalReport;

  } catch (error) {
    console.error("Error generating news report:", error);
    throw error;
  }
};