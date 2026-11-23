import { AdminHealth } from "./admin-health";

/** ڕیزبەندی کارەکانی فرۆشیار */
export function AdminStoreGuide() {
  return (
    <section className="glass mb-6 rounded-2xl border border-bk-accent/20 p-4">
      <h2 className="mb-2 text-sm font-bold text-bk-accent">ڕێنمایی فرۆشیار</h2>
      <AdminHealth />
      <ol className="list-inside list-decimal space-y-1 text-xs text-bk-muted">
        <li>
          <span className="text-white">ڕیزبەندی بەشەکان</span>
        </li>
        <li>
          <span className="text-white">براندەکان</span>
        </li>
        <li>
          <span className="text-white">بەرهەم</span>
        </li>
        <li>
          <span className="text-white">پەیوەندیمان</span>
        </li>
        <li>
          <span className="text-white">سلاید / هێرو</span>
        </li>
      </ol>
    </section>
  );
}