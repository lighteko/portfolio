import { isPgConfigured, query } from "@/lib/db";
import { tableName } from "@/lib/db-schema";

export type ContentType = "post" | "external" | "bookmark";

type ContentRow = {
  id?: string;
  type: ContentType;
  title: string | null;
  slug: string | null;
  excerpt: string | null;
  tags: string[] | null;
  cover_image_url: string | null;
  source_url: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  content_md: string | null;
  published_at: Date | string | null;
};

export type ContentCardItem = {
  id?: string;
  type: ContentType;
  title: string;
  excerpt: string;
  tags: string[];
  date: string;
  href: string;
  external: boolean;
  imageUrl: string | null;
};

export type PostDetail = {
  id: string;
  title: string;
  excerpt: string;
  tags: string[];
  contentMd: string;
  publishedAt: string;
};

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
});

function isMissingRelation(error: unknown): boolean {
  return Boolean(
    typeof error === "object" &&
      error &&
      "code" in error &&
      (error as { code?: string }).code === "42P01"
  );
}

function formatDate(date: Date | string | null): string {
  if (!date) {
    return "";
  }

  const parsed = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return DATE_FORMATTER.format(parsed);
}

function toCardItem(row: ContentRow): ContentCardItem {
  const isPost = row.type === "post";
  const title = row.title ?? row.og_title ?? "Untitled";
  const excerpt = row.excerpt ?? row.og_description ?? "";
  const postHref = row.slug ? `/blog/${row.slug}` : "/blog";

  return {
    id: row.id,
    type: row.type,
    title,
    excerpt,
    tags: row.tags ?? [],
    date: formatDate(row.published_at),
    href: isPost ? postHref : row.source_url ?? "#",
    external: !isPost,
    imageUrl: row.cover_image_url ?? row.og_image_url,
  };
}

export async function getPublishedContent(limit?: number): Promise<ContentCardItem[]> {
  if (!isPgConfigured()) {
    return [];
  }

  const params: unknown[] = [];
  let limitSql = "";
  if (limit && limit > 0) {
    params.push(limit);
    limitSql = ` limit $${params.length}`;
  }

  try {
    const result = await query<ContentRow>(
      `select
        id,
        type,
        title,
        slug,
        excerpt,
        tags,
        cover_image_url,
        source_url,
        og_title,
        og_description,
        og_image_url,
       content_md,
        published_at
       from ${tableName("content_items")}
       where status = 'published'
         and (type <> 'post' or slug is not null)
       order by published_at desc${limitSql}`,
      params
    );

    return result.rows.map(toCardItem);
  } catch (error) {
    if (isMissingRelation(error)) {
      return [];
    }

    throw error;
  }
}

export async function getPublishedPostBySlug(slug: string): Promise<PostDetail | null> {
  if (!isPgConfigured()) {
    return null;
  }

  let result;
  try {
    result = await query<ContentRow>(
      `select
        id,
        title,
        excerpt,
        tags,
        content_md,
        published_at
       from ${tableName("content_items")}
       where type = 'post' and status = 'published' and slug = $1
       limit 1`,
      [slug]
    );
  } catch (error) {
    if (isMissingRelation(error)) {
      return null;
    }

    throw error;
  }

  const row = result.rows[0];
  if (!row) {
    return null;
  }

  return {
    id: row.id ?? "",
    title: row.title ?? "Untitled",
    excerpt: row.excerpt ?? "",
    tags: row.tags ?? [],
    contentMd: row.content_md ?? "",
    publishedAt: formatDate(row.published_at),
  };
}
