"use client";

import { useState, useTransition } from "react";

type Props = {
  onLoggedIn?: () => void;
};

export function AdminLoginScreen({ onLoggedIn }: Props) {
  const [pending, start] = useTransition();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = () =>
    start(async () => {
      setError(null);
      try {
        const res = await fetch("/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ login, password }),
        });
        const data = (await res.json()) as { ok?: boolean };
        if (!res.ok || !data.ok) {
          setError("ناو یان وشەی نهێنی هەڵەیە");
          return;
        }
        if (onLoggedIn) onLoggedIn();
        else window.location.reload();
      } catch {
        setError("پەیوەندی سێرڤەر");
      }
    });

  return (
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-4 px-4">
      <div className="text-center">
        <h1 className="text-xl font-bold text-white">ئەدمین</h1>
        <p className="mt-1 text-xs text-bk-muted">Bartender Kurd</p>
      </div>
      <div className="glass rounded-2xl border border-bk-accent/30 p-4">
        <label className="mb-1 block text-[10px] text-bk-muted">ناوی چوونەژوورەوە</label>
        <input
          type="text"
          autoComplete="username"
          placeholder="بەتاڵ بۆ خاوەن"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
        />
        <label className="mb-1 mt-3 block text-[10px] text-bk-muted">وشەی نهێنی</label>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        {error ? <p className="mt-2 text-sm text-red-300">{error}</p> : null}
        <button
          type="button"
          className="btn-primary mt-4 w-full"
          disabled={pending}
          onClick={submit}
        >
          چوونەژوورەوە
        </button>
      </div>
    </div>
  );
}