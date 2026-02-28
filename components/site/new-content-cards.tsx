"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ProjectDraft = { id: number };
type ExperienceDraft = { id: number };

type NewCardsProps = {
  formId: string;
};

export function NewProjectCards({ formId }: NewCardsProps) {
  const [items, setItems] = useState<ProjectDraft[]>([]);

  function add() {
    setItems((prev) => [...prev, { id: Date.now() + prev.length }]);
  }

  function remove(id: number) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <div className="space-y-4">
      <Card className="border-dashed border-border/70 bg-card/50">
        <CardContent className="py-6">
          <Button type="button" variant="outline" onClick={add}>
            <Plus />
            Add Project Card
          </Button>
        </CardContent>
      </Card>

      {items.map((item, index) => (
        <Card key={item.id} className="border-dashed border-border/70 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">New Project #{index + 1}</CardTitle>
            <Button type="button" size="icon-sm" variant="ghost" onClick={() => remove(item.id)}>
              <X />
            </Button>
          </CardHeader>
          <CardContent className="grid gap-3">
            <input
              name="newProjectTitle"
              form={formId}
              placeholder="Title"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              name="newProjectExcerpt"
              form={formId}
              placeholder="Excerpt"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <textarea
              name="newProjectDescription"
              form={formId}
              placeholder="Description"
              className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              name="newProjectStackTags"
              form={formId}
              placeholder="Stack tags (comma separated)"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              name="newProjectThumbnailUrl"
              form={formId}
              placeholder="Thumbnail URL"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <div className="grid gap-2 md:grid-cols-3">
              <input
                name="newProjectGithubUrl"
                form={formId}
                placeholder="GitHub URL"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <input
                name="newProjectDemoUrl"
                form={formId}
                placeholder="Demo URL"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <input
                name="newProjectDocsUrl"
                form={formId}
                placeholder="Docs URL"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <select
                name="newProjectPinned"
                form={formId}
                defaultValue="0"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="0">Not pinned</option>
                <option value="1">Pinned</option>
              </select>
              <input
                name="newProjectSortOrder"
                form={formId}
                defaultValue="0"
                type="number"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function NewExperienceCards({ formId }: NewCardsProps) {
  const [items, setItems] = useState<ExperienceDraft[]>([]);

  function add() {
    setItems((prev) => [...prev, { id: Date.now() + prev.length }]);
  }

  function remove(id: number) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <div className="space-y-4">
      <Card className="border-dashed border-border/70 bg-card/50">
        <CardContent className="py-6">
          <Button type="button" variant="outline" onClick={add}>
            <Plus />
            Add Experience Card
          </Button>
        </CardContent>
      </Card>

      {items.map((item, index) => (
        <Card key={item.id} className="border-dashed border-border/70 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">New Experience #{index + 1}</CardTitle>
            <Button type="button" size="icon-sm" variant="ghost" onClick={() => remove(item.id)}>
              <X />
            </Button>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="grid gap-2 md:grid-cols-2">
              <input
                name="newExperienceOrg"
                form={formId}
                placeholder="Organization"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <input
                name="newExperienceRole"
                form={formId}
                placeholder="Role"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="grid gap-2 md:grid-cols-3">
              <input
                name="newExperienceStartDate"
                form={formId}
                placeholder="Start (YYYY-MM)"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <input
                name="newExperienceEndDate"
                form={formId}
                placeholder="End (YYYY-MM)"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <input
                name="newExperienceSortOrder"
                form={formId}
                defaultValue="0"
                type="number"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <textarea
              name="newExperienceBullets"
              form={formId}
              placeholder="Bullets (one per line)"
              className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
