import type { Platform, Section } from "@/types";

// Approximate token count. Not exact. Accepted margin: +/-15%.
// Do not use tiktoken or any WASM-based tokenizer.
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function estimateDocumentTokens(sections: Section[]): number {
  return sections
    .filter((s) => s.enabled)
    .reduce((sum, s) => sum + estimateTokens(s.body), 0);
}

export const PLATFORM_LIMITS: Record<Platform, number> = {
  claude: 2000,
  cursor: 1500,
  gpt: 375,
  gemini: 2000,
  system: Infinity
};

