import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAdminSessionEmail } from "@/lib/admin-auth";
import { createLinkedContentInlineAction } from "@/lib/inline-admin-actions";

type NewLinkedContentPageProps = {
  params: Promise<{ type: string }>;
};

export default async function NewLinkedContentPage({ params }: NewLinkedContentPageProps) {
  const { type: rawType } = await params;
  const type = rawType === "external" || rawType === "bookmark" ? rawType : null;
  if (!type) {
    notFound();
  }

  const adminEmail = await getAdminSessionEmail();
  if (!adminEmail) {
    redirect("/admin/login");
  }

  const title = type === "external" ? "Add External Post" : "Add Bookmark";

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6 py-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">
          Add link-based content to your unified feed.
        </p>
      </div>

      <form action={createLinkedContentInlineAction} className="space-y-5">
        <input type="hidden" name="type" value={type} />
        <input type="hidden" name="returnTo" value={`/blog/new/${type}`} />

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required placeholder="Title" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sourceUrl">Source URL</Label>
          <Input id="sourceUrl" name="sourceUrl" required placeholder="https://..." />
        </div>

        <div className="space-y-2">
          <Label htmlFor="excerpt">Excerpt</Label>
          <textarea
            id="excerpt"
            name="excerpt"
            placeholder="Short summary"
            className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <Input id="tags" name="tags" placeholder="tag1, tag2, tag3" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input id="imageUrl" name="imageUrl" placeholder="https://... (optional)" />
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" asChild>
            <Link href="/blog">Cancel</Link>
          </Button>
          <Button type="submit" name="intent" value="draft" variant="outline">
            Draft
          </Button>
          <Button type="submit" name="intent" value="publish">
            Publish
          </Button>
        </div>
      </form>
    </section>
  );
}
