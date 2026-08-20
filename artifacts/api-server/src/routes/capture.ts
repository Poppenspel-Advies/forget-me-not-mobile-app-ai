import { Router, type IRouter } from "express";
import { z } from "zod";

const router: IRouter = Router();

const captureInputSchema = z.object({
  content: z.string().trim().min(1).max(4000),
  source: z.enum(["note", "photo", "voice"]),
});

const captureAnalysisSchema = z.object({
  signal: z.string().min(1),
  likelyOmission: z.string().min(1),
  explanation: z.string().min(1),
  confidence: z.number().int().min(0).max(100),
  preventiveAction: z.string().min(1),
  category: z.enum(["personal", "practical", "people", "travel", "work", "object", "other"]),
});

const fallbackAnalysis = (content: string, source: "note" | "photo" | "voice") => ({
  signal: content,
  likelyOmission: "Give this signal one small next step",
  explanation: `This ${source} capture is worth keeping visible until it has a clear follow-through.`,
  confidence: 52,
  preventiveAction: "Choose one tiny action you can complete today.",
  category: "other" as const,
});

router.post("/capture/analyze", async (req, res) => {
  const parsed = captureInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Capture content and source are required." });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "Gemini processing is not configured." });
    return;
  }

  const prompt = `You are ForgetMeNot, a personal omission prediction engine. Analyze the user's captured context and return ONLY valid JSON matching this exact shape:
{
  "signal": "short human-readable restatement",
  "likelyOmission": "the specific thing the user may forget",
  "explanation": "one concise sentence explaining the contextual clue",
  "confidence": 0,
  "preventiveAction": "one small concrete action",
  "category": "personal|practical|people|travel|work|object|other"
}

Rules:
- Predict an omission, not a generic reminder.
- Be useful and specific, but do not invent people, dates, places, or facts not in the capture.
- confidence is an integer from 0 to 100.
- Keep every string under 180 characters.
- The capture source is "${parsed.data.source}".

User capture:
${parsed.data.content}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
            maxOutputTokens: 8192,
          },
        }),
      },
    );

    if (!response.ok) {
      res.status(502).json({ error: "Gemini could not analyze this capture." });
      return;
    }

    const payload = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const rawText = payload.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      res.status(502).json({ error: "Gemini returned an empty analysis." });
      return;
    }

    const jsonText = rawText.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    const analysis = captureAnalysisSchema.safeParse(JSON.parse(jsonText));
    if (!analysis.success) {
      res.json(fallbackAnalysis(parsed.data.content, parsed.data.source));
      return;
    }

    res.json(analysis.data);
  } catch {
    res.status(502).json({ error: "Gemini could not analyze this capture." });
  }
});

export default router;