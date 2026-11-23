import type { ReactNode } from "react";

/** کارتێکی یەکسان بۆ هەموو بەشەکانی مێنوو لە ماڵەوە و پەڕەی بەش */
export function CategorySectionShell({ children }: { children: ReactNode }) {
  return (
    <article className="category-section glass overflow-hidden rounded-3xl p-4">
      {children}
    </article>
  );
}

export function CategorySectionTitle({
  sortOrder,
  children,
  heading = "h2",
}: {
  sortOrder: number;
  children: ReactNode;
  heading?: "h1" | "h2";
}) {
  const Title = heading;
  return (
    <div className="flex items-center gap-2.5">
      <span className="category-section__index" aria-hidden>
        {String(sortOrder).padStart(2, "0")}
      </span>
      <Title className="text-base font-semibold text-white">{children}</Title>
    </div>
  );
}