"use client";

import {
  Camera,
  ExternalLink,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";
import type { ContactLink } from "@/lib/types";
import { pickLocale } from "@/lib/i18n";
import { useLocale } from "./locale-provider";
import { contactOpenUrl } from "@/lib/contact-href";
import { contactIconKind, type ContactIconKind } from "@/lib/contact-icon";

function IconFor({ kind }: { kind: ContactIconKind }) {
  const cls = "h-5 w-5";
  switch (kind) {
    case "whatsapp":
      return <MessageCircle className={cls} aria-hidden />;
    case "instagram":
      return <Camera className={cls} aria-hidden />;
    case "telegram":
      return <Send className={cls} aria-hidden />;
    case "phone":
      return <Phone className={cls} aria-hidden />;
    default:
      return <ExternalLink className={cls} aria-hidden />;
  }
}

export function ContactIconRow({ links }: { links: ContactLink[] }) {
  const { locale } = useLocale();
  if (links.length === 0) return null;

  return (
    <div className="contact-icon-row flex items-center justify-center gap-2">
      {links.map((link) => {
        const url = contactOpenUrl(link);
        const label = pickLocale(locale, {
          nameCkb: link.labelCkb,
          nameAr: link.labelAr,
          nameEn: link.labelEn,
        });
        const kind = contactIconKind(link);
        const external = Boolean(link.href?.trim());

        if (!url) return null;

        return (
          <a
            key={link.id}
            href={url}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            aria-label={label}
            title={label}
            className="contact-icon-row__btn flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-bk-accent transition hover:border-bk-accent/40 hover:bg-bk-accent/15 active:scale-95"
          >
            <IconFor kind={kind} />
          </a>
        );
      })}
    </div>
  );
}