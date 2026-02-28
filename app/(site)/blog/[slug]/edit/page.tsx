import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { PostEditorWorkspace } from "@/components/admin/post-editor-workspace";
import { Button } from "@/components/ui/button";
import { getAdminSessionEmail } from "@/lib/admin-auth";
import { getAdminPostBySlug } from "@/lib/admin-cms";
import { updatePostInlineAction } from "@/lib/inline-admin-actions";

type BlogEditPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BlogEditPage({ params }: BlogEditPageProps) {
  const adminEmail = await getAdminSessionEmail();
  if (!adminEmail) {
    redirect("/admin/login");
  }

  const { slug } = await params;
  const post = await getAdminPostBySlug(slug);
  if (!post || !post.slug) {
    notFound();
  }

  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 px-6 py-6 xl:px-10">
      <form action={updatePostInlineAction} className="space-y-6">
        <input type="hidden" name="id" value={post.id} />
        <input type="hidden" name="returnTo" value={`/blog/${post.slug}/edit`} />
        <PostEditorWorkspace
          defaultTitle={post.title ?? ""}
          defaultTags={(post.tags ?? []).join(", ")}
          defaultContentMd={post.content_md ?? ""}
        />
        <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-border/70 bg-background/85 py-4 backdrop-blur">
          <Button type="button" variant="ghost" asChild>
            <Link href={`/blog/${post.slug}`}>Back to Post</Link>
          </Button>
          <div className="flex items-center gap-3">
            <Button type="submit" name="intent" value="draft" variant="outline">
              Draft
            </Button>
            <Button type="submit" name="intent" value="publish">
              Publish
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}
