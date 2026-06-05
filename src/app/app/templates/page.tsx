"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { Toast } from "@/components/ui/Toast";
import { createDocument } from "@/lib/localStore";
import { TEMPLATES } from "@/lib/templates";
import type { Template } from "@/types";

export default function TemplatesPage() {
  const router = useRouter();
  const [toast, setToast] = useState<string | null>(null);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 4000);
  }

  async function useTemplate(template: Template) {
    try {
      const body = createDocument(template);
      router.push(`/app/${body.document.id}`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Connection error. Please try again.");
    }
  }

  return (
    <main className="mx-auto max-w-6xl p-4">
      <h1 className="text-2xl font-semibold">Template Library</h1>
      <p className="mt-1 text-sm text-stone-600">Static starter contexts for common AI workflows.</p>
      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {TEMPLATES.map((template) => (
          <TemplateCard key={template.id} template={template} onUse={useTemplate} />
        ))}
      </section>
      <Toast message={toast} tone="error" />
    </main>
  );
}
