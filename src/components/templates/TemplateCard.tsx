"use client";

import { Button } from "@/components/ui/Button";
import type { Template } from "@/types";

interface TemplateCardProps {
  template: Template;
  onUse: (template: Template) => void;
}

export function TemplateCard({ template, onUse }: TemplateCardProps) {
  const enabledCount = template.content.sections.filter((section) => section.enabled).length;

  return (
    <article className="rounded-md border border-line bg-white p-4">
      <h2 className="text-base font-semibold">{template.name}</h2>
      <p className="mt-2 min-h-10 text-sm text-stone-600">{template.description}</p>
      <p className="mt-3 text-xs text-stone-500">{enabledCount} enabled sections</p>
      <Button className="mt-4 w-full" onClick={() => onUse(template)}>
        Use Template
      </Button>
    </article>
  );
}

