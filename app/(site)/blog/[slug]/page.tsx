import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PenSquare } from "lucide-react";

import { MarkdownRenderer } from "@/components/content/markdown-renderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getAdminSessionEmail } from "@/lib/admin-auth";
import { getPublishedPostBySlug } from "@/lib/content";

type BlogDetailPageProps = {
  params: Promise<{ slug: string }>;
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

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const adminEmail = await getAdminSessionEmail();
  const isAdmin = Boolean(adminEmail);
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
            <Button size="sm" variant="outline" asChild>
              <Link href={`/blog/${slug}/edit`}>
                <PenSquare />
                Edit This Post
              </Link>
            </Button>
          </div>
        ) : null}
      </header>
      <Separator />
      <section className="max-w-3xl text-base text-muted-foreground">
        <MarkdownRenderer content={post.contentMd} />
      </section>
    </article>
  );
}
