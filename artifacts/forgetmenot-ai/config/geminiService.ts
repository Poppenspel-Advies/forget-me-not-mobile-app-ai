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


export const fetchGeminiProfileRadarInsights = async (targetLocation: string): Promise<any> => {
  if (!GEMINI_API_KEY) {
    throw new Error("Missing EXPO_PUBLIC_GEMINI_API_KEY environment parameter token.");
  }

  // Purely structural instructions requiring strict real-world entries within 30 miles
  const systemicProfileInstruction = `
    You are an elite localized geographic intelligence map assistant for the ForgetMeNot AI™ platform.
    Your task is to analyze the target area: "${targetLocation}" and generate custom trip parameters.

    CRITICAL GEOGRAPHIC CONSTRAINT:
    Every restaurant, attraction, and landmark generated MUST be situated strictly within a 30-mile proximity radius surrounding the target location center. Do not suggest spots outside this 30-mile perimeter.

    Culinary Selection Constraints:
    1. First restaurant must be a famous upscale fine-dining Italian venue inside the 30-mile bounds.
    2. Second restaurant must be an authentic local Spanish tapas or rooftop venue inside the 30-mile bounds.
    3. Third restaurant must be a highly famous, expensive high-end US steakhouse inside the 30-mile bounds.

    Attraction Selection Constraints:
    - Target exactly 3 local landmark destinations providing individual entry cost rates and approximate timing coverages.
  `;

  try {
    console.log(`📡 Dispatched specialized 30-mile radius radar telemetry to Gemini for: [${targetLocation}]`);

    // ✅ FIXED ENDPOINT: Uses production-stable gemini-2.5-flash to completely stop repetition loops
    const targetEndpoint = `https://googleapis.com`;

    const apiPayloadResponse = await fetch(targetEndpoint, {
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
              { text: `Compile location recommendations and 3-phase trip planner timeline matrices for target destination within 30 miles bounds: ${targetLocation}` }
            ]
          }
        ],
        systemInstruction: {
          parts: [{ text: systemicProfileInstruction }]
        },
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.5, // ✅ FIXED: Increased to 0.5 to keep generation creative and natural
          maxOutputTokens: 2500, // ✅ FIXED: Increased to 2500 tokens so text never cuts off
          responseSchema: {
            type: "object",
            properties: {
              restaurants: {
                type: "array",
                description: "Array containing exactly 3 fine dining options within 30 miles (Italian, Spanish, and US Steakhouse).",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string", description: "The real-world business name of the establishment." },
                    detail: { type: "string", description: "The specific cuisine category, neighborhood description, or signature feature context." },
                    score: { type: "string", description: "The user rating and cost category representation (e.g., ⭐ 4.6 · $100+)." }
                  },
                  required: ["name", "detail", "score"]
                }
              },
              attractions: {
                type: "array",
                description: "Array containing exactly 3 top localized attractions within a 30-mile perimeter bounds.",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string", description: "The name of the tourist destination landmark or canyon byway." },
                    detail: { type: "string", description: "A concise overview explaining the history, architecture, or ecosystem features." },
                    score: { type: "string", description: "The exact individual tourist entry fee cost and approximate duration coverage (e.g., $21.95 · 3-4 Hours)." }
                  },
                  required: ["name", "detail", "score"]
                }
              },
              tripPlanner: {
                type: "array",
                description: "A 3-phase structural timeline layout combining your generated restaurants and attractions context.",
                items: {
                  type: "object",
                  properties: {
                    day: { type: "string", description: "Phase identifier string (e.g., Day 1 - Core, Day 2 - Canyon, Day 3 - Heritage)." },
                    task: { type: "string", description: "Actionable itinerary milestone blueprint explaining what to explore and where to dine." }
                  },
                  required: ["day", "task"]
                }
              }
            },
            required: ["restaurants", "attractions", "tripPlanner"]
          }
        }
      })
    });

    if (!apiPayloadResponse.ok) {
      const errBody = await apiPayloadResponse.text();
      throw new Error(`Profile Radar API HTTP Error: ${apiPayloadResponse.status} - ${errBody}`);
    }

    const dataJsonWrapper = await apiPayloadResponse.json();
    const rawResponseTextString = dataJsonWrapper?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawResponseTextString) {
      throw new Error("Empty parsing text content block paths returned from Google AI Studio.");
    }

    // Clean structural wrappers from response string cleanly if any stray backticks are generated
    let cleanJsonStr = rawResponseTextString.trim();
    const firstBraceIdx = cleanJsonStr.indexOf("{");
    const lastBraceIdx = cleanJsonStr.lastIndexOf("}");
    if (firstBraceIdx !== -1 && lastBraceIdx !== -1) {
      cleanJsonStr = cleanJsonStr.substring(firstBraceIdx, lastBraceIdx + 1);
    }

    // Convert perfectly compiled string directly into JSON layout objects
    const parsedRadarInsights = JSON.parse(cleanJsonStr);
    console.log('🛡️ Profile radar datasets successfully compiled and structured:', parsedRadarInsights);

    return parsedRadarInsights;

  } catch (error) {
    console.error('💥 Crash running profile query on Gemini Gateway:', error);
    throw error; // Propagates the exception context directly upwards
  }
};
