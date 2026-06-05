"use client";

interface ToastProps {
  message: string | null;
  tone?: "info" | "error" | "success";
}

export function Toast({ message, tone = "info" }: ToastProps) {
  if (!message) {
    return null;
  }

  const color =
    tone === "error"
      ? "border-coral bg-red-50 text-red-900"
      : tone === "success"
        ? "border-moss bg-emerald-50 text-emerald-900"
        : "border-line bg-white text-ink";

  return (
    <div className={`fixed bottom-4 right-4 z-50 max-w-sm rounded-md border px-4 py-3 text-sm shadow-lg ${color}`}>
      {message}
    </div>
  );
}

