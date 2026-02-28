import Link from "next/link";
import {
  BookmarkPlus,
  FilePlus2,
  Globe2,
  Grid3X3,
  ImageIcon,
  ImageOff,
  List,
  PenSquare,
  Rss,
} from "lucide-react";

import { DeleteContentButton } from "@/components/blog/delete-content-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getAdminSessionEmail } from "@/lib/admin-auth";
import { deleteContentInlineAction } from "@/lib/inline-admin-actions";
import { getPublishedContent } from "@/lib/content";
import { cn } from "@/lib/utils";

type BlogPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = (await searchParams) ?? {};
  const manageParam = Array.isArray(params.manage) ? params.manage[0] : params.manage;
  const viewParam = Array.isArray(params.view) ? params.view[0] : params.view;
  const thumbnailParam = Array.isArray(params.thumb) ? params.thumb[0] : params.thumb;
  const tagParam = Array.isArray(params.tag) ? params.tag[0] : params.tag;
  const typeParam = Array.isArray(params.type) ? params.type[0] : params.type;
  const viewMode = viewParam === "list" ? "list" : "grid";
  const showThumbnail = thumbnailParam !== "off";
  const selectedTag = String(tagParam ?? "").trim().toLowerCase();
  const selectedType =
    typeParam === "post" || typeParam === "external" || typeParam === "bookmark"
      ? typeParam
      : "all";
  const adminEmail = await getAdminSessionEmail();
  const isAdmin = Boolean(adminEmail);
  const isManageMode = isAdmin && manageParam === "1";
  const items = await getPublishedContent();
  const availableTags = Array.from(
    new Set(items.flatMap((item) => item.tags.map((tag) => tag.trim().toLowerCase())).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));
  const filteredItems = items.filter((item) => {
    const matchesType = selectedType === "all" ? true : item.type === selectedType;
    const matchesTag = selectedTag
      ? item.tags.some((tag) => tag.trim().toLowerCase() === selectedTag)
      : true;
    return matchesType && matchesTag;
  });
  const typeLabelMap = { post: "post", external: "external", bookmark: "bookmark" };
  const uiText = {
    blogTitle: "Blog",
    blogDescription: "Posts, external essays, and saved references in one unified feed.",
    layout: "Layout",
    grid: "Grid",
    list: "List",
    thumbnail: "Thumbnail",
    show: "Show",
    hide: "Hide",
    addPost: "Add Post",
    addExternal: "Add External",
    addBookmark: "Add Bookmark",
    done: "Done",
    manageFeed: "Manage Feed",
    contentType: "Content Type",
    all: "All",
    post: "Post",
    external: "External",
    bookmark: "Bookmark",
    tagFilter: "Tag Filter",
    noPublished: "No published content yet.",
    noTagResult: "No content for the selected filter.",
    edit: "Edit",
    openSource: "Open Source",
  };

  const buildBlogHref = (updates: Record<string, string | null>) => {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === "string" && value.length > 0) {
        search.set(key, value);
      }
    }

    for (const [key, value] of Object.entries(updates)) {
      if (value === null) {
        search.delete(key);
      } else {
        search.set(key, value);
      }
    }

    const query = search.toString();
    return query ? `/blog?${query}` : "/blog";
  };

  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <h1 className="flex items-center gap-2 text-3xl font-semibold">
          <Rss className="size-7" />
          {uiText.blogTitle}
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          {uiText.blogDescription}
        </p>
        <Card className="border-border/70 bg-card/70">
          <CardContent className="space-y-4 p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{uiText.layout}</p>
                <div className="inline-flex rounded-lg border border-border bg-muted/30 p-1">
                  <Link
                    href={buildBlogHref({ view: "grid" })}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition",
                      viewMode === "grid"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Grid3X3 className="size-4" />
                    {uiText.grid}
                  </Link>
                  <Link
                    href={buildBlogHref({ view: "list" })}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition",
                      viewMode === "list"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <List className="size-4" />
                    {uiText.list}
                  </Link>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{uiText.thumbnail}</p>
                <div className="inline-flex rounded-lg border border-border bg-muted/30 p-1">
                  <Link
                    href={buildBlogHref({ thumb: "on" })}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition",
                      showThumbnail
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <ImageIcon className="size-4" />
                    {uiText.show}
                  </Link>
                  <Link
                    href={buildBlogHref({ thumb: "off" })}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition",
                      !showThumbnail
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <ImageOff className="size-4" />
                    {uiText.hide}
                  </Link>
                </div>
              </div>
            </div>

            {isAdmin ? (
              <div className="flex flex-wrap gap-2 border-t border-border/70 pt-4">
                <Button size="sm" asChild>
                  <Link href="/blog/new">
                    <FilePlus2 />
                    {uiText.addPost}
                  </Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/blog/new/external">
                    <Globe2 />
                    {uiText.addExternal}
                  </Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/blog/new/bookmark">
                    <BookmarkPlus />
                    {uiText.addBookmark}
                  </Link>
                </Button>
                <Button size="sm" variant={isManageMode ? "default" : "outline"} asChild>
                  <Link href={isManageMode ? buildBlogHref({ manage: null }) : buildBlogHref({ manage: "1" })}>
                    <PenSquare />
                    {isManageMode ? uiText.done : uiText.manageFeed}
                  </Link>
                </Button>
              </div>
            ) : null}

            <div className="space-y-4 border-t border-border/70 pt-4">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{uiText.contentType}</p>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={buildBlogHref({ type: null })}
                    className={cn(
                      "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition",
                      selectedType === "all"
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {uiText.all}
                  </Link>
                  <Link
                    href={buildBlogHref({ type: "post" })}
                    className={cn(
                      "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition",
                      selectedType === "post"
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {uiText.post}
                  </Link>
                  <Link
                    href={buildBlogHref({ type: "external" })}
                    className={cn(
                      "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition",
                      selectedType === "external"
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {uiText.external}
                  </Link>
                  <Link
                    href={buildBlogHref({ type: "bookmark" })}
                    className={cn(
                      "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition",
                      selectedType === "bookmark"
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {uiText.bookmark}
                  </Link>
                </div>
              </div>

              {availableTags.length > 0 ? (
                <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{uiText.tagFilter}</p>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={buildBlogHref({ tag: null })}
                    className={cn(
                      "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition",
                      !selectedTag
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {uiText.all}
                  </Link>
                  {availableTags.map((tag) => (
                    <Link
                      key={tag}
                      href={buildBlogHref({ tag })}
                      className={cn(
                        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition",
                        selectedTag === tag
                          ? "border-foreground bg-foreground text-background"
                          : "border-border text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
        <Separator />
      </div>
      <div
        id="feed"
        className={cn("grid gap-6", !isManageMode && viewMode === "grid" ? "md:grid-cols-2" : "grid-cols-1")}
      >
        {filteredItems.length === 0 ? (
          <Card className="border-border/70 bg-card/80">
              <CardContent className="py-8 text-sm text-muted-foreground">
              {items.length === 0 ? uiText.noPublished : uiText.noTagResult}
            </CardContent>
          </Card>
        ) : null}
        {filteredItems.map((item, index) => {
          const content = (
            <Card
              className={cn(
                "motion-reveal media-zoom card-hover-lift border-border/70 bg-card/80 hover:border-foreground/30",
                viewMode === "list" ? "overflow-hidden" : ""
              )}
              style={{ animationDelay: `${index * 55}ms` }}
            >
              {showThumbnail && item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className={cn(
                    "w-full object-cover",
                    viewMode === "grid" ? "h-[25rem] rounded-t-xl" : "h-60"
                  )}
                />
              ) : null}
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{item.date}</span>
                  <Badge variant="secondary">{typeLabelMap[item.type]}</Badge>
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
              <Card
                key={item.id ?? item.href}
                className="motion-reveal card-hover-lift border-border/70 bg-card/80"
                style={{ animationDelay: `${index * 45}ms` }}
              >
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{item.date}</span>
                    <Badge variant="secondary">{typeLabelMap[item.type]}</Badge>
                  </div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{item.excerpt}</p>
                  <div className="flex flex-wrap gap-2">
                    {!item.external ? (
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`${item.href}/edit`}>{uiText.edit}</Link>
                      </Button>
                    ) : null}
                    {item.external ? (
                      <Button size="sm" variant="outline" asChild>
                        <a href={item.href} target="_blank" rel="noreferrer">
                          {uiText.openSource}
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
