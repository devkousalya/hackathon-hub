import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  imageDataUrl: z
    .string()
    .min(50)
    .max(8_000_000)
    .refine((v) => v.startsWith("data:image/"), "Must be an image data URL"),
  note: z.string().max(500).optional(),
});

export type AnalysisResult = {
  itemName: string;
  category: string;
  material: string;
  conditionLabel: "Like New" | "Light Damage" | "Moderate Damage" | "Heavy Damage" | "Broken";
  conditionScore: number; // 0-100
  bestAction: "reuse" | "recycle" | "donate" | "sell" | "dispose";
  actions: {
    reuse: { possible: boolean; ideas: string[] };
    recycle: { possible: boolean; how: string };
    donate: { possible: boolean; suggestedTo: string[] };
    sell: { possible: boolean; estimatedPriceINR: { min: number; max: number }; reasoning: string };
    dispose: { needed: boolean; how: string };
  };
  summary: string;
};

const schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    itemName: { type: "string" },
    category: { type: "string" },
    material: { type: "string" },
    conditionLabel: {
      type: "string",
      enum: ["Like New", "Light Damage", "Moderate Damage", "Heavy Damage", "Broken"],
    },
    conditionScore: { type: "number" },
    bestAction: {
      type: "string",
      enum: ["reuse", "recycle", "donate", "sell", "dispose"],
    },
    actions: {
      type: "object",
      additionalProperties: false,
      properties: {
        reuse: {
          type: "object",
          additionalProperties: false,
          properties: {
            possible: { type: "boolean" },
            ideas: { type: "array", items: { type: "string" } },
          },
          required: ["possible", "ideas"],
        },
        recycle: {
          type: "object",
          additionalProperties: false,
          properties: {
            possible: { type: "boolean" },
            how: { type: "string" },
          },
          required: ["possible", "how"],
        },
        donate: {
          type: "object",
          additionalProperties: false,
          properties: {
            possible: { type: "boolean" },
            suggestedTo: { type: "array", items: { type: "string" } },
          },
          required: ["possible", "suggestedTo"],
        },
        sell: {
          type: "object",
          additionalProperties: false,
          properties: {
            possible: { type: "boolean" },
            estimatedPriceINR: {
              type: "object",
              additionalProperties: false,
              properties: {
                min: { type: "number" },
                max: { type: "number" },
              },
              required: ["min", "max"],
            },
            reasoning: { type: "string" },
          },
          required: ["possible", "estimatedPriceINR", "reasoning"],
        },
        dispose: {
          type: "object",
          additionalProperties: false,
          properties: {
            needed: { type: "boolean" },
            how: { type: "string" },
          },
          required: ["needed", "how"],
        },
      },
      required: ["reuse", "recycle", "donate", "sell", "dispose"],
    },
    summary: { type: "string" },
  },
  required: [
    "itemName",
    "category",
    "material",
    "conditionLabel",
    "conditionScore",
    "bestAction",
    "actions",
    "summary",
  ],
} as const;

export const analyzeWaste = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<AnalysisResult> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");

    const systemPrompt = `You are ReWaste AI — an expert at looking at photos of household, shop, or institutional waste/unused items and deciding what to do with them.

For any item in the image:
- Identify what it is, material, and physical condition (from the image only).
- Decide if it can be REUSED as-is or repurposed, RECYCLED, DONATED, SOLD second-hand, or must be safely DISPOSED.
- If sellable, estimate a realistic second-hand price range in INR (Indian Rupees) based on the visible condition. Light damage = closer to upper range, heavy damage = closer to lower/zero.
- If donatable, suggest concrete recipient TYPES in India (e.g. "Goonj", "Robin Hood Army", "local orphanage", "government school", "Salvation Army", "scrap dealer / kabadiwala" — pick appropriate ones for the item).
- Pick ONE bestAction (the most impactful/practical option).
- Keep language simple. Summary in 1-2 sentences.

Only respond via the provided tool.`;

    const userText = data.note
      ? `Analyze this item. User note: ${data.note}`
      : "Analyze this item.";

    const body = {
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: userText },
            { type: "image_url", image_url: { url: data.imageDataUrl } },
          ],
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "return_analysis",
            description: "Return the structured waste analysis.",
            parameters: schema,
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "return_analysis" } },
    };

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      if (res.status === 429)
        throw new Error("Rate limit reached. Please wait a moment and try again.");
      if (res.status === 402)
        throw new Error("AI credits exhausted. Please add credits in your workspace.");
      throw new Error(`AI request failed (${res.status}): ${text.slice(0, 300)}`);
    }

    const json = (await res.json()) as {
      choices?: Array<{
        message?: {
          tool_calls?: Array<{ function?: { arguments?: string } }>;
          content?: string;
        };
      }>;
    };

    const argStr = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!argStr) {
      throw new Error("AI did not return a structured result. Please try another photo.");
    }
    const parsed = JSON.parse(argStr) as AnalysisResult;
    return parsed;
  });
