import { isPgConfigured, query } from "@/lib/db";
import { tableName } from "@/lib/db-schema";

type SectionRow = {
  section_key: string;
  content_json: unknown;
};

type ProjectRow = {
  title: string;
  excerpt: string | null;
  stack_tags: string[] | null;
  links: unknown;
};

type ExperienceRow = {
  org: string;
  role: string;
  start_date: string | null;
  end_date: string | null;
  bullets: string[] | null;
};

export type HeroSection = {
  badge?: string;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export type AboutSection = {
  text?: string;
};

export type SkillsSection = {
  items?: string[];
};

export type NowSection = {
  title?: string;
  items?: string[];
};

export type PortfolioProjectItem = {
  title: string;
  excerpt: string;
  stack: string[];
  links: Partial<Record<"github" | "demo" | "docs", string>>;
};

export type PortfolioExperienceItem = {
  org: string;
  role: string;
  period: string;
  points: string[];
};

function asObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function isMissingRelation(error: unknown): boolean {
  return Boolean(
    typeof error === "object" &&
      error &&
      "code" in error &&
      (error as { code?: string }).code === "42P01"
  );
}

function formatPeriod(startDate: string | null, endDate: string | null): string {
  if (!startDate && !endDate) {
    return "";
  }

  if (!startDate) {
    return `${endDate} `;
  }

  return `${startDate} - ${endDate || "Present"}`;
}

export async function getPortfolioSections() {
  if (!isPgConfigured()) {
    return {
      hero: null as HeroSection | null,
      about: null as AboutSection | null,
      skills: null as SkillsSection | null,
      now: null as NowSection | null,
    };
  }

  const result = await query<SectionRow>(
    `select section_key, content_json
     from ${tableName("portfolio_sections")}
     where section_key in ('hero', 'about', 'skills', 'now')`
  );

  const map = new Map(result.rows.map((row) => [row.section_key, asObject(row.content_json)]));
  const hero = map.get("hero") ?? null;
  const about = map.get("about") ?? null;
  const skills = map.get("skills") ?? null;
  const now = map.get("now") ?? null;

  return {
    hero: hero as HeroSection | null,
    about: about as AboutSection | null,
    skills: skills as SkillsSection | null,
    now: now as NowSection | null,
  };
}

export async function getPortfolioProjects(): Promise<PortfolioProjectItem[]> {
  if (!isPgConfigured()) {
    return [];
  }

  try {
    const result = await query<ProjectRow>(
      `select title, excerpt, stack_tags, links
       from ${tableName("portfolio_projects")}
       order by pinned desc nulls last, sort_order asc nulls last, updated_at desc nulls last`
    );

    return result.rows.map((row) => ({
      title: row.title,
      excerpt: row.excerpt ?? "",
      stack: row.stack_tags ?? [],
      links:
        row.links && typeof row.links === "object" && !Array.isArray(row.links)
          ? (row.links as Partial<Record<"github" | "demo" | "docs", string>>)
          : {},
    }));
  } catch (error) {
    if (isMissingRelation(error)) {
      return [];
    }

    throw error;
  }
}

export async function getPortfolioExperiences(): Promise<PortfolioExperienceItem[]> {
  if (!isPgConfigured()) {
    return [];
  }

  try {
    const result = await query<ExperienceRow>(
      `select org, role, start_date, end_date, bullets
       from ${tableName("portfolio_experiences")}
       order by sort_order asc nulls last, end_date desc nulls last, updated_at desc nulls last`
    );

    return result.rows.map((row) => ({
      org: row.org,
      role: row.role,
      period: formatPeriod(row.start_date, row.end_date),
      points: row.bullets ?? [],
    }));
  } catch (error) {
    if (isMissingRelation(error)) {
      return [];
    }

    throw error;
  }
}
