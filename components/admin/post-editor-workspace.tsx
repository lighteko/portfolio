"use client";

import { useState } from "react";

import { PostMarkdownEditor } from "@/components/admin/post-markdown-editor";
import { TagInput } from "@/components/admin/tag-input";
import { MarkdownRenderer } from "@/components/content/markdown-renderer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PostEditorWorkspaceProps = {
  defaultTitle?: string;
  defaultTags?: string;
  defaultContentMd?: string;
};

export function PostEditorWorkspace({
  defaultTitle = "",
  defaultTags = "",
  defaultContentMd = "",
}: PostEditorWorkspaceProps) {
  const [titlePreview, setTitlePreview] = useState(defaultTitle);
  const [contentPreview, setContentPreview] = useState(defaultContentMd);

  return (
    <div className="grid min-h-[calc(100vh-12rem)] gap-8 xl:grid-cols-[minmax(0,1.25fr)_minmax(380px,1fr)]">
      <div className="space-y-5">
        <div>
          <Label htmlFor="title" className="sr-only">
            Title
          </Label>
          <Input
            id="title"
            name="title"
            defaultValue={defaultTitle}
            onChange={(event) => setTitlePreview(event.target.value)}
            required
            placeholder="Enter your title"
            className="h-auto border-0 bg-transparent px-0 py-0 text-5xl font-semibold tracking-tight shadow-none ring-0 placeholder:text-muted-foreground/70 focus-visible:ring-0"
          />
        </div>

        <div>
          <Label htmlFor="tags" className="sr-only">
            Tags
          </Label>
          <TagInput
            id="tags"
            name="tags"
            defaultValue={defaultTags}
            placeholder="Type tag and press Tab"
            className="text-base text-muted-foreground"
            nextFocusId="contentMd"
          />
        </div>

        <PostMarkdownEditor
          id="contentMd"
          name="contentMd"
          defaultValue={defaultContentMd}
          placeholder="Write your story..."
          onMarkdownChange={setContentPreview}
        />
      </div>

      <aside className="h-full rounded-xl border border-border/60 bg-card/30 p-6 xl:sticky xl:top-6">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Preview</p>
        <h2 className="mb-5 text-3xl font-semibold tracking-tight">{titlePreview || "Title preview"}</h2>
        {contentPreview.trim().length > 0 ? (
          <MarkdownRenderer content={contentPreview} />
        ) : (
          <p className="text-sm text-muted-foreground">Rendered preview appears here as you type.</p>
        )}
      </aside>
    </div>
  );
}
