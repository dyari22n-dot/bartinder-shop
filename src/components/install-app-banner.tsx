"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Download } from "lucide-react";
import { useLocale } from "./locale-provider";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallAppBanner() {
  const { locale } = useLocale();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [dismissed, setDismissed] = useState(false);
  const isIos = useSyncExternalStore(
    () => () => {},
    () =>
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      !(window as any).MSStream,
    () => false,
  );
  const standalone = useSyncExternalStore(
    () => () => {},
    () =>
      window.matchMedia("(display-mode: standalone)").matches ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (navigator as any).standalone === true,
    () => false,
  );

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  if (standalone || dismissed) return null;

  const title =
    locale === "ckb"
      ? "وەک ئەپ دایبنێ"
      : locale === "ar"
        ? "ثبّت كتطبيق"
        : "Install as app";

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setDismissed(true);
  };

  if (deferred) {
    return (
      <section className="glass flex items-center gap-3 rounded-2xl border border-bk-accent/30 px-3 py-3">
        <Download className="h-5 w-5 shrink-0 text-bk-accent" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="text-[10px] text-bk-muted">
            {locale === "ckb"
              ? "سەر شاشەی مۆبایل — وەک ئەپ کرد"
              : "Add to home screen"}
          </p>
        </div>
        <button
          type="button"
          className="btn-primary shrink-0 px-3 py-2 text-xs"
          onClick={() => void install()}
        >
          {locale === "ckb" ? "دامەزراندن" : "Install"}
        </button>
        <button
          type="button"
          className="text-xs text-bk-muted"
          onClick={() => setDismissed(true)}
          aria-label="Close"
        >
          ×
        </button>
      </section>
    );
  }

  if (!isIos) return null;

  return (
    <section className="glass rounded-2xl border border-white/10 px-3 py-3 text-[11px] leading-relaxed text-bk-muted">
      <p className="mb-1 font-semibold text-white">{title} (iPhone)</p>
      {locale === "ckb" ? (
        <p>
          Safari → شەیری خوارەوە <strong className="text-white">Share</strong>{" "}
          → <strong className="text-white">Add to Home Screen</strong>
        </p>
      ) : (
        <p>Safari → Share → Add to Home Screen</p>
      )}
      <button
        type="button"
        className="mt-2 text-xs text-bk-accent"
        onClick={() => setDismissed(true)}
      >
        {locale === "ckb" ? "باشە" : "OK"}
      </button>
    </section>
  );
}