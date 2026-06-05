import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Context Doc Builder",
  description: "Write, compress, version, and export AI context documents."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

