import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";

export type ProviderKey = "openai" | "anthropic" | "gemini";

export const providerLabels: Record<ProviderKey, string> = {
  openai: "ChatGPT",
  anthropic: "Claude",
  gemini: "Gemini",
};

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
});

export function getModelForProvider(provider: ProviderKey) {
  switch (provider) {
    case "anthropic":
      return anthropic("claude-sonnet-4-5");
    case "gemini":
      return google("gemini-2.5-flash");
    case "openai":
    default:
      return openai("gpt-5");
  }
}
