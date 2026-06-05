"use client";

import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { estimateDocumentTokens, PLATFORM_LIMITS } from "@/lib/tokenCount";
import type { Platform, Section } from "@/types";

interface TokenPanelProps {
  sections: Section[];
  onCompressClick: () => void;
  isCompressing: boolean;
}

const platformLabels: Record<Platform, string> = {
  claude: "Claude",
  cursor: "Cursor",
  gpt: "GPT",
  gemini: "Gemini",
  system: "System"
};

export function TokenPanel({ sections, onCompressClick, isCompressing }: TokenPanelProps) {
  const tokenCount = estimateDocumentTokens(sections);

  return (
    <aside className="space-y-4 border-l border-line bg-white p-4 lg:min-w-72">
      <div>
        <p className="text-xs uppercase tracking-wide text-stone-500">Current estimate</p>
        <p className="mt-1 text-3xl font-semibold">{tokenCount}</p>
        <p className="text-sm text-stone-500">Approximate tokens</p>
      </div>

      <div className="space-y-2">
        {(Object.keys(PLATFORM_LIMITS) as Platform[]).map((platform) => {
          const limit = PLATFORM_LIMITS[platform];
          const ratio = limit === Infinity ? 0 : tokenCount / limit;
          const status =
            limit === Infinity
              ? "bg-stone-300"
              : ratio < 0.8
                ? "bg-moss"
                : ratio <= 1
                  ? "bg-amber"
                  : "bg-coral";
          return (
            <div key={platform} className="rounded-md border border-line p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${status}`} />
                  <span className="text-sm font-medium">{platformLabels[platform]}</span>
                </div>
                <span className="text-xs text-stone-500">{limit === Infinity ? "No limit" : `${limit} max`}</span>
              </div>
              {limit !== Infinity && tokenCount > limit ? (
                <p className="mt-2 text-xs text-coral">{tokenCount - limit} tokens over</p>
              ) : null}
            </div>
          );
        })}
      </div>

      <Button className="w-full gap-2" onClick={onCompressClick} disabled={isCompressing || tokenCount === 0}>
        {isCompressing ? <Spinner /> : null}
        Compress
      </Button>
    </aside>
  );
}

