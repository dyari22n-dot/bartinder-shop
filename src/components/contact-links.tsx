"use client";

import { ExternalLink, Phone } from "lucide-react";
import type { ContactLink } from "@/lib/types";
import { pickLocale } from "@/lib/i18n";
import { useLocale } from "./locale-provider";
import { contactOpenUrl, contactSubtitle } from "@/lib/contact-href";

export function ContactLinks({ links }: { links: ContactLink[] }) {
  const { locale } = useLocale();
  if (links.length === 0) return null;

  return (
    <ul className="flex flex-col gap-2">
      {links.map((link) => {
        const url = contactOpenUrl(link);
        const label = pickLocale(locale, {
          nameCkb: link.labelCkb,
          nameAr: link.labelAr,
          nameEn: link.labelEn,
        });
        const sub = contactSubtitle(link);
        const external = Boolean(link.href?.trim());

        if (!url) {
          return (
            <li
              key={link.id}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-bk-muted"
            >
              <p className="font-medium text-white">{label}</p>
              {sub ? <p className="text-xs">{sub}</p> : null}
            </li>
          );
        }

        return (
          <li key={link.id}>
            <a
              href={url}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              className="contact-link-row flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 transition hover:border-bk-accent/35 hover:bg-bk-accent/10"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bk-accent/15 text-bk-accent">
                {external ? (
                  <ExternalLink className="h-4 w-4" aria-hidden />
                ) : (
                  <Phone className="h-4 w-4" aria-hidden />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-white">{label}</span>
                {sub ? (
                  <span className="block truncate text-xs text-bk-muted">{sub}</span>
                ) : null}
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}