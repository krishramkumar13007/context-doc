"use client";

import { Button } from "@/components/ui/Button";
import type { DocumentVersion } from "@/types";

interface VersionSidebarProps {
  versions: DocumentVersion[];
  activeVersionId: string;
  onVersionSelect: (version: DocumentVersion) => void;
  onRestoreVersion: (version: DocumentVersion) => void;
}

function relativeTime(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.round(diff / 60000));
  if (minutes < 60) {
    return `${minutes} min ago`;
  }
  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours} hours ago`;
  }
  return `${Math.round(hours / 24)} days ago`;
}

export function VersionSidebar({ versions, activeVersionId, onVersionSelect, onRestoreVersion }: VersionSidebarProps) {
  return (
    <aside className="space-y-3 border-r border-line bg-white p-4 lg:w-72">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Versions</h2>
      <div className="space-y-2">
        {versions.map((version) => {
          const isActive = version.id === activeVersionId;
          return (
            <div
              key={version.id}
              className={`rounded-md border p-3 ${isActive ? "border-ink bg-stone-50" : "border-line"}`}
            >
              <button className="w-full text-left" onClick={() => onVersionSelect(version)}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">v{version.version_number}</span>
                  {version.is_compressed ? (
                    <span className="rounded bg-moss px-2 py-0.5 text-xs text-white">Compressed</span>
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-stone-500">{relativeTime(version.created_at)}</p>
                <p className="mt-1 text-xs text-stone-500">{version.token_count} tokens</p>
                {version.label ? <p className="mt-2 text-xs text-ink">{version.label}</p> : null}
              </button>
              <Button className="mt-3 w-full" variant="secondary" onClick={() => onRestoreVersion(version)}>
                Restore
              </Button>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

