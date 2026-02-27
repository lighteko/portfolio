"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminSession, signOutAdmin } from "@/lib/admin-auth";
import {
  createAdminPost,
  createLinkedContentItem,
  deleteContentItem,
  deletePortfolioExperience,
  deletePortfolioProject,
  createPortfolioExperience,
  createPortfolioProject,
  getAdminPostById,
  resolveUniquePostSlug,
  updatePortfolioExperience,
  updatePortfolioProject,
  updateAdminPost,
  upsertPortfolioSection,
} from "@/lib/admin-cms";

function normalizeStatus(intent: FormDataEntryValue | null): "draft" | "published" {
  return intent === "publish" ? "published" : "draft";
}

function sanitizeReturnTo(value: FormDataEntryValue | null, fallback: string): string {
  const input = String(value ?? "").trim();
  if (!input.startsWith("/")) {
    return fallback;
  }

  return input;
}

function slugify(input: string): string {
  const normalized = input
    .toLowerCase()
    .trim()
    .replace(/[`~!@#$%^&*()+=\[\]{}|\\;:'",.<>/?]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return normalized || "untitled-post";
}

function stripLeadingTitleHeading(contentMd: string, title: string): string {
  const normalizedTitle = title.trim().toLowerCase();
  if (!normalizedTitle) {
    return contentMd;
  }

  return contentMd.replace(/^#\s+(.+)\r?\n?/, (matched, heading: string) => {
    if (heading.trim().toLowerCase() === normalizedTitle) {
      return "";
    }

    return matched;
  });
}

function extractCoverImageUrl(contentMd: string): string {
  const markdownImage = contentMd.match(/!\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/);
  if (markdownImage?.[1]) {
    return markdownImage[1];
  }

  const htmlImage = contentMd.match(/<img[^>]+src=["']([^"']+)["']/i);
  return htmlImage?.[1] ?? "";
}

function buildExcerpt(contentMd: string): string {
  const plain = contentMd
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/[#>*_~\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!plain) {
    return "";
  }

  return plain.length > 180 ? `${plain.slice(0, 177).trimEnd()}...` : plain;
}

function parseTags(raw: FormDataEntryValue | null): string[] {
  const seen = new Set<string>();

  return String(raw ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter((item) => {
      if (!item || seen.has(item)) {
        return false;
      }

      seen.add(item);
      return true;
    });
}

export async function createPostInlineAction(formData: FormData) {
  await requireAdminSession();

  const title = String(formData.get("title") ?? "").trim();
  const contentMd = stripLeadingTitleHeading(String(formData.get("contentMd") ?? ""), title);
  const tags = parseTags(formData.get("tags"));
  const status = normalizeStatus(formData.get("intent"));
  const returnTo = sanitizeReturnTo(formData.get("returnTo"), "/blog");
  const slug = await resolveUniquePostSlug(slugify(title));

  await createAdminPost({
    title,
    slug,
    excerpt: buildExcerpt(contentMd) || title,
    tags,
    contentMd,
    coverImageUrl: extractCoverImageUrl(contentMd),
    status,
  });

  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  redirect(status === "published" ? `/blog/${slug}` : returnTo);
}

export async function createLinkedContentInlineAction(formData: FormData) {
  await requireAdminSession();

  const rawType = String(formData.get("type") ?? "").trim();
  const type = rawType === "external" || rawType === "bookmark" ? rawType : null;
  if (!type) {
    redirect("/blog");
  }

  const title = String(formData.get("title") ?? "").trim();
  const sourceUrl = String(formData.get("sourceUrl") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const tags = parseTags(formData.get("tags"));
  const ogImageUrl = String(formData.get("imageUrl") ?? "").trim();
  const status = normalizeStatus(formData.get("intent"));
  const returnTo = sanitizeReturnTo(formData.get("returnTo"), `/blog/new/${type}`);

  if (!title || !sourceUrl) {
    redirect(returnTo);
  }

  await createLinkedContentItem({
    type,
    status,
    title,
    excerpt,
    tags,
    sourceUrl,
    ogImageUrl,
  });

  revalidatePath("/");
  revalidatePath("/blog");
  redirect("/blog");
}

export async function updatePostInlineAction(formData: FormData) {
  await requireAdminSession();

  const id = String(formData.get("id") ?? "");
  const existing = await getAdminPostById(id);
  if (!existing) {
    redirect("/blog");
  }

  const title = String(formData.get("title") ?? "").trim();
  const contentMd = stripLeadingTitleHeading(String(formData.get("contentMd") ?? ""), title);
  const tags = parseTags(formData.get("tags"));
  const status = normalizeStatus(formData.get("intent"));
  const returnTo = sanitizeReturnTo(formData.get("returnTo"), `/blog/${existing.slug ?? ""}`);
  const slug = await resolveUniquePostSlug(slugify(title), id);

  await updateAdminPost(id, {
    title,
    slug,
    excerpt: buildExcerpt(contentMd) || title,
    tags,
    contentMd,
    coverImageUrl: extractCoverImageUrl(contentMd),
    status,
  });

  revalidatePath("/");
  revalidatePath("/blog");
  if (existing.slug) {
    revalidatePath(`/blog/${existing.slug}`);
  }
  revalidatePath(`/blog/${slug}`);
  redirect(status === "published" ? `/blog/${slug}` : returnTo);
}

export async function deleteContentInlineAction(formData: FormData) {
  await requireAdminSession();

  const id = String(formData.get("id") ?? "").trim();
  const returnTo = sanitizeReturnTo(formData.get("returnTo"), "/blog");
  if (!id) {
    redirect(returnTo);
  }

  await deleteContentItem(id);
  revalidatePath("/");
  revalidatePath("/blog");
  redirect(returnTo);
}

async function saveSection(sectionKey: string, content: unknown, saved: string) {
  await upsertPortfolioSection(sectionKey, content);
  revalidatePath("/");
  redirect(`/?manage=portfolio&saved=${saved}`);
}

export async function updateHeroInlineAction(formData: FormData) {
  await requireAdminSession();
  await saveSection(
    "hero",
    {
      badge: String(formData.get("badge") ?? "").trim(),
      title: String(formData.get("title") ?? "").trim(),
      subtitle: String(formData.get("subtitle") ?? "").trim(),
      ctaLabel: String(formData.get("ctaLabel") ?? "").trim(),
      ctaHref: String(formData.get("ctaHref") ?? "").trim(),
    },
    "hero"
  );
}

export async function updateAboutInlineAction(formData: FormData) {
  await requireAdminSession();
  await saveSection(
    "about",
    {
      text: String(formData.get("text") ?? "").trim(),
    },
    "about"
  );
}

export async function saveSiteInlineAction(formData: FormData) {
  await requireAdminSession();

  await upsertPortfolioSection("hero", {
    badge: String(formData.get("badge") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    subtitle: String(formData.get("subtitle") ?? "").trim(),
    ctaLabel: String(formData.get("ctaLabel") ?? "").trim(),
    ctaHref: String(formData.get("ctaHref") ?? "").trim(),
  });

  await upsertPortfolioSection("about", {
    text: String(formData.get("aboutText") ?? "").trim(),
  });

  await upsertPortfolioSection("now", {
    title: String(formData.get("nowTitle") ?? "").trim(),
    items: String(formData.get("nowItems") ?? "")
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean),
  });

  const skillsItems = String(formData.get("skillsItems") ?? "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
  await upsertPortfolioSection("skills", { items: skillsItems });

  const projectIds = formData.getAll("projectId").map((item) => String(item));
  const projectTitles = formData.getAll("projectTitle").map((item) => String(item).trim());
  const projectExcerpts = formData.getAll("projectExcerpt").map((item) => String(item).trim());
  const projectDescriptions = formData.getAll("projectDescription").map((item) => String(item).trim());
  const projectStackTags = formData.getAll("projectStackTags").map((item) => String(item));
  const projectThumbnailUrls = formData.getAll("projectThumbnailUrl").map((item) => String(item).trim());
  const projectGithubUrls = formData.getAll("projectGithubUrl").map((item) => String(item).trim());
  const projectDemoUrls = formData.getAll("projectDemoUrl").map((item) => String(item).trim());
  const projectDocsUrls = formData.getAll("projectDocsUrl").map((item) => String(item).trim());
  const projectPinnedValues = formData.getAll("projectPinned").map((item) => String(item));
  const projectSortOrders = formData.getAll("projectSortOrder").map((item) => Number(String(item)) || 0);

  for (let i = 0; i < projectIds.length; i += 1) {
    if (String(formData.get(`projectDelete:${projectIds[i]}`) ?? "") === "on") {
      await deletePortfolioProject(projectIds[i]);
      continue;
    }

    if (!projectTitles[i]) {
      continue;
    }

    await updatePortfolioProject(projectIds[i], {
      title: projectTitles[i],
      excerpt: projectExcerpts[i] ?? "",
      description: projectDescriptions[i] ?? "",
      stackTags: (projectStackTags[i] ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      thumbnailUrl: projectThumbnailUrls[i] ?? "",
      links: Object.fromEntries(
        [
          ["github", projectGithubUrls[i] ?? ""],
          ["demo", projectDemoUrls[i] ?? ""],
          ["docs", projectDocsUrls[i] ?? ""],
        ].filter(([, value]) => Boolean(value))
      ),
      pinned: projectPinnedValues[i] === "1",
      sortOrder: projectSortOrders[i] ?? 0,
    });
  }

  const newProjectTitle = String(formData.get("newProjectTitle") ?? "").trim();
  if (newProjectTitle) {
    const newProjectStackTags = String(formData.get("newProjectStackTags") ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    await createPortfolioProject({
      title: newProjectTitle,
      excerpt: String(formData.get("newProjectExcerpt") ?? "").trim(),
      description: String(formData.get("newProjectDescription") ?? "").trim(),
      stackTags: newProjectStackTags,
      thumbnailUrl: String(formData.get("newProjectThumbnailUrl") ?? "").trim(),
      links: Object.fromEntries(
        [
          ["github", String(formData.get("newProjectGithubUrl") ?? "").trim()],
          ["demo", String(formData.get("newProjectDemoUrl") ?? "").trim()],
          ["docs", String(formData.get("newProjectDocsUrl") ?? "").trim()],
        ].filter(([, value]) => Boolean(value))
      ),
      pinned: String(formData.get("newProjectPinned") ?? "0") === "1",
      sortOrder: Number(String(formData.get("newProjectSortOrder") ?? "0")) || 0,
    });
  }

  const experienceIds = formData.getAll("experienceId").map((item) => String(item));
  const experienceOrgs = formData.getAll("experienceOrg").map((item) => String(item).trim());
  const experienceRoles = formData.getAll("experienceRole").map((item) => String(item).trim());
  const experienceStartDates = formData.getAll("experienceStartDate").map((item) => String(item).trim());
  const experienceEndDates = formData.getAll("experienceEndDate").map((item) => String(item).trim());
  const experienceBullets = formData.getAll("experienceBullets").map((item) => String(item));
  const experienceSortOrders = formData.getAll("experienceSortOrder").map((item) => Number(String(item)) || 0);

  for (let i = 0; i < experienceIds.length; i += 1) {
    if (String(formData.get(`experienceDelete:${experienceIds[i]}`) ?? "") === "on") {
      await deletePortfolioExperience(experienceIds[i]);
      continue;
    }

    if (!experienceOrgs[i] || !experienceRoles[i]) {
      continue;
    }

    await updatePortfolioExperience(experienceIds[i], {
      org: experienceOrgs[i],
      role: experienceRoles[i],
      startDate: experienceStartDates[i] ?? "",
      endDate: experienceEndDates[i] ?? "",
      bullets: (experienceBullets[i] ?? "")
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      sortOrder: experienceSortOrders[i] ?? 0,
    });
  }

  const newExperienceOrg = String(formData.get("newExperienceOrg") ?? "").trim();
  const newExperienceRole = String(formData.get("newExperienceRole") ?? "").trim();
  if (newExperienceOrg && newExperienceRole) {
    await createPortfolioExperience({
      org: newExperienceOrg,
      role: newExperienceRole,
      startDate: String(formData.get("newExperienceStartDate") ?? "").trim(),
      endDate: String(formData.get("newExperienceEndDate") ?? "").trim(),
      bullets: String(formData.get("newExperienceBullets") ?? "")
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      sortOrder: Number(String(formData.get("newExperienceSortOrder") ?? "0")) || 0,
    });
  }

  revalidatePath("/");
  redirect("/");
}

export async function signOutInlineAction() {
  await signOutAdmin();
  redirect("/");
}
