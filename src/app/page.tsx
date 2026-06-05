"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ensureSampleDocument } from "@/lib/localStore";

export default function LandingPage() {
  const router = useRouter();

  function openSample() {
    const { document } = ensureSampleDocument();
    router.push(`/app/${document.id}`);
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <section className="w-full max-w-xl">
        <p className="text-sm uppercase tracking-wide text-moss">Context Doc Builder</p>
        <h1 className="mt-3 text-5xl font-semibold tracking-normal text-ink">Context Doc Builder</h1>
        <p className="mt-4 text-lg text-stone-700">
          Write structured AI context once, compress it to token budgets, version it, and export it for Claude, Cursor, GPT, Gemini, or system prompts.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            className="inline-flex min-h-10 items-center justify-center rounded-md bg-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-black"
            onClick={openSample}
          >
            Open sample context
          </button>
          <Link
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-line bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-stone-50"
            href="/app"
          >
            Start blank
          </Link>
        </div>
        <p className="mt-3 text-sm text-stone-500">Free and local-first. Documents stay in this browser until you export them.</p>
      </section>
    </main>
  );
}
