import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import {
  createSyndicateAiGatewayProvider,
  DEFAULT_AI_GATEWAY_MODEL,
  getSyndicateAiGatewayRunId,
  withSyndicateAiGatewayRunIdHeader,
} from "@/lib/ai-gateway.server";

type ChatRequestBody = { messages?: unknown };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as ChatRequestBody;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const key = process.env.AI_GATEWAY_API_KEY;
        if (!key) {
          return new Response("Missing AI_GATEWAY_API_KEY", { status: 500 });
        }

        const initialRunId = getSyndicateAiGatewayRunId(request);
        const gateway = createSyndicateAiGatewayProvider(key, initialRunId);
        const model = gateway(process.env.AI_GATEWAY_MODEL ?? DEFAULT_AI_GATEWAY_MODEL);
        const result = streamText({
          model,
          system:
            "You are a helpful assistant for The Syndicate, a transparent on-chain protocol. " +
            "Answer questions about the protocol, membership, and on-chain activity concisely.",
          messages: await convertToModelMessages(messages as UIMessage[]),
        });

        const response = result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
        });

        return withSyndicateAiGatewayRunIdHeader(response, gateway);
      },
    },
  },
});
