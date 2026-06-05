import type { Document, DocumentContent, DocumentVersion, GptExportContent, Platform, Template } from "@/types";
import { estimateDocumentTokens } from "@/lib/tokenCount";

const DOCS_KEY = "context-doc-documents";
const VERSIONS_KEY = "context-doc-versions";
const SAMPLE_ID = "context-doc-builder-sample";

function now() {
  return new Date().toISOString();
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function listDocuments(): Document[] {
  return readJson<Document[]>(DOCS_KEY, []);
}

export function listVersions(docId: string): DocumentVersion[] {
  return readJson<Record<string, DocumentVersion[]>>(VERSIONS_KEY, {})[docId] ?? [];
}

export function findVersion(versionId: string): DocumentVersion | null {
  const allVersions = readJson<Record<string, DocumentVersion[]>>(VERSIONS_KEY, {});
  return Object.values(allVersions)
    .flat()
    .find((version) => version.id === versionId) ?? null;
}

export function createDocument(template?: Template): { document: Document; version: DocumentVersion } {
  const id = crypto.randomUUID();
  const timestamp = now();
  const content = template?.content ?? {
    sections: [
      { id: "role", title: "Role & Identity", body: "", enabled: true, order: 0 },
      { id: "constraints", title: "Constraints", body: "", enabled: true, order: 1 },
      { id: "style", title: "Style & Tone", body: "", enabled: true, order: 2 }
    ]
  };
  const document: Document = {
    id,
    user_id: "local",
    title: template?.name ?? "Untitled Context Doc",
    created_at: timestamp,
    updated_at: timestamp
  };
  const version = makeVersion(document.id, 1, content, template ? `Template: ${template.name}` : null);

  writeJson(DOCS_KEY, [document, ...listDocuments()]);
  const allVersions = readJson<Record<string, DocumentVersion[]>>(VERSIONS_KEY, {});
  writeJson(VERSIONS_KEY, { ...allVersions, [document.id]: [version] });

  return { document, version };
}

export function ensureSampleDocument(): { document: Document; version: DocumentVersion } {
  const existing = listDocuments().find((doc) => doc.id === SAMPLE_ID);
  const existingVersion = existing ? listVersions(existing.id)[0] : null;

  if (existing && existingVersion) {
    return { document: existing, version: existingVersion };
  }

  const timestamp = now();
  const document: Document = {
    id: SAMPLE_ID,
    user_id: "local",
    title: "Context Doc Builder - Product Context",
    created_at: timestamp,
    updated_at: timestamp
  };
  const content: DocumentContent = {
    sections: [
      {
        id: "role",
        title: "Role & Identity",
        enabled: true,
        order: 0,
        body: "You are a senior product engineer helping build Context Doc Builder, a free local-first tool for creating reusable AI context documents across Claude, Cursor, GPT, Gemini, and system prompts."
      },
      {
        id: "constraints",
        title: "Constraints",
        enabled: true,
        order: 1,
        body: "- Preserve user-authored constraints during compression\n- Do not overwrite older versions; save new versions instead\n- Export Cursor context as .cursorrules\n- Export GPT context into About You and How To Respond fields\n- Keep all document data local in the browser"
      },
      {
        id: "style",
        title: "Style & Tone",
        enabled: true,
        order: 2,
        body: "Direct, specific, and builder-friendly. Prefer concrete implementation notes over generic product language."
      },
      {
        id: "output_format",
        title: "Output Format",
        enabled: true,
        order: 3,
        body: "Lead with the answer. Then give short sections for what changed, why it matters, and how to verify it."
      },
      {
        id: "domain",
        title: "Domain Knowledge",
        enabled: true,
        order: 4,
        body: "The app helps users turn scattered prompt notes into a versioned, portable instruction system. The main pain is repeating context across AI tools and losing important constraints when prompts get too long."
      },
      {
        id: "examples",
        title: "Examples",
        enabled: false,
        order: 5,
        body: "Example disabled section: Add exact before/after answers here when you want the context doc to teach a model by demonstration."
      }
    ]
  };
  const version = makeVersion(document.id, 1, content, "Seed sample");
  const docs = listDocuments().filter((doc) => doc.id !== SAMPLE_ID);

  writeJson(DOCS_KEY, [document, ...docs]);
  const allVersions = readJson<Record<string, DocumentVersion[]>>(VERSIONS_KEY, {});
  writeJson(VERSIONS_KEY, { ...allVersions, [document.id]: [version] });

  return { document, version };
}

export function updateTitle(docId: string, title: string): Document | null {
  const docs = listDocuments();
  const updated = docs.map((doc) => (doc.id === docId ? { ...doc, title, updated_at: now() } : doc));
  writeJson(DOCS_KEY, updated);
  return updated.find((doc) => doc.id === docId) ?? null;
}

export function saveVersion(
  docId: string,
  content: DocumentContent,
  label?: string,
  options: { isCompressed?: boolean; originalVersionId?: string | null } = {}
): DocumentVersion {
  const allVersions = readJson<Record<string, DocumentVersion[]>>(VERSIONS_KEY, {});
  const current = allVersions[docId] ?? [];
  const version = makeVersion(docId, (current[0]?.version_number ?? 0) + 1, content, label ?? null, options);

  writeJson(VERSIONS_KEY, { ...allVersions, [docId]: [version, ...current].slice(0, 20) });
  writeJson(
    DOCS_KEY,
    listDocuments().map((doc) => (doc.id === docId ? { ...doc, updated_at: version.created_at } : doc))
  );

  return version;
}

export function compressVersion(docId: string, source: DocumentVersion, targetTokens: number): DocumentVersion {
  const enabledText = source.content.sections
    .filter((section) => section.enabled)
    .map((section) => `${section.title}: ${section.body}`)
    .join("\n\n");
  const maxChars = targetTokens * 4;
  const compressed =
    enabledText.length > maxChars
      ? `${enabledText.slice(0, Math.max(0, maxChars - 42)).trim()}\n\n[Local compression preview]`
      : enabledText;

  return saveVersion(
    docId,
    {
      sections: [
        {
          id: "compressed",
          title: "Compressed Context",
          body: compressed,
          enabled: true,
          order: 0
        }
      ]
    },
    `${targetTokens} token local compression`,
    { isCompressed: true, originalVersionId: source.id }
  );
}

export function exportContent(content: DocumentContent, platform: Platform): string | GptExportContent {
  const sections = content.sections
    .filter((section) => section.enabled)
    .sort((a, b) => a.order - b.order);
  const text = sections.map((section) => `## ${section.title}\n\n${section.body}`.trim()).join("\n\n");

  if (platform !== "gpt") {
    return text;
  }

  const aboutYou = sections
    .filter((section) => ["role", "domain"].includes(String(section.id)))
    .map((section) => section.body)
    .join("\n\n");
  const howToRespond = sections
    .filter((section) => !["role", "domain"].includes(String(section.id)))
    .map((section) => section.body)
    .join("\n\n");

  return {
    aboutYou: aboutYou || text,
    howToRespond: howToRespond || "Use the provided context when responding."
  };
}

function makeVersion(
  docId: string,
  versionNumber: number,
  content: DocumentContent,
  label: string | null,
  options: { isCompressed?: boolean; originalVersionId?: string | null } = {}
): DocumentVersion {
  return {
    id: crypto.randomUUID(),
    document_id: docId,
    version_number: versionNumber,
    content,
    token_count: estimateDocumentTokens(content.sections),
    label,
    is_compressed: options.isCompressed ?? false,
    original_version_id: options.originalVersionId ?? null,
    created_at: now()
  };
}

