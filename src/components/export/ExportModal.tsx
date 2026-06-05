"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { exportContent, findVersion } from "@/lib/localStore";
import { estimateTokens } from "@/lib/tokenCount";
import type { ExportResult, GptExportContent, Platform } from "@/types";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentVersionId: string;
  docTitle?: string;
  onError?: (message: string) => void;
}

const platforms: Array<{ id: Platform; label: string }> = [
  { id: "claude", label: "Claude" },
  { id: "cursor", label: "Cursor" },
  { id: "gpt", label: "GPT" },
  { id: "gemini", label: "Gemini" },
  { id: "system", label: "System Prompt" }
];

function isGptContent(value: ExportResult["formattedContent"]): value is GptExportContent {
  return typeof value !== "string";
}

export function ExportModal({ isOpen, onClose, documentVersionId, docTitle = "context", onError }: ExportModalProps) {
  const [platform, setPlatform] = useState<Platform>("claude");
  const [result, setResult] = useState<ExportResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen || !documentVersionId) {
      return;
    }

    setIsLoading(true);
    setResult(null);

    const version = findVersion(documentVersionId);
    if (version) {
      const formattedContent = exportContent(version.content, platform);
      const tokenCount =
        typeof formattedContent === "string"
          ? estimateTokens(formattedContent)
          : estimateTokens(`${formattedContent.aboutYou}\n${formattedContent.howToRespond}`);
      setResult({ platform, formattedContent, tokenCount });
    } else {
      onError?.("Version not found.");
    }
    setIsLoading(false);

    return undefined;
  }, [isOpen, documentVersionId, platform, onError]);

  async function copyToClipboard() {
    if (!result) {
      return;
    }

    const text = isGptContent(result.formattedContent)
      ? `About you\n${result.formattedContent.aboutYou}\n\nHow to respond\n${result.formattedContent.howToRespond}`
      : result.formattedContent;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function download() {
    if (!result) {
      return;
    }

    const text = isGptContent(result.formattedContent)
      ? JSON.stringify(result.formattedContent, null, 2)
      : result.formattedContent;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download =
      result.platform === "cursor"
        ? ".cursorrules"
        : `context-${result.platform}-${docTitle.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Modal isOpen={isOpen} title="Export context" onClose={onClose}>
      <div className="mb-4 flex flex-wrap gap-2">
        {platforms.map((item) => (
          <button
            key={item.id}
            className={`rounded-md border px-3 py-2 text-sm ${
              platform === item.id ? "border-ink bg-ink text-white" : "border-line bg-white"
            }`}
            onClick={() => setPlatform(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex min-h-56 items-center justify-center text-stone-500">
          <Spinner />
        </div>
      ) : result && isGptContent(result.formattedContent) ? (
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium">About you</span>
            <textarea className="mt-2 h-40 w-full rounded-md border border-line p-3 text-sm" readOnly value={result.formattedContent.aboutYou} />
          </label>
          <label className="block">
            <span className="text-sm font-medium">How to respond</span>
            <textarea className="mt-2 h-40 w-full rounded-md border border-line p-3 text-sm" readOnly value={result.formattedContent.howToRespond} />
          </label>
        </div>
      ) : result ? (
        <textarea className="h-80 w-full rounded-md border border-line p-3 font-mono text-sm" readOnly value={result.formattedContent as string} />
      ) : null}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-stone-500">{result ? `${result.tokenCount} tokens` : ""}</p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={copyToClipboard} disabled={!result}>
            {copied ? "Copied!" : "Copy to clipboard"}
          </Button>
          <Button onClick={download} disabled={!result}>
            Download
          </Button>
        </div>
      </div>
    </Modal>
  );
}
