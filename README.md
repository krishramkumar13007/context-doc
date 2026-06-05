# Context Doc Builder

A free, local-first editor for reusable AI context documents.

Context Doc Builder helps you write one structured context document, version it, trim it to a rough token budget, and export it for the AI tool you are already using: Claude, Cursor, ChatGPT/GPT, Gemini, or a generic system prompt.

## Why This Exists

Most people do not need another paid prompt platform. They already work inside Claude, Cursor, ChatGPT, or Gemini.

The painful part is everything around that:

- rewriting the same role, style, and constraint notes across tools
- losing important instructions when a prompt gets too long
- keeping several slightly different versions in random notes files
- turning one context blob into tool-specific formats like `.cursorrules` or GPT custom instructions

This project stays small on purpose. It is a local workspace for preparing context, then exporting it into the platform where you actually work.

## What It Does

- Create structured context documents with sections like role, constraints, style, domain knowledge, output format, and examples.
- Toggle sections on or off.
- Estimate token counts locally.
- Save version history in browser localStorage.
- Restore old versions without overwriting them.
- Create a local trim preview for rough token budgets.
- Export context for Claude, Cursor, GPT, Gemini, and system prompts.
- Download Cursor exports as `.cursorrules`.
- Preview GPT exports in "About you" and "How to respond" fields.

## What It Does Not Do

- No accounts.
- No Supabase.
- No paywall.
- No server database.
- No Stripe.
- No hosted prompt marketplace.
- No AI API key required.

Model-powered compression and GPT format splitting are planned for a future optional BYOK (bring-your-own-key) update. BYOK should not be Anthropic-only; the goal is to support user-provided keys for compatible providers such as Anthropic, OpenAI, Gemini, or local/open model gateways.

Your documents stay in your browser until you export them.

## Getting Started

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

Click **Open sample context** to try the full flow immediately.

## Development

```bash
npm run typecheck
npm run lint
npm run build
```

## Security Note

This project currently uses Next.js 14. npm audit reports advisories against Next 14 that are only resolved by upgrading to Next 16. The app is local-first and has no server database, auth layer, or API key handling, but public deployments should review the audit output and consider upgrading Next before hosting it as a public service.

## Storage Model

Documents and versions are stored in `localStorage`:

- `context-doc-documents`
- `context-doc-versions`

Clearing browser site data clears saved documents.

## License

MIT
