import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  primary: "bg-ink text-white hover:bg-black disabled:bg-stone-300",
  secondary: "border border-line bg-white text-ink hover:bg-stone-50 disabled:text-stone-400",
  ghost: "text-ink hover:bg-stone-100 disabled:text-stone-400",
  danger: "bg-coral text-white hover:bg-red-700 disabled:bg-stone-300"
};

export function Button({ children, variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

