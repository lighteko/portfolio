import { isPgConfigured, query } from "@/lib/db";
import { tableName } from "@/lib/db-schema";

type ContentStatus = "draft" | "published";
type LinkContentType = "external" | "bookmark";

export type AdminPostRow = {
  id: string;
  title: string | null;
  slug: string | null;
  status: ContentStatus;
  published_at: Date | string | null;
  updated_at: Date | string | null;
};

export type AdminPostDetail = {
  id: string;
  type: "post";
  status: ContentStatus;
  title: string | null;
  slug: string | null;
  excerpt: string | null;
  tags: string[] | null;
  content_md: string | null;
  cover_image_url: string | null;
};

export type PortfolioSection = {
  section_key: string;
  content_json: unknown;
  updated_at: Date | string | null;
};

export type PortfolioProject = {
  id: string;
  title: string;
  excerpt: string | null;
  description: string | null;
  stack_tags: string[] | null;
  thumbnail_url: string | null;
  links: unknown;
  pinned: boolean | null;
  sort_order: number | null;
  created_at: Date | string | null;
  updated_at: Date | string | null;
};

export type PortfolioExperience = {
  id: string;
  org: string;
  role: string;
  start_date: string | null;
  end_date: string | null;
  bullets: string[] | null;
  sort_order: number | null;
  created_at: Date | string | null;
  updated_at: Date | string | null;
};

function isPgMissingRelation(error: unknown): boolean {
  return Boolean(
    typeof error === "object" &&
      error &&
      "code" in error &&
      (error as { code?: string }).code === "42P01"
  );
}

export async function listAdminPosts(): Promise<AdminPostRow[]> {
  if (!isPgConfigured()) {
    return [];
  }

  const result = await query<AdminPostRow>(
    `select id, title, slug, status, published_at, updated_at
     from ${tableName("content_items")}
     where type = 'post'
     order by updated_at desc nulls last`
  );

  return result.rows;
}

export async function getAdminPostById(id: string): Promise<AdminPostDetail | null> {
  if (!isPgConfigured()) {
    return null;
  }

  const result = await query<AdminPostDetail>(
    `select id, type, status, title, slug, excerpt, tags, content_md, cover_image_url
     from ${tableName("content_items")}
     where id = $1 and type = 'post'
     limit 1`,
    [id]
  );

  return result.rows[0] ?? null;
}

export async function getAdminPostBySlug(slug: string): Promise<AdminPostDetail | null> {
  if (!isPgConfigured()) {
    return null;
  }

  const result = await query<AdminPostDetail>(
    `select id, type, status, title, slug, excerpt, tags, content_md, cover_image_url
     from ${tableName("content_items")}
     where slug = $1 and type = 'post'
     limit 1`,
    [slug]
  );

  return result.rows[0] ?? null;
}

export async function resolveUniquePostSlug(baseSlug: string, excludeId?: string): Promise<string> {
  if (!isPgConfigured()) {
    return baseSlug;
  }

  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    const params: (string | number)[] = [candidate];
    const excludeClause = excludeId ? "and id <> $2" : "";
    if (excludeId) {
      params.push(excludeId);
    }

    const result = await query<{ id: string }>(
      `select id
       from ${tableName("content_items")}
       where type = 'post' and slug = $1 ${excludeClause}
       limit 1`,
      params
    );

    if (result.rows.length === 0) {
      return candidate;
    }

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

export async function createAdminPost(input: {
  title: string;
  slug: string;
  excerpt: string;
  tags: string[];
  contentMd: string;
  coverImageUrl: string;
  status: ContentStatus;
  authorId?: string;
}): Promise<void> {
  if (!isPgConfigured()) {
    return;
  }

  const publishedAt = input.status === "published" ? new Date() : null;

  await query(
    `insert into ${tableName("content_items")} (
      type, status, title, slug, excerpt, tags, content_md, cover_image_url, published_at, author_id
    ) values (
      'post', $1, $2, $3, $4, $5, $6, $7, $8, nullif($9, '')::uuid
    )`,
    [
      input.status,
      input.title,
      input.slug,
      input.excerpt,
      input.tags.length > 0 ? input.tags : null,
      input.contentMd,
      input.coverImageUrl || null,
      publishedAt,
      input.authorId ?? null,
    ]
  );
}

export async function createLinkedContentItem(input: {
  type: LinkContentType;
  status: ContentStatus;
  title: string;
  excerpt: string;
  tags: string[];
  sourceUrl: string;
  ogImageUrl: string;
}): Promise<void> {
  if (!isPgConfigured()) {
    return;
  }

  const publishedAt = input.status === "published" ? new Date() : null;

  await query(
    `insert into ${tableName("content_items")} (
      type, status, title, excerpt, tags, source_url, og_title, og_description, og_image_url, published_at
    ) values ($1, $2, $3, $4, $5, $6, $3, $4, $7, $8)`,
    [
      input.type,
      input.status,
      input.title,
      input.excerpt || null,
      input.tags.length > 0 ? input.tags : null,
      input.sourceUrl,
      input.ogImageUrl || null,
      publishedAt,
    ]
  );
}

export async function updateAdminPost(
  id: string,
  input: {
    title: string;
    slug: string;
    excerpt: string;
    tags: string[];
    contentMd: string;
    coverImageUrl: string;
    status: ContentStatus;
  }
): Promise<void> {
  if (!isPgConfigured()) {
    return;
  }

  await query(
    `update ${tableName("content_items")}
     set
       status = $2,
       title = $3,
       slug = $4,
       excerpt = $5,
       tags = $6,
       content_md = $7,
       cover_image_url = $8,
       published_at = case
         when $2 = 'published' and published_at is null then now()
         when $2 = 'draft' then null
         else published_at
       end,
       updated_at = now()
     where id = $1 and type = 'post'`,
    [
      id,
      input.status,
      input.title,
      input.slug,
      input.excerpt,
      input.tags.length > 0 ? input.tags : null,
      input.contentMd,
      input.coverImageUrl || null,
    ]
  );
}

export async function deleteAdminPost(id: string): Promise<void> {
  if (!isPgConfigured()) {
    return;
  }

  await query(
    `delete from ${tableName("content_items")}
     where id = $1 and type = 'post'`,
    [id]
  );
}

export async function deleteContentItem(id: string): Promise<void> {
  if (!isPgConfigured()) {
    return;
  }

  await query(
    `delete from ${tableName("content_items")}
     where id = $1`,
    [id]
  );
}

export async function listPortfolioSections(): Promise<PortfolioSection[]> {
  if (!isPgConfigured()) {
    return [];
  }

  try {
    const result = await query<PortfolioSection>(
      `select section_key, content_json, updated_at
       from ${tableName("portfolio_sections")}
       order by section_key asc`
    );

    return result.rows;
  } catch (error) {
    if (isPgMissingRelation(error)) {
      return [];
    }

    throw error;
  }
}

export async function upsertPortfolioSection(sectionKey: string, contentJson: unknown): Promise<void> {
  if (!isPgConfigured()) {
    return;
  }

  await query(
    `insert into ${tableName("portfolio_sections")} (section_key, content_json, updated_at)
     values ($1, $2::jsonb, now())
     on conflict (section_key)
     do update set content_json = excluded.content_json, updated_at = now()`,
    [sectionKey, JSON.stringify(contentJson)]
  );
}

export async function listPortfolioProjects(): Promise<PortfolioProject[]> {
  if (!isPgConfigured()) {
    return [];
  }

  try {
    const result = await query<PortfolioProject>(
      `select id, title, excerpt, description, stack_tags, thumbnail_url, links, pinned, sort_order, created_at, updated_at
       from ${tableName("portfolio_projects")}
       order by pinned desc nulls last, sort_order asc nulls last, updated_at desc nulls last`
    );

    return result.rows;
  } catch (error) {
    if (isPgMissingRelation(error)) {
      return [];
    }

    throw error;
  }
}

export async function createPortfolioProject(input: {
  title: string;
  excerpt: string;
  description: string;
  stackTags: string[];
  thumbnailUrl: string;
  links: unknown;
  pinned: boolean;
  sortOrder: number;
}): Promise<void> {
  if (!isPgConfigured()) {
    return;
  }

  await query(
    `insert into ${tableName("portfolio_projects")} (
      title, excerpt, description, stack_tags, thumbnail_url, links, pinned, sort_order, created_at, updated_at
    ) values ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, now(), now())`,
    [
      input.title,
      input.excerpt || null,
      input.description || null,
      input.stackTags.length > 0 ? input.stackTags : null,
      input.thumbnailUrl || null,
      JSON.stringify(input.links ?? {}),
      input.pinned,
      input.sortOrder,
    ]
  );
}

export async function updatePortfolioProject(
  id: string,
  input: {
    title: string;
    excerpt: string;
    description: string;
    stackTags: string[];
    thumbnailUrl: string;
    links: unknown;
    pinned: boolean;
    sortOrder: number;
  }
): Promise<void> {
  if (!isPgConfigured()) {
    return;
  }

  await query(
    `update ${tableName("portfolio_projects")}
     set
       title = $2,
       excerpt = $3,
       description = $4,
       stack_tags = $5,
       thumbnail_url = $6,
       links = $7::jsonb,
       pinned = $8,
       sort_order = $9,
       updated_at = now()
     where id = $1`,
    [
      id,
      input.title,
      input.excerpt || null,
      input.description || null,
      input.stackTags.length > 0 ? input.stackTags : null,
      input.thumbnailUrl || null,
      JSON.stringify(input.links ?? {}),
      input.pinned,
      input.sortOrder,
    ]
  );
}

export async function deletePortfolioProject(id: string): Promise<void> {
  if (!isPgConfigured()) {
    return;
  }

  await query(
    `delete from ${tableName("portfolio_projects")}
     where id = $1`,
    [id]
  );
}

export async function listPortfolioExperiences(): Promise<PortfolioExperience[]> {
  if (!isPgConfigured()) {
    return [];
  }

  try {
    const result = await query<PortfolioExperience>(
      `select id, org, role, start_date, end_date, bullets, sort_order, created_at, updated_at
       from ${tableName("portfolio_experiences")}
       order by sort_order asc nulls last, end_date desc nulls last, updated_at desc nulls last`
    );

    return result.rows;
  } catch (error) {
    if (isPgMissingRelation(error)) {
      return [];
    }

    throw error;
  }
}

export async function createPortfolioExperience(input: {
  org: string;
  role: string;
  startDate: string;
  endDate: string;
  bullets: string[];
  sortOrder: number;
}): Promise<void> {
  if (!isPgConfigured()) {
    return;
  }

  await query(
    `insert into ${tableName("portfolio_experiences")} (
      org, role, start_date, end_date, bullets, sort_order, created_at, updated_at
    ) values ($1, $2, nullif($3, ''), nullif($4, ''), $5, $6, now(), now())`,
    [input.org, input.role, input.startDate, input.endDate, input.bullets.length > 0 ? input.bullets : null, input.sortOrder]
  );
}

export async function updatePortfolioExperience(
  id: string,
  input: {
    org: string;
    role: string;
    startDate: string;
    endDate: string;
    bullets: string[];
    sortOrder: number;
  }
): Promise<void> {
  if (!isPgConfigured()) {
    return;
  }

  await query(
    `update ${tableName("portfolio_experiences")}
     set
       org = $2,
       role = $3,
       start_date = nullif($4, ''),
       end_date = nullif($5, ''),
       bullets = $6,
       sort_order = $7,
       updated_at = now()
     where id = $1`,
    [
      id,
      input.org,
      input.role,
      input.startDate,
      input.endDate,
      input.bullets.length > 0 ? input.bullets : null,
      input.sortOrder,
    ]
  );
}

export async function deletePortfolioExperience(id: string): Promise<void> {
  if (!isPgConfigured()) {
    return;
  }

  await query(
    `delete from ${tableName("portfolio_experiences")}
     where id = $1`,
    [id]
  );
}
