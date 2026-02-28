"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type TypewriterHeadlineProps = {
  text: string;
  className?: string;
  typingMsPerChar?: number;
  startDelayMs?: number;
};

export function TypewriterHeadline({
  text,
  className,
  typingMsPerChar = 34,
  startDelayMs = 140,
}: TypewriterHeadlineProps) {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    if (!text) {
      queueMicrotask(() => setDisplayText(""));
      return;
    }

    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      queueMicrotask(() => setDisplayText(text));
      return;
    }

    let active = true;
    let index = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const holdMs = 1300;
    const deletingMsPerChar = Math.max(18, Math.floor(typingMsPerChar * 0.55));
    const restartDelayMs = 280;

    const schedule = (callback: () => void, ms: number) => {
      const id = setTimeout(() => {
        if (!active) {
          return;
        }
        callback();
      }, ms);
      timers.push(id);
    };

    const eraseStep = () => {
      index -= 1;
      setDisplayText(text.slice(0, Math.max(index, 0)));
      if (index > 0) {
        schedule(eraseStep, deletingMsPerChar);
      } else {
        schedule(typeStep, restartDelayMs);
      }
    };

    const typeStep = () => {
      index += 1;
      setDisplayText(text.slice(0, Math.min(index, text.length)));
      if (index < text.length) {
        schedule(typeStep, typingMsPerChar);
      } else {
        schedule(eraseStep, holdMs);
      }
    };

    queueMicrotask(() => setDisplayText(""));
    schedule(typeStep, startDelayMs);

    return () => {
      active = false;
      for (const timer of timers) {
        clearTimeout(timer);
      }
    };
  }, [text, typingMsPerChar, startDelayMs]);

  return (
    <h1 className={cn("relative", className)}>
      <span aria-hidden="true" className="invisible">
        {text}
      </span>
      <span className="absolute inset-0">
        {displayText}
        <span
          aria-hidden="true"
          className={cn(
            "ml-1 inline-block h-[0.95em] w-[0.08em] translate-y-[0.08em] bg-current align-baseline",
            "animate-pulse"
          )}
        />
      </span>
    </h1>
  );
}
