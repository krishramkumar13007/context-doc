export type Platform = "claude" | "cursor" | "gpt" | "gemini" | "system";

export type SectionId =
  | "role"
  | "constraints"
  | "style"
  | "domain"
  | "output_format"
  | "examples"
  | string;

export interface Section {
  id: SectionId;
  title: string;
  body: string;
  enabled: boolean;
  order: number;
}

export interface DocumentContent {
  sections: Section[];
}

export interface Document {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  version_number: number;
  content: DocumentContent;
  token_count: number;
  label: string | null;
  is_compressed: boolean;
  original_version_id: string | null;
  created_at: string;
}

export interface CompressionResult {
  newVersion: DocumentVersion;
  tokensBefore: number;
  tokensAfter: number;
  diff: string;
}

export interface ExportResult {
  platform: Platform;
  formattedContent: string | GptExportContent;
  tokenCount: number;
}

export interface GptExportContent {
  aboutYou: string;
  howToRespond: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  content: DocumentContent;
}
