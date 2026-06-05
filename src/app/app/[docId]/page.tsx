"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SectionEditor } from "@/components/editor/SectionEditor";
import { TokenPanel } from "@/components/editor/TokenPanel";
import { VersionSidebar } from "@/components/editor/VersionSidebar";
import { ExportModal } from "@/components/export/ExportModal";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import {
  compressVersion,
  listDocuments,
  listVersions,
  saveVersion as saveLocalVersion,
  updateTitle
} from "@/lib/localStore";
import type { Document, DocumentContent, DocumentVersion, Section } from "@/types";

const TARGETS = [200, 500, 800, 1200];

export default function EditorPage() {
  const params = useParams<{ docId: string }>();
  const router = useRouter();
  const docId = params.docId;
  const [document, setDocument] = useState<Document | null>(null);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [activeVersionId, setActiveVersionId] = useState("");
  const [sections, setSections] = useState<Section[]>([]);
  const [titleDraft, setTitleDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [targetTokens, setTargetTokens] = useState(500);
  const [exportOpen, setExportOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 4000);
  }, []);

  const activeVersion = useMemo(
    () => versions.find((version) => version.id === activeVersionId) ?? null,
    [versions, activeVersionId]
  );
  const latestVersion = versions[0] ?? null;
  const isReadOnlyPreview = Boolean(activeVersion && latestVersion && activeVersion.id !== latestVersion.id);

  const loadEditor = useCallback(async () => {
    setIsLoading(true);
    try {
      const found = listDocuments().find((item) => item.id === docId);
      if (!found) {
        throw new Error("Document not found.");
      }
      setDocument(found);
      setTitleDraft(found.title);

      const localVersions = listVersions(docId);
      setVersions(localVersions);
      const latest = localVersions[0];
      if (latest) {
        setActiveVersionId(latest.id);
        setSections(latest.content.sections);
      }
      setIsDirty(false);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [docId, showToast]);

  useEffect(() => {
    loadEditor();
  }, [loadEditor]);

  const saveVersion = useCallback(
    async (content: DocumentContent, label?: string) => {
      setIsSaving(true);
      try {
        const version = saveLocalVersion(docId, content, label);
        setVersions(listVersions(docId));
        setActiveVersionId(version.id);
        setSections(version.content.sections);
        setIsDirty(false);
        return version;
      } catch (error) {
        showToast(error instanceof Error ? error.message : "Something went wrong. Please try again.");
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [docId, showToast]
  );

  useEffect(() => {
    if (!isDirty || isReadOnlyPreview) {
      return;
    }

    const timer = setInterval(() => {
      void saveVersion({ sections }, "Autosave");
    }, 30000);

    return () => clearInterval(timer);
  }, [isDirty, isReadOnlyPreview, saveVersion, sections]);

  function updateSections(nextSections: Section[]) {
    setSections(nextSections);
    if (!isReadOnlyPreview) {
      setIsDirty(true);
    }
  }

  async function saveTitle() {
    if (!document || titleDraft.trim() === document.title) {
      return;
    }

    try {
      const updated = updateTitle(docId, titleDraft);
      if (updated) {
        setDocument(updated);
        setTitleDraft(updated.title);
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  }

  async function restoreVersion(version: DocumentVersion) {
    await saveVersion(version.content, `Restored from v${version.version_number}`);
  }

  async function compress() {
    if (!latestVersion) {
      return;
    }

    let versionToCompress = latestVersion;
    if (isDirty && !isReadOnlyPreview) {
      const saved = await saveVersion({ sections }, "Before compression");
      if (!saved) {
        return;
      }
      versionToCompress = saved;
    }

    setIsCompressing(true);
    try {
      const compressed = compressVersion(docId, versionToCompress, targetTokens);
      setVersions(listVersions(docId));
      setActiveVersionId(compressed.id);
      setSections(compressed.content.sections);
      setIsDirty(false);
      showToast("Local compression saved as a new version.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setIsCompressing(false);
    }
  }

  function selectVersion(version: DocumentVersion) {
    setActiveVersionId(version.id);
    setSections(version.content.sections);
    setIsDirty(false);
  }

  if (isLoading) {
    return <div className="p-6 text-sm text-stone-500">Loading editor...</div>;
  }

  if (!document) {
    return (
      <main className="p-6">
        <p className="text-sm text-stone-600">Document not found.</p>
        <Button className="mt-4" onClick={() => router.push("/app")}>
          Back to documents
        </Button>
      </main>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-65px)] flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-white p-4">
        <div className="min-w-0 flex-1">
          <input
            className="w-full rounded-md border border-transparent bg-transparent px-2 py-1 text-2xl font-semibold hover:border-line focus:border-ink focus:outline-none"
            value={titleDraft}
            onChange={(event) => setTitleDraft(event.target.value)}
            onBlur={saveTitle}
          />
          <p className="px-2 text-xs text-stone-500">
            {isDirty ? "Unsaved changes" : "Saved"} {activeVersion ? `- viewing v${activeVersion.version_number}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="min-h-10 rounded-md border border-line bg-white px-3 text-sm"
            value={targetTokens}
            onChange={(event) => setTargetTokens(Number(event.target.value))}
          >
            {TARGETS.map((target) => (
              <option key={target} value={target}>
                {target} tokens
              </option>
            ))}
          </select>
          <Button variant="secondary" onClick={() => saveVersion({ sections }, "Manual save")} disabled={isSaving || isReadOnlyPreview}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
          <Button variant="secondary" onClick={() => setExportOpen(true)} disabled={!activeVersionId}>
            Export
          </Button>
        </div>
      </div>

      {isReadOnlyPreview ? (
        <div className="border-b border-amber bg-yellow-50 px-4 py-3 text-sm text-amber-900">
          Viewing v{activeVersion?.version_number} - this is read-only. Restore to edit.
        </div>
      ) : null}

      <div className="border-b border-line bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
        Local-first: edit sections, press Save, try Compress, select old versions, then Export. Data stays in this browser.
      </div>

      <div className="grid flex-1 grid-cols-1 lg:grid-cols-[18rem_minmax(0,1fr)_18rem]">
        <VersionSidebar
          versions={versions}
          activeVersionId={activeVersionId}
          onVersionSelect={selectVersion}
          onRestoreVersion={restoreVersion}
        />
        <SectionEditor sections={sections} onChange={updateSections} readOnly={isReadOnlyPreview} />
        <TokenPanel sections={sections} onCompressClick={compress} isCompressing={isCompressing} />
      </div>

      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        documentVersionId={activeVersionId}
        docTitle={document.title}
        onError={showToast}
      />
      <Toast message={toast} tone={toast?.includes("saved") ? "success" : "error"} />
    </div>
  );
}
