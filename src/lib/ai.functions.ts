import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createSyndicateAiGatewayProvider, DEFAULT_AI_GATEWAY_MODEL } from "./ai-gateway.server";

const SummarizeInput = z.object({ text: z.string().min(1) });

/**
 * Example AI server function — one-shot text generation.
 * Copy this pattern for any app-internal AI call (classification,
 * extraction, summarization, etc.).
 */
export const summarizeText = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SummarizeInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.AI_GATEWAY_API_KEY;
    if (!key) throw new Error("Missing AI_GATEWAY_API_KEY");

    const gateway = createSyndicateAiGatewayProvider(key);
    const { text } = await generateText({
      model: gateway(process.env.AI_GATEWAY_MODEL ?? DEFAULT_AI_GATEWAY_MODEL),
      prompt: `Summarize this in one sentence: ${data.text}`,
    });

    return { summary: text };
  });
