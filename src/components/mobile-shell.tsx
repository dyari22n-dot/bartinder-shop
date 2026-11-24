import type { ReactNode } from "react";
import type { StoreSettings } from "@/lib/types";
import { AppBackdrop } from "./app-backdrop";
import { AppHeader } from "./app-header";
import { BottomNav } from "./bottom-nav";

export function MobileShell({
  children,
  title,
  settings,
}: {
  children: ReactNode;
  title?: string;
  settings?: StoreSettings;
}) {
  return (
    <div className="mobile-shell relative mx-auto flex min-h-dvh w-full max-w-md flex-col overflow-hidden text-bk-text shadow-2xl shadow-black/60">
      <AppBackdrop settings={settings ?? {}} />
      <AppHeader title={title} />
      <main className="relative z-10 flex flex-1 flex-col overflow-y-auto px-4 pb-28">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}