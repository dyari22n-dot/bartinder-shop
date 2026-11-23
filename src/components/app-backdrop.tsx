"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { StoreSettings } from "@/lib/types";
import { loadStoreAction } from "@/lib/actions";

/** پاشبنەی بنەڕەت + بەشی سەرەوە لەگەڵ وێنەی جووڵاو (ئەگەر هەبێت) */
export function AppBackdrop() {
  const [settings, setSettings] = useState<StoreSettings>({});

  useEffect(() => {
    void loadStoreAction().then((store) => setSettings(store.settings ?? {}));
  }, []);

  const motionUrl = settings.motionBackgroundUrl;
  const isGif = motionUrl?.toLowerCase().endsWith(".gif");

  return (
    <>
      <div className="app-backdrop" aria-hidden>
        <div className="app-backdrop__splash app-backdrop__splash--1" />
        <div className="app-backdrop__splash app-backdrop__splash--2" />
        <div className="app-backdrop__vignette" />
      </div>
      {motionUrl ? (
        <div className="app-motion-band" aria-hidden>
          {isGif ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={motionUrl} alt="" className="app-motion-band__media" />
          ) : (
            <Image
              src={motionUrl}
              alt=""
              fill
              className="object-cover opacity-90"
              sizes="448px"
              unoptimized
            />
          )}
          <div className="app-motion-band__fade" />
        </div>
      ) : null}
    </>
  );
}