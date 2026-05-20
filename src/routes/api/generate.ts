import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { generateText } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway";

export const Route = createFileRoute("/api/generate")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const { prompt } = (await request.json()) as { prompt?: string };
          if (!prompt || typeof prompt !== "string") {
            return new Response("Prompt required", { status: 400 });
          }
          const key = process.env.LOVABLE_API_KEY;
          if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

          const gateway = createLovableAiGatewayProvider(key);
          const model = gateway("google/gemini-3-flash-preview");
          const { text } = await generateText({ model, prompt });
          return Response.json({ text });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Unknown error";
          return new Response(message, { status: 500 });
        }
      },
    },
  },
});
