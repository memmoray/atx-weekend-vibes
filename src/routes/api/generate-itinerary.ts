import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const VibeSchema = z.enum(["Chill", "Social", "Wild"]);

const ITINERARY_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["vibe", "stops", "total"],
  properties: {
    vibe: { type: "string", enum: ["Chill", "Social", "Wild"] },
    stops: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["slot", "time", "name", "detail", "price"],
        properties: {
          slot: { type: "string", enum: ["Morning", "Afternoon", "Night"] },
          time: { type: "string" },
          name: { type: "string" },
          detail: { type: "string" },
          price: { type: "integer" },
        },
      },
    },
    total: { type: "integer" },
  },
};

const ResultSchema = z.object({
  vibe: VibeSchema,
  stops: z
    .array(
      z.object({
        slot: z.enum(["Morning", "Afternoon", "Night"]),
        time: z.string(),
        name: z.string(),
        detail: z.string(),
        price: z.number().int().nonnegative(),
      }),
    )
    .length(3),
  total: z.number(),
});

async function readOutputText(body: ReadableStream<Uint8Array>): Promise<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";
    for (const frame of frames) {
      for (const line of frame.split("\n")) {
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (!data || data === "[DONE]") continue;
        try {
          const evt = JSON.parse(data);
          if (evt.type === "response.output_text.delta") text += evt.delta ?? "";
          if (evt.type === "response.failed" || evt.type === "error") {
            throw new Error(evt.response?.error?.message ?? evt.message ?? "AI generation failed");
          }
        } catch (e) {
          if (e instanceof SyntaxError) continue;
          throw e;
        }
      }
    }
  }
  return text;
}

export const Route = createFileRoute("/api/generate-itinerary")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsed = z.object({ vibe: VibeSchema }).safeParse(await request.json().catch(() => null));
        if (!parsed.success) {
          return Response.json({ error: "vibe must be 'Chill', 'Social', or 'Wild'" }, { status: 400 });
        }
        const vibe = parsed.data.vibe;
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return Response.json({ error: "AI is not configured" }, { status: 500 });

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
          method: "POST",
          signal: request.signal,
          headers: {
            "Content-Type": "application/json",
            "Lovable-API-Key": apiKey,
            "X-Lovable-AIG-SDK": "fetch",
          },
          body: JSON.stringify({
            model: "openai/gpt-6-astra",
            stream: true,
            store: false,
            reasoning: { effort: "low" },
            instructions:
              "You curate fun weekend itineraries in Austin, Texas for groups of friends. Use real, well-known Austin venues. Return exactly 3 stops in order: Morning, Afternoon, Night. Times like '9:00 AM'. 'detail' is a short lowercase phrase (max 5 words). 'price' is a whole-dollar micro-pass price between 8 and 75. 'total' is the exact sum of the 3 prices. Vary the picks each time.",
            input: `Vibe: ${vibe}. Create the itinerary.`,
            text: {
              format: { type: "json_schema", name: "itinerary", strict: true, schema: ITINERARY_SCHEMA },
            },
          }),
        });

        if (!upstream.ok || !upstream.body) {
          const status = upstream.status;
          const msg =
            status === 429
              ? "Too many requests — try again in a moment."
              : status === 402
                ? "AI credits are used up for this workspace."
                : "Couldn't generate an itinerary right now.";
          console.error("generate-itinerary upstream", status, await upstream.text().catch(() => ""));
          return Response.json({ error: msg }, { status });
        }

        try {
          const raw = await readOutputText(upstream.body);
          const result = ResultSchema.parse(JSON.parse(raw));
          // Never trust the model's arithmetic — recompute the total.
          result.total = result.stops.reduce((s, x) => s + x.price, 0);
          return Response.json(result, { headers: { "Cache-Control": "no-store" } });
        } catch (e) {
          console.error("generate-itinerary parse", e);
          return Response.json({ error: "The AI returned an invalid itinerary." }, { status: 502 });
        }
      },
    },
  },
});
