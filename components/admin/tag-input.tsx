"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

type TagInputProps = {
  id: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  nextFocusId?: string;
};

function parseInitialTags(value: string): string[] {
  const seen = new Set<string>();
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => {
      const key = item.toLowerCase();
      if (!key || seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
}

export function TagInput({
  id,
  name,
  defaultValue = "",
  placeholder = "Add tag and press Tab",
  className,
  nextFocusId,
}: TagInputProps) {
  const [tags, setTags] = useState<string[]>(() => parseInitialTags(defaultValue));
  const [draft, setDraft] = useState("");

  const serialized = useMemo(() => tags.join(", "), [tags]);

  function addTag(raw: string) {
    const value = raw.trim();
    if (!value) {
      return;
    }

    setTags((prev) => {
      const exists = prev.some((item) => item.toLowerCase() === value.toLowerCase());
      if (exists) {
        return prev;
      }

      return [...prev, value];
    });
    setDraft("");
  }

  function removeTag(index: number) {
    setTags((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className={className}>
      <div className="mb-2 flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <Badge key={`${tag}-${index}`} variant="secondary" className="gap-1">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="rounded-sm p-0.5 hover:bg-muted"
              aria-label={`Remove ${tag}`}
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}
      </div>

      <Input
        id={id}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => addTag(draft)}
        onKeyDown={(event) => {
          if (event.key === "Tab" && draft.trim().length > 0) {
            event.preventDefault();
            addTag(draft);
            return;
          }

          if (event.key === "Tab" && !event.shiftKey && draft.trim().length === 0 && nextFocusId) {
            const next = document.getElementById(nextFocusId);
            if (next instanceof HTMLElement) {
              event.preventDefault();
              next.focus();
              return;
            }
          }

          if ((event.key === "Enter" || event.key === ",") && draft.trim().length > 0) {
            event.preventDefault();
            addTag(draft);
            return;
          }

          if (event.key === "Backspace" && draft.length === 0 && tags.length > 0) {
            event.preventDefault();
            removeTag(tags.length - 1);
          }
        }}
        placeholder={placeholder}
      />
      <input type="hidden" name={name} value={serialized} />
    </div>
  );
}
