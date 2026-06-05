"use client";

import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
import type { Section } from "@/types";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface SectionEditorProps {
  sections: Section[];
  onChange: (sections: Section[]) => void;
  readOnly?: boolean;
}

export function SectionEditor({ sections, onChange, readOnly = false }: SectionEditorProps) {
  function updateSection(id: string, patch: Partial<Section>) {
    onChange(sections.map((section) => (section.id === id ? { ...section, ...patch } : section)));
  }

  function removeSection(id: string) {
    onChange(sections.filter((section) => section.id !== id));
  }

  function addSection() {
    const order = sections.length > 0 ? Math.max(...sections.map((section) => section.order)) + 1 : 0;
    onChange([
      ...sections,
      {
        id: crypto.randomUUID(),
        title: "",
        body: "",
        enabled: true,
        order
      }
    ]);
  }

  return (
    <main className="min-w-0 flex-1 space-y-4 p-4">
      {sections.length === 0 ? (
        <div className="rounded-md border border-dashed border-line bg-white p-8 text-center">
          <p className="text-sm text-stone-500">No sections yet.</p>
          <Button className="mt-4" onClick={addSection} disabled={readOnly}>
            Add Section
          </Button>
        </div>
      ) : null}

      {sections.map((section) => (
        <section
          key={section.id}
          className={`rounded-md border border-line bg-white p-4 ${section.enabled ? "" : "opacity-55"}`}
        >
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={section.enabled}
                disabled={readOnly}
                onChange={(event) => updateSection(section.id, { enabled: event.target.checked })}
              />
              Enabled
            </label>
            <input
              className="min-w-0 flex-1 rounded-md border border-line px-3 py-2 text-sm font-medium"
              value={section.title}
              placeholder="Section title"
              disabled={readOnly}
              onChange={(event) => updateSection(section.id, { title: event.target.value })}
            />
            <Button variant="ghost" onClick={() => removeSection(section.id)} disabled={readOnly}>
              Remove
            </Button>
          </div>
          <MDEditor
            value={section.body}
            height={260}
            preview="edit"
            hideToolbar={readOnly}
            textareaProps={{ readOnly }}
            onChange={(value) => updateSection(section.id, { body: value ?? "" })}
          />
        </section>
      ))}

      {sections.length > 0 ? (
        <Button variant="secondary" onClick={addSection} disabled={readOnly}>
          Add Section
        </Button>
      ) : null}
    </main>
  );
}

