import Link from "next/link";
import { BookmarkPlus, FilePlus2, Globe2, PenSquare, Rss } from "lucide-react";

import { DeleteContentButton } from "@/components/blog/delete-content-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getAdminSessionEmail } from "@/lib/admin-auth";
import { deleteContentInlineAction } from "@/lib/inline-admin-actions";
import { getPublishedContent } from "@/lib/content";

type BlogPageProps = {
  searchParams?: Promise<{ manage?: string }>;
};

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = (await searchParams) ?? {};
  const adminEmail = await getAdminSessionEmail();
  const isAdmin = Boolean(adminEmail);
  const isManageMode = isAdmin && params.manage === "1";
  const items = await getPublishedContent();
  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <h1 className="flex items-center gap-2 text-3xl font-semibold">
          <Rss className="size-7" />
          Blog
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Posts, external essays, and saved references in one unified feed.
        </p>
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
              <Link href={isManageMode ? "/blog" : "/blog?manage=1"}>
                <PenSquare />
                {isManageMode ? "Done" : "Manage Feed"}
              </Link>
            </Button>
          </div>
        ) : null}
        <Separator />
      </div>
      <div id="feed" className="grid gap-6">
        {items.length === 0 ? (
          <Card className="border-border/70 bg-card/80">
            <CardContent className="py-8 text-sm text-muted-foreground">
              No published content yet.
            </CardContent>
          </Card>
        ) : null}
        {items.map((item) => {
          const content = (
            <Card className="border-border/70 bg-card/80 transition hover:-translate-y-0.5 hover:border-foreground/30">
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-[25rem] w-full rounded-t-xl object-cover"
                />
              ) : null}
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{item.date}</span>
                  <Badge variant="secondary">{item.type}</Badge>
                </div>
                <CardTitle className="text-xl">{item.title}</CardTitle>
                {item.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {item.excerpt}
              </CardContent>
            </Card>
          );

          if (isManageMode) {
            return (
              <Card key={item.id ?? item.href} className="border-border/70 bg-card/80">
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{item.date}</span>
                    <Badge variant="secondary">{item.type}</Badge>
                  </div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{item.excerpt}</p>
                  <div className="flex flex-wrap gap-2">
                    {!item.external ? (
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`${item.href}?edit=1`}>Edit</Link>
                      </Button>
                    ) : null}
                    {item.external ? (
                      <Button size="sm" variant="outline" asChild>
                        <a href={item.href} target="_blank" rel="noreferrer">
                          Open Source
                        </a>
                      </Button>
                    ) : null}
                    {item.id ? (
                      <DeleteContentButton
                        id={item.id}
                        returnTo="/blog?manage=1"
                        action={deleteContentInlineAction}
                        itemType={item.type}
                      />
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            );
          }

          if (!item.external) {
            return (
              <Link key={item.id ?? item.href} href={item.href} className="block">
                {content}
              </Link>
            );
          }

          return (
            <a
              key={item.title}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="block"
            >
              {content}
            </a>
          );
        })}
      </div>
    </section>
  );
}
