"use client";

import { useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Bold,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PostMarkdownEditorProps = {
  id?: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  onMarkdownChange?: (markdown: string) => void;
  hideHiddenInput?: boolean;
};

function ToolbarButton({
  label,
  icon: Icon,
  onClick,
  active = false,
  disabled = false,
}: {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <Button
      type="button"
      size="icon-sm"
      variant={active ? "secondary" : "outline"}
      onClick={onClick}
      disabled={disabled}
      className="h-8 w-8"
      aria-label={label}
      title={label}
    >
      <Icon />
    </Button>
  );
}

export function PostMarkdownEditor({
  id,
  name,
  defaultValue = "",
  placeholder = "Write your story in Markdown...",
  className,
  onMarkdownChange,
  hideHiddenInput = false,
}: PostMarkdownEditorProps) {
  const [contentMd, setContentMd] = useState(defaultValue);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("https://");
  const [linkText, setLinkText] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  function update(next: string) {
    setContentMd(next);
    onMarkdownChange?.(next);
  }

  function replaceSelection(prefix: string, suffix = "") {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = contentMd.slice(start, end);
    const next = `${contentMd.slice(0, start)}${prefix}${selected}${suffix}${contentMd.slice(end)}`;
    update(next);

    requestAnimationFrame(() => {
      const cursorStart = start + prefix.length;
      const cursorEnd = cursorStart + selected.length;
      textarea.focus();
      textarea.setSelectionRange(cursorStart, cursorEnd);
    });
  }

  function insertAtCursor(snippet: string) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const next = `${contentMd.slice(0, start)}${snippet}${contentMd.slice(end)}`;
    update(next);

    requestAnimationFrame(() => {
      const cursor = start + snippet.length;
      textarea.focus();
      textarea.setSelectionRange(cursor, cursor);
    });
  }

  async function submitImage() {
    if (!imageFile) {
      setImageError("Select an image file.");
      return;
    }

    setIsUploadingImage(true);
    setImageError("");

    try {
      const payload = new FormData();
      payload.set("file", imageFile);

      const response = await fetch("/api/uploads/image", {
        method: "POST",
        body: payload,
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(errorBody?.error || "Image upload failed.");
      }

      const data = (await response.json()) as { url: string };
      insertAtCursor(`![${imageAlt || "image"}](${data.url})`);
      setImageAlt("");
      setImageFile(null);
      setIsImageModalOpen(false);
    } catch (error) {
      setImageError(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setIsUploadingImage(false);
    }
  }

  return (
    <div className={cn("space-y-0", className)}>
      <div className="flex flex-wrap gap-1.5 border-b border-border/60 pb-3">
        <ToolbarButton label="Heading 1" icon={Heading1} onClick={() => insertAtCursor("# ")} />
        <ToolbarButton label="Heading 2" icon={Heading2} onClick={() => insertAtCursor("## ")} />
        <ToolbarButton label="Heading 3" icon={Heading3} onClick={() => insertAtCursor("### ")} />
        <ToolbarButton label="Bold" icon={Bold} onClick={() => replaceSelection("**", "**")} />
        <ToolbarButton label="Italic" icon={Italic} onClick={() => replaceSelection("*", "*")} />
        <ToolbarButton label="Bulleted list" icon={List} onClick={() => insertAtCursor("- ")} />
        <ToolbarButton label="Numbered list" icon={ListOrdered} onClick={() => insertAtCursor("1. ")} />
        <ToolbarButton label="Quote" icon={Quote} onClick={() => insertAtCursor("> ")} />
        <ToolbarButton label="Code block" icon={Code2} onClick={() => replaceSelection("```ts\n", "\n```")} />
        <ToolbarButton
          label="Link"
          icon={Link2}
          onClick={() => {
            const textarea = textareaRef.current;
            if (textarea) {
              const selected = contentMd.slice(textarea.selectionStart, textarea.selectionEnd);
              setLinkText(selected);
            } else {
              setLinkText("");
            }
            setLinkUrl("https://");
            setIsLinkModalOpen(true);
          }}
        />
        <ToolbarButton
          label="Image"
          icon={ImagePlus}
          onClick={() => {
            setImageError("");
            setImageAlt("");
            setImageFile(null);
            setIsImageModalOpen(true);
          }}
        />
      </div>

      <textarea
        ref={textareaRef}
        id={id ?? name}
        value={contentMd}
        onChange={(event) => update(event.target.value)}
        placeholder={placeholder}
        className="mt-4 min-h-[calc(100vh-18rem)] w-full resize-y bg-transparent text-base leading-7 outline-none placeholder:text-muted-foreground/70"
      />

      {!hideHiddenInput ? <textarea name={name} value={contentMd} readOnly hidden /> : null}

      {isLinkModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-background p-4">
            <p className="mb-3 text-lg font-semibold">Insert Link</p>
            <div className="space-y-3">
              <Input
                value={linkText}
                onChange={(event) => setLinkText(event.target.value)}
                placeholder="Link text"
              />
              <Input
                value={linkUrl}
                onChange={(event) => setLinkUrl(event.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsLinkModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  const normalized = linkUrl.trim();
                  if (!normalized) return;
                  const text = linkText.trim() || "link";
                  insertAtCursor(`[${text}](${normalized})`);
                  setIsLinkModalOpen(false);
                }}
              >
                Insert
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {isImageModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-background p-4">
            <p className="mb-3 text-lg font-semibold">Insert Image</p>
            <div className="space-y-3">
              <Input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  setImageError("");
                  setImageFile(event.target.files?.[0] ?? null);
                }}
              />
              <Input
                value={imageAlt}
                onChange={(event) => setImageAlt(event.target.value)}
                placeholder="Alt text (optional)"
              />
              {imageError ? <p className="text-sm text-destructive">{imageError}</p> : null}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsImageModalOpen(false)} disabled={isUploadingImage}>
                Cancel
              </Button>
              <Button type="button" onClick={() => void submitImage()} disabled={isUploadingImage}>
                {isUploadingImage ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
