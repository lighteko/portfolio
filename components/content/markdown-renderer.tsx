import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { MermaidBlock } from "./mermaid-block";

type MarkdownRendererProps = {
  content: string;
};

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a href={href} className="underline decoration-muted-foreground underline-offset-4">
              {children}
            </a>
          ),
          code: ({ className, children, ...props }) => {
            const raw = String(children).replace(/\n$/, "");
            const language = className?.replace("language-", "");
            const isInline = Boolean((props as { inline?: boolean }).inline);

            if (language === "mermaid") {
              return <MermaidBlock chart={raw} />;
            }

            if (isInline) {
              return (
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">
                  {children}
                </code>
              );
            }

            return (
              <pre className="overflow-x-auto rounded-md border border-border/70 bg-muted p-4">
                <code className="font-mono text-sm text-foreground">{children}</code>
              </pre>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
