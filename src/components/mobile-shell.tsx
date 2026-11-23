import type { ReactNode } from "react";
import { AppBackdrop } from "./app-backdrop";
import { AppHeader } from "./app-header";
import { BottomNav } from "./bottom-nav";

export function MobileShell({
  children,
  title,
}: {
  children: ReactNode;
  title?: string;
}) {
  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col overflow-hidden text-bk-text shadow-2xl shadow-black/60">
      <AppBackdrop />
      <AppHeader title={title} />
      <main className="relative z-10 flex flex-1 flex-col overflow-y-auto px-4 pb-28">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}