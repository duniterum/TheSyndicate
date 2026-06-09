import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const SummarizeInput = z.object({ text: z.string().min(1) });

/**
 * Example AI server function — one-shot text generation.
 * Copy this pattern for any app-internal AI call (classification,
 * extraction, summarization, etc.).
 */
export const summarizeText = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SummarizeInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(key);
    const { text } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      prompt: `Summarize this in one sentence: ${data.text}`,
    });

    return { summary: text };
  });
