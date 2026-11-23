"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Image from "next/image";

function isVideo(url: string) {
  const base = url.split("?")[0];
  return /\.(mp4|webm|mov)$/i.test(base) || base.includes("-motion.mp4");
}

function isGif(url: string) {
  return url.toLowerCase().endsWith(".gif");
}

export function CategoryMotionStage({
  motionUrl,
  children,
  /** ماڵەوە — ڤیدیۆ پیشان دەدرێت، تەنها وێنەی پاشبنەی گەورە نا */
  lite = false,
}: {
  motionUrl?: string;
  children: ReactNode;
  lite?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const wrap = wrapRef.current;
    if (!video || !wrap) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -5% 0px" },
    );
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [motionUrl]);

  if (!motionUrl) {
    return <div className="flex flex-col gap-3">{children}</div>;
  }

  const video = isVideo(motionUrl);

  if (video) {
    return (
      <div ref={wrapRef} className="flex flex-col gap-3">
        <div
          className="category-motion-stage category-motion-stage--solo-video overflow-hidden rounded-3xl"
          aria-hidden
        >
          <video
            key={motionUrl}
            ref={videoRef}
            className="category-motion-stage__solo-video"
            src={motionUrl}
            muted
            loop
            playsInline
            preload="metadata"
          />
        </div>
        <div className="flex flex-col gap-3">{children}</div>
      </div>
    );
  }

  if (lite) {
    return (
      <div className="flex flex-col gap-3">
        <div
          className="relative h-36 w-full overflow-hidden rounded-2xl bg-black/30"
          aria-hidden
        >
          {isGif(motionUrl) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={motionUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <Image
              src={motionUrl}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width:448px) 100vw, 448px"
              unoptimized
            />
          )}
        </div>
        {children}
      </div>
    );
  }

  return (
    <div
      ref={wrapRef}
      className="category-motion-stage relative flex flex-col gap-3 overflow-hidden rounded-3xl p-3"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {isGif(motionUrl) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={motionUrl}
            alt=""
            className="category-motion-stage__media"
          />
        ) : (
          <Image
            src={motionUrl}
            alt=""
            fill
            className="object-cover opacity-40"
            sizes="448px"
            unoptimized
          />
        )}
        <div className="category-motion-stage__shade" />
      </div>
      <div className="relative z-10 flex flex-col gap-3">{children}</div>
    </div>
  );
}