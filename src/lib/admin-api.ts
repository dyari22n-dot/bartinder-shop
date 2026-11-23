type AdminJson = { ok?: boolean; error?: string };

export async function adminPostJson<T extends AdminJson>(
  url: string,
  body: object,
): Promise<T> {
  try {
    const res = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as T;
    if (res.status === 401) {
      return {
        ...data,
        ok: false,
        error: "چوونەژوورەوە بەسەرچوو — دووبارە بچۆژوورەوە",
      } as T;
    }
    if (!res.ok && data.ok !== false) {
      return {
        ...data,
        ok: false,
        error: data.error ?? `هەڵەی سێرڤەر (${res.status})`,
      } as T;
    }
    return data;
  } catch {
    return { ok: false, error: "پەیوەندی سێرڤەر نییە" } as T;
  }
}

export function scrollToAdminForm(id = "admin-active-form") {
  requestAnimationFrame(() => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}