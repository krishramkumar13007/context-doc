"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import {
  createDocument as createLocalDocument,
  ensureSampleDocument,
  listDocuments,
  listVersions
} from "@/lib/localStore";
import type { Document } from "@/types";

interface DocumentWithCount extends Document {
  versionCount: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    loadDocuments(showToast).then((items) => {
      setDocuments(items);
      setIsLoading(false);
    });
  }, [showToast]);

  async function createDocument() {
    setIsCreating(true);
    try {
      const body = createLocalDocument();
      router.push(`/app/${body.document.id}`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setIsCreating(false);
    }
  }

  function openSampleDocument() {
    const body = ensureSampleDocument();
    router.push(`/app/${body.document.id}`);
  }

  return (
    <main className="mx-auto max-w-6xl p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Documents</h1>
          <p className="mt-1 text-sm text-stone-600">Create, version, compress, and export context docs.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={openSampleDocument}>
            Open sample context
          </Button>
          <Button onClick={createDocument} disabled={isCreating}>
            {isCreating ? "Creating..." : "New Document"}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="mt-8 text-sm text-stone-500">Loading documents...</p>
      ) : documents.length === 0 ? (
        <section className="mt-8 rounded-md border border-dashed border-line bg-white p-8">
          <h2 className="text-lg font-semibold">No documents yet</h2>
          <p className="mt-2 text-sm text-stone-600">Start with a blank context doc or use a template.</p>
          <div className="mt-4 flex gap-2">
            <Button variant="secondary" onClick={openSampleDocument}>
              Open sample context
            </Button>
            <Button onClick={createDocument}>New Document</Button>
            <Link className="rounded-md border border-line bg-white px-4 py-2 text-sm font-medium" href="/app/templates">
              Browse Templates
            </Link>
          </div>
        </section>
      ) : (
        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {documents.map((doc) => (
            <Link key={doc.id} href={`/app/${doc.id}`} className="rounded-md border border-line bg-white p-4 transition hover:border-ink">
              <h2 className="text-base font-semibold">{doc.title}</h2>
              <p className="mt-2 text-sm text-stone-500">Updated {new Date(doc.updated_at).toLocaleString()}</p>
              <p className="mt-3 text-xs text-stone-500">{doc.versionCount} versions</p>
            </Link>
          ))}
        </section>
      )}

      <section className="mt-8 rounded-md border border-line bg-white p-4">
        <h2 className="text-base font-semibold">Local-first by design</h2>
        <p className="mt-1 text-sm text-stone-600">
          Documents are stored in this browser. Export your context whenever you want to move it into Claude, Cursor, GPT, Gemini, or another tool.
        </p>
      </section>
      <Toast message={toast} tone="error" />
    </main>
  );
}

async function loadDocuments(showToast: (message: string) => void) {
  try {
    return listDocuments().map((doc) => ({
      ...doc,
      versionCount: listVersions(doc.id).length
    }));
  } catch (error) {
    showToast(error instanceof Error ? error.message : "Connection error. Please try again.");
    return [];
  }
}
