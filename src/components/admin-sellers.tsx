"use client";

import { useEffect, useState, useTransition } from "react";

type Props = {
  logins: string[];
};

export function AdminSellers({ logins: initial }: Props) {
  const [logins, setLogins] = useState(initial);

  useEffect(() => {
    void fetch("/api/admin/sellers", { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then((d: { ok?: boolean; logins?: string[] }) => {
        if (d.ok && d.logins?.length) setLogins(d.logins);
      })
      .catch(() => undefined);
  }, []);
  const [loginDraft, setLoginDraft] = useState("");
  const [passDraft, setPassDraft] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [vercelCopy, setVercelCopy] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const add = () => {
    const login = loginDraft.trim().toLowerCase();
    if (login.length < 2 || passDraft.length < 6) {
      setMsg("ناو (٢+) و وشەی نهێنی (٦+)");
      return;
    }
    start(async () => {
      setMsg(null);
      setVercelCopy(null);
      try {
        const res = await fetch("/api/admin/sellers", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ add: { login, password: passDraft } }),
        });
        const data = (await res.json()) as {
          ok?: boolean;
          logins?: string[];
          saved?: string;
          message?: string;
          vercelEnv?: { name: string; value: string };
          error?: string;
        };
        if (!data.ok) {
          setMsg(data.error ?? "هەڵە");
          return;
        }
        setLogins(data.logins ?? [...logins, login]);
        setLoginDraft("");
        setPassDraft("");
        if (data.saved === "env" && data.vercelEnv) {
          setVercelCopy(`${data.vercelEnv.name}=${data.vercelEnv.value}`);
          setMsg(data.message ?? "لە Vercel زیاد بکە");
        } else {
          setMsg("پاشەکەوت کرا ✓");
        }
      } catch {
        setMsg("پەیوەندی سێرڤەر");
      }
    });
  };

  const copyVercel = async () => {
    if (!vercelCopy) return;
    try {
      await navigator.clipboard.writeText(vercelCopy);
      setMsg("کۆپی کرا — لە Vercel → Environment Variables → Production");
    } catch {
      /* ignore */
    }
  };

  return (
    <section className="glass mb-6 rounded-2xl p-4">
      <p className="mb-0.5 text-[10px] font-semibold text-bk-muted">زیادە · فرۆشیار</p>
      <h2 className="mb-2 text-sm font-bold text-bk-accent">فرۆشیارانی تر</h2>
      <p className="mb-3 text-xs text-bk-muted">
        ناو + وشەی نهێنی · چوونەژوورەوە لە{" "}
        <strong className="text-white">لۆگۆی سەرەوە (دەستی درێژ ~١ چرکە)</strong> · خاوەن: ناو بەتاڵ +{" "}
        <strong className="text-white">bartender2026</strong>
      </p>
      <ul className="mb-3 space-y-1 text-xs">
        {logins.length === 0 ? (
          <li className="text-bk-muted">هێشتا فرۆشیار نییە</li>
        ) : (
          logins.map((login) => (
            <li key={login} className="rounded-lg border border-white/10 px-2 py-1.5 text-white">
              {login}
            </li>
          ))
        )}
      </ul>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          placeholder="ناو"
          value={loginDraft}
          onChange={(e) => setLoginDraft(e.target.value)}
          className="min-w-0 flex-1"
          autoCapitalize="off"
        />
        <input
          type="password"
          placeholder="وشەی نهێنی"
          value={passDraft}
          onChange={(e) => setPassDraft(e.target.value)}
          className="min-w-0 flex-1"
        />
        <button
          type="button"
          className="btn-outline shrink-0 text-xs"
          disabled={pending}
          onClick={add}
        >
          زیادکردن
        </button>
      </div>
      {vercelCopy ? (
        <div className="mt-2 rounded-xl border border-amber-400/40 bg-amber-400/10 p-2">
          <p className="mb-1 text-[10px] text-amber-100">Vercel Env (کۆپی بکە):</p>
          <code className="block break-all text-[10px] text-white">{vercelCopy}</code>
          <button
            type="button"
            className="btn-outline mt-2 w-full text-xs"
            onClick={copyVercel}
          >
            کۆپی
          </button>
        </div>
      ) : null}
      {msg ? <p className="mt-2 text-center text-[10px] text-bk-accent">{msg}</p> : null}
    </section>
  );
}