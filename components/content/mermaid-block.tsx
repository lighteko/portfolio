"use client";

import { useEffect, useState } from "react";
import mermaid from "mermaid";

let mermaidInitialized = false;

type MermaidBlockProps = {
  chart: string;
};

export function MermaidBlock({ chart }: MermaidBlockProps) {
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function render() {
      if (!mermaidInitialized) {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "default",
        });
        mermaidInitialized = true;
      }

      try {
        const id = `mermaid-${Math.random().toString(36).slice(2)}`;
        const { svg: rendered } = await mermaid.render(id, chart);

        if (!cancelled) {
          setSvg(rendered);
          setError("");
        }
      } catch (renderError) {
        if (!cancelled) {
          setError(renderError instanceof Error ? renderError.message : "Failed to render Mermaid.");
          setSvg("");
        }
      }
    }

    void render();

    return () => {
      cancelled = true;
    };
  }, [chart]);

  if (error) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
        Mermaid render error: {error}
      </div>
    );
  }

  return (
    <div
      className="overflow-x-auto rounded-md border border-border/70 bg-card p-4"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
