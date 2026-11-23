/** گەڕانەوەی سەلامەت کاتێک مێژوو نییە */
export function backFallbackPath(pathname: string): string {
  if (pathname.startsWith("/checkout")) return "/cart";
  if (pathname.startsWith("/product/")) return "/categories";
  if (pathname.startsWith("/category/")) return "/categories";
  if (pathname.startsWith("/brand/")) return "/brands";
  if (pathname === "/admin") return "/";
  return "/";
}