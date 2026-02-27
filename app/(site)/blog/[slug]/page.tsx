import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookmarkPlus, FilePlus2, Globe2, PenSquare } from "lucide-react";

import { PostEditorWorkspace } from "@/components/admin/post-editor-workspace";
import { MarkdownRenderer } from "@/components/content/markdown-renderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getAdminSessionEmail } from "@/lib/admin-auth";
import { updatePostInlineAction } from "@/lib/inline-admin-actions";
import { getPublishedPostBySlug } from "@/lib/content";

type BlogDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ edit?: string }>;
};

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) {
    return {
      title: "Post not found",
    };
  }

  return {
    title: post.title,
    description: post.excerpt || "Blog post",
  };
}

export default async function BlogDetailPage({ params, searchParams }: BlogDetailPageProps) {
  const { slug } = await params;
  const query = (await searchParams) ?? {};
  const adminEmail = await getAdminSessionEmail();
  const isAdmin = Boolean(adminEmail);
  const showEdit = isAdmin && query.edit === "1";
  const post = await getPublishedPostBySlug(slug);
  if (!post) {
    notFound();
  }

  return (
    <article className="space-y-6">
      <header className="space-y-4">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{post.publishedAt}</span>
          <Badge variant="secondary">post</Badge>
        </div>
        <h1 className="text-3xl font-semibold">{post.title}</h1>
        <p className="max-w-2xl text-muted-foreground">{post.excerpt}</p>
        {post.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}
        {isAdmin ? (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" asChild>
              <Link href="/blog/new">
                <FilePlus2 />
                Add Post
              </Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href="/blog/new/external">
                <Globe2 />
                Add External
              </Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href="/blog/new/bookmark">
                <BookmarkPlus />
                Add Bookmark
              </Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href={`/blog/${slug}?edit=1`}>
                <PenSquare />
                Edit This Post
              </Link>
            </Button>
          </div>
        ) : null}
      </header>
      {showEdit ? (
        <section className="space-y-4 rounded-lg border border-border/70 bg-card/60 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Edit Post</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/blog/${slug}`}>Close</Link>
            </Button>
          </div>
          <form action={updatePostInlineAction} className="space-y-4">
            <input type="hidden" name="id" value={post.id} />
            <input type="hidden" name="returnTo" value={`/blog/${slug}?edit=1`} />
            <PostEditorWorkspace
              defaultTitle={post.title}
              defaultTags={post.tags.join(", ")}
              defaultContentMd={post.contentMd}
            />
            <div className="flex items-center justify-end gap-2 border-t border-border/60 pt-3">
              <Button type="submit" name="intent" value="draft" variant="outline">
                Draft
              </Button>
              <Button type="submit" name="intent" value="publish">
                Publish
              </Button>
            </div>
          </form>
        </section>
      ) : null}
      <Separator />
      <section className="max-w-3xl text-base text-muted-foreground">
        <MarkdownRenderer content={post.contentMd} />
      </section>
    </article>
  );
}
