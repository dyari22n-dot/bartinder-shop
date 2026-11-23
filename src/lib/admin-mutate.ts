/** دوای گۆڕان لە ئەدمین — refresh سادە بێ RSC crash */
export function reloadAdmin(): void {
  if (typeof window === "undefined") return;
  window.location.reload();
}