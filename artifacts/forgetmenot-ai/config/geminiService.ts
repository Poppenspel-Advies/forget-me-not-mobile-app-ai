import { Platform } from 'react-native';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemma-4-26b-a4b-it:generateContent';

/**
 * 🌟 CORE AI CORE SERVICE PIPELINE: Calls Google AI Studio API and extracts structured JSON
 * @param userPrompt Captured text notes, photo details description, or voice over transcript text string.
 * @param selectedCategory Selected layout choice tab ('people', 'places', 'things', 'practical').
 */
export const fetchGeminiSignalAnalysis = async (userPrompt: string, selectedCategory: string): Promise<any> => {
  if (!GEMINI_API_KEY) {
    throw new Error("Missing EXPO_PUBLIC_GEMINI_API_KEY environment parameter token.");
  }
const safeCategory = (selectedCategory || 'practical').toLowerCase();

  // Instruct Gemini to output ONLY valid JSON matching your exact frontend widget schema parameters
  const systemicSystemInstruction = `
    You are the omission-risk analysis engine for ForgetMeNot AI™.

    Analyze the user's input context and identify ONE primary thing they are most likely to forget.

  Rules:
    - Keep every text string brief, direct, and written in natural, plain English sentences.
    - Do not repeat or parrot the user's input phrase.
    - Do not use hyphenated pseudo-technical jargon chains or sequential word repetitions.
    - "signal": a short risk name, maximum 8 words.
    - "likelyOmission": the target object or action, maximum 8 words.
    - "explanation": a clear contextual reason why they might forget it, maximum 25 words.
    - "preventiveAction": clear step-by-step instructions, maximum 30 words.
    - "confidence": integer from 1 to 100.
    - "category": exactly one of: people, places, things, practical.
  `;


  try {
    console.log(`🔮 Sending telemetry bytes out to Google Gemini REST Gateway API engine... Context Category Scope: [${selectedCategory}]`);

    const apiPayloadResponse = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: `Current User Context Input: "${userPrompt}"\nSelected Category Guideline Preference: ${selectedCategory}` }
            ]
          }
        ],
        systemInstruction: {
          parts: [{ text: systemicSystemInstruction }]
        },
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.4,
          maxOutputTokens: 800,
         // ✅ FIX 1: Tell Gemini to use JSON mode
                  responseMimeType: "application/json",
                  // ✅ FIX 2: Enforce the exact structure at the API schema layer so it cannot output text notes
                   responseSchema: {
                              type: "object",
                              properties: {
                                signal: {
                                  type: "string",
                                  description: "A short phrase describing the risk category. DO NOT use long hyphenated chains."
                                },
                                confidence: {
                                  type: "integer",
                                  description: "An integer between 1 and 100 representing calculated probability."
                                },
                                likelyOmission: {
                                  type: "string",
                                  description: "The specific object or action they might forget."
                                },
                                explanation: {
                                  type: "string",
                                  description: "A concise paragraph detailing why this travel or schedule transition makes them vulnerable. Use natural, plain English sentences. Do not use pseudo-technical jargon or long hyphenated words."
                                },
                                preventiveAction: {
                                  type: "string",
                                  description: "A direct, clear step-by-step instruction script telling them exactly what modification action to execute right now."
                                },
                                category: {
                                  type: "string",
                                  enum: ["people", "places", "things", "practical"],
                                  description: "The closest systemic context scope token, forced to lowercase."
                                }
                              },
                              required: ["signal", "confidence", "likelyOmission", "explanation", "preventiveAction", "category"]
                            }
                        }
              })
            });

    if (!apiPayloadResponse.ok) {
      const errorText = await apiPayloadResponse.text();
      throw new Error(`Gemini Gateway API HTTP Error status code: ${apiPayloadResponse.status} - ${errorText}`);
    }

    const dataJsonWrapper = await apiPayloadResponse.json();

    // Extract the raw text string returned inside Gemini's response contents tree block mapping
    const rawResponseTextString = dataJsonWrapper?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawResponseTextString) {
      throw new Error("Empty parsing text content paths block returned from Google AI Studio.");
    }

    // Convert string data into an actionable runtime JavaScript structural object block
    const parsedGeminiAnalysisObject = JSON.parse(rawResponseTextString.trim());
    console.log('🛡️ Google Gemini Analysis successfully compiled and structured:', parsedGeminiAnalysisObject);

    return parsedGeminiAnalysisObject;

  } catch (error) {
    console.error('💥 Crash running REST API request pipeline loop on Gemini Gateway:', error);
    throw error;
  }
};
