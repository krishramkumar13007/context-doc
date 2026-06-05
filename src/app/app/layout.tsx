"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  function goHome() {
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-white px-4 py-3">
        <Link href="/app" className="text-base font-semibold">
          Context Doc Builder
        </Link>
        <nav className="flex items-center gap-2">
          <Link className={`rounded-md px-3 py-2 text-sm ${pathname === "/app" ? "bg-stone-100" : ""}`} href="/app">
            Documents
          </Link>
          <Link className={`rounded-md px-3 py-2 text-sm ${pathname === "/app/templates" ? "bg-stone-100" : ""}`} href="/app/templates">
            Templates
          </Link>
          <Button variant="secondary" onClick={goHome}>
            Home
          </Button>
        </nav>
      </header>
      {children}
    </div>
  );
}
