import Link from "next/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Code2,
  FolderKanban,
  GraduationCap,
  Link2,
  Newspaper,
  Sparkles,
  UserRound,
} from "lucide-react";
import { HiOutlineMail } from "react-icons/hi";
import { SiGithub, SiLinkedin } from "react-icons/si";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TypewriterHeadline } from "@/components/site/typewriter-headline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { NewExperienceCards, NewProjectCards } from "@/components/site/new-content-cards";
import { listPortfolioExperiences, listPortfolioProjects } from "@/lib/admin-cms";
import { getAdminSessionEmail } from "@/lib/admin-auth";
import { saveSiteInlineAction } from "@/lib/inline-admin-actions";
import { getPublishedContent } from "@/lib/content";
import { getUserLocale } from "@/lib/locale";
import { getPortfolioSections } from "@/lib/portfolio";
import { SITE_LINKS } from "@/lib/site-links";

const skills = [
  "TypeScript",
  "Next.js",
  "React",
  "PostgreSQL",
  "Node.js",
  "Design Systems",
  "Content Platform",
];

type HomePageProps = {
  searchParams?: Promise<{ manage?: string; saved?: string }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = (await searchParams) ?? {};
  const locale = await getUserLocale();
  const adminEmail = await getAdminSessionEmail();
  const isAdmin = Boolean(adminEmail);
  const showPortfolioManage = isAdmin && params.manage === "portfolio";
  const blogPreview = await getPublishedContent(6);
  const sections = await getPortfolioSections();
  const projects = await listPortfolioProjects();
  const experiences = await listPortfolioExperiences();

  const heroBadge = sections.hero?.badge || "Portfolio + Blog CMS";
  const heroTitle =
    sections.hero?.title || "I build calm, data-driven publishing experiences for modern teams.";
  const heroSubtitle =
    sections.hero?.subtitle ||
    "Product-minded engineer focused on content platforms, editorial tools, and developer experience. Shipping with clarity and strong design.";
  const heroCtaLabel = sections.hero?.ctaLabel || "Let's collaborate";
  const heroCtaHref = sections.hero?.ctaHref || "/#projects";
  const nowTitle = sections.now?.title || "Now";
  const nowItems =
    Array.isArray(sections.now?.items) && sections.now.items.length > 0
      ? sections.now.items
      : [
          "Building a unified portfolio + blog CMS with editorial tooling.",
          "Exploring data storytelling with Postgres + RSC.",
          "Based in Seoul - open to remote collaborations.",
        ];
  const aboutText =
    sections.about?.text ||
    "I help teams build content-driven products with a strong editorial backbone. My focus is on information architecture, DX-friendly tooling, and polished customer journeys.";
  const skillsList =
    Array.isArray(sections.skills?.items) && sections.skills.items.length > 0
      ? sections.skills.items
      : skills;
  const linksList = SITE_LINKS;
  const projectList =
    projects.length > 0
      ? projects.map((project) => ({
          title: project.title,
          excerpt: project.excerpt ?? "",
          stack: project.stack_tags ?? [],
          links:
            project.links && typeof project.links === "object" && !Array.isArray(project.links)
              ? (project.links as Partial<Record<"github" | "demo" | "docs", string>>)
              : {},
        }))
      : [];
  const experienceGroups = (() => {
    const grouped = new Map<
      string,
      {
        org: string;
        entries: Array<{
          id: string;
          role: string;
          startDate: string;
          endDate: string;
          points: string[];
          sortOrder: number;
        }>;
      }
    >();

    for (const item of experiences) {
      const key = item.org.trim().toLowerCase();
      const prev = grouped.get(key);
      const entry = {
        id: item.id,
        role: item.role,
        startDate: item.start_date ?? "",
        endDate: item.end_date ?? "",
        points: item.bullets ?? [],
        sortOrder: item.sort_order ?? 0,
      };

      if (prev) {
        prev.entries.push(entry);
      } else {
        grouped.set(key, { org: item.org, entries: [entry] });
      }
    }

    const groups = Array.from(grouped.values()).map((group) => {
      const entries = [...group.entries].sort((a, b) => {
        const aDate = a.startDate || a.endDate || "";
        const bDate = b.startDate || b.endDate || "";
        if (aDate !== bDate) {
          return bDate.localeCompare(aDate);
        }
        return b.sortOrder - a.sortOrder;
      });
      const latestDate = entries[0]?.startDate || entries[0]?.endDate || "";
      return { ...group, entries, latestDate };
    });

    return groups.sort((a, b) => b.latestDate.localeCompare(a.latestDate));
  })();

  const getProjectLinks = (links: unknown): Array<{ key: string; href: string }> => {
    if (!links || typeof links !== "object" || Array.isArray(links)) {
      return [];
    }

    const obj = links as Record<string, unknown>;
    return ["github", "demo", "docs"]
      .map((key) => ({ key, href: typeof obj[key] === "string" ? obj[key] : "" }))
      .filter((item) => Boolean(item.href));
  };

  const tutoringText =
    locale === "ko"
      ? {
          tutoringTitle: "Tutoring",
          tutoringBadge: "CS Foundation · 1:1",
          tutoringHeading: "Python으로 배우는 컴퓨터 사고력 기르기",
          tutoringDescription:
            "AI 시대에 진정 필요한 것은 단순 문법 암기형 코딩 능력이 아닌, 논리적 사고력을 기르는 것입니다.",
          tutoringTags: ["8주 과정", "주 2회 · 회당 2시간", "Python 기초", "완전 초보 대상"],
          tutoringFormats:
            "코딩이 안 무섭고 어디서부터 시작할지 아는 상태를 목표로, 검색·디버깅 습관부터 실용 자동화/미니 프로그램 제작, 프로젝트·버전 관리까지 단계적으로 진행합니다.",
          tutoringCta: "상담하러 가기",
        }
      : {
          tutoringTitle: "Tutoring",
          tutoringBadge: "CS Foundation · 1:1",
          tutoringHeading: "Build Computational Thinking with Python",
          tutoringDescription:
            "In the AI era, what matters most is not memorizing syntax but developing strong logical thinking.",
          tutoringTags: ["8-week program", "2 sessions/week · 2h each", "Python basics", "Complete beginners"],
          tutoringFormats:
            "The goal is to help you stop fearing code and know exactly where to start, from search/debug habits to practical automation mini-projects and version-controlled project delivery.",
          tutoringCta: "Book a Consultation",
        };

  const getLinkIcon = (label: string) => {
    const normalized = label.trim().toLowerCase();
    if (normalized === "github") return <SiGithub className="size-4" />;
    if (normalized === "linkedin") return <SiLinkedin className="size-4" />;
    if (normalized === "email") return <HiOutlineMail className="size-4" />;
    return null;
  };

  return (
    <>
      {showPortfolioManage ? (
        <form id="site-edit-form" action={saveSiteInlineAction} className="space-y-24">
          <section className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-4 rounded-lg border border-border/70 bg-card/60 p-4">
              <input
                type="text"
                name="badge"
                defaultValue={heroBadge}
                className="w-fit rounded-full border border-input bg-background px-4 py-1 text-xs uppercase tracking-[0.2em]"
              />
              <textarea
                name="title"
                defaultValue={heroTitle}
                className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-4xl font-semibold leading-tight md:text-5xl"
              />
              <textarea
                name="subtitle"
                defaultValue={heroSubtitle}
                className="min-h-24 w-full max-w-xl rounded-md border border-input bg-background px-3 py-2 text-lg text-muted-foreground"
              />
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  type="text"
                  name="ctaLabel"
                  defaultValue={heroCtaLabel}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  name="ctaHref"
                  defaultValue={heroCtaHref}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>
            <Card className="border-border/70 bg-card/80 shadow-xl">
              <CardHeader>
                <input
                  type="text"
                  name="nowTitle"
                  defaultValue={nowTitle}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-lg font-semibold"
                />
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <textarea
                  name="nowItems"
                  defaultValue={nowItems.join("\n")}
                  className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground"
                />
              </CardContent>
            </Card>
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">About</h2>
              <Separator className="hidden w-24 lg:block" />
            </div>
            <textarea
              name="aboutText"
              defaultValue={aboutText}
              className="min-h-28 w-full max-w-3xl rounded-md border border-input bg-background px-3 py-2 text-base text-muted-foreground"
            />
          </section>
        </form>
      ) : (
        <section className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <Badge className="w-fit rounded-full px-4 py-1 text-xs uppercase tracking-[0.2em]">
              {heroBadge}
            </Badge>
            <TypewriterHeadline
              text={heroTitle}
              className="text-4xl font-semibold leading-tight md:text-5xl"
            />
            <p className="max-w-xl text-lg text-muted-foreground">
              {heroSubtitle}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href={heroCtaHref}>
                  <Sparkles />
                  {heroCtaLabel}
                </Link>
              </Button>
            </div>
          </div>
          <Card className="border-border/70 bg-card/80 shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg">{nowTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              {nowItems.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </CardContent>
          </Card>
        </section>
      )}

      {!showPortfolioManage ? (
        <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-2xl font-semibold">
            <UserRound className="size-6" />
            About
          </h2>
          <Separator className="hidden w-24 lg:block" />
        </div>
          <p className="max-w-3xl text-base text-muted-foreground">
            {aboutText}
          </p>
        </section>
      ) : null}

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-2xl font-semibold">
            <Code2 className="size-6" />
            Skills
          </h2>
          <Separator className="hidden w-24 lg:block" />
        </div>
        {showPortfolioManage ? (
          <textarea
            name="skillsItems"
            form="site-edit-form"
            defaultValue={skillsList.join("\n")}
            className="min-h-28 w-full max-w-3xl rounded-md border border-input bg-background px-3 py-2 text-base"
          />
        ) : (
          <div className="flex flex-wrap gap-3">
            {skillsList.map((skill) => (
              <Badge key={skill} variant="secondary" className="rounded-full px-4">
                {skill}
              </Badge>
            ))}
          </div>
        )}
      </section>

      <section id="projects" className="scroll-mt-24 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-2xl font-semibold">
            <FolderKanban className="size-6" />
            Projects
          </h2>
          <Separator className="hidden w-24 lg:block" />
        </div>
        {showPortfolioManage ? (
          <div className="space-y-4">
            {projects.length === 0 ? <p className="text-sm text-muted-foreground">No existing projects.</p> : null}
            {projects.map((project) => {
              const projectLinks = getProjectLinks(project.links);

              return (
                <Card key={project.id} className="border-border/70 bg-card/80">
                  <CardHeader>
                    <CardTitle className="text-lg">Edit Project</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    <input type="hidden" name="projectId" form="site-edit-form" value={project.id} />
                    <input
                      name="projectTitle"
                      form="site-edit-form"
                      defaultValue={project.title}
                      placeholder="Title"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                    <input
                      name="projectExcerpt"
                      form="site-edit-form"
                      defaultValue={project.excerpt ?? ""}
                      placeholder="Excerpt"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                    <textarea
                      name="projectDescription"
                      form="site-edit-form"
                      defaultValue={project.description ?? ""}
                      placeholder="Description"
                      className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                    <input
                      name="projectStackTags"
                      form="site-edit-form"
                      defaultValue={(project.stack_tags ?? []).join(", ")}
                      placeholder="Stack tags (comma separated)"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                    <input
                      name="projectThumbnailUrl"
                      form="site-edit-form"
                      defaultValue={project.thumbnail_url ?? ""}
                      placeholder="Thumbnail URL"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                    <div className="grid gap-2 md:grid-cols-3">
                      <input
                        name="projectGithubUrl"
                        form="site-edit-form"
                        defaultValue={projectLinks.find((item) => item.key === "github")?.href ?? ""}
                        placeholder="GitHub URL"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                      <input
                        name="projectDemoUrl"
                        form="site-edit-form"
                        defaultValue={projectLinks.find((item) => item.key === "demo")?.href ?? ""}
                        placeholder="Demo URL"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                      <input
                        name="projectDocsUrl"
                        form="site-edit-form"
                        defaultValue={projectLinks.find((item) => item.key === "docs")?.href ?? ""}
                        placeholder="Docs URL"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="grid gap-2 md:grid-cols-2">
                      <select
                        name="projectPinned"
                        form="site-edit-form"
                        defaultValue={project.pinned ? "1" : "0"}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="0">Not pinned</option>
                        <option value="1">Pinned</option>
                      </select>
                      <input
                        name="projectSortOrder"
                        form="site-edit-form"
                        defaultValue={String(project.sort_order ?? 0)}
                        type="number"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <label className="flex items-center gap-3 text-sm">
                      <input
                        type="checkbox"
                        name={`projectDelete:${project.id}`}
                        form="site-edit-form"
                        className="h-4 w-4 accent-destructive"
                      />
                      <span className="text-destructive">Delete project</span>
                    </label>
                  </CardContent>
                </Card>
              );
            })}

            <NewProjectCards formId="site-edit-form" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {projectList.length === 0 ? (
              <Card className="border-border/70 bg-card/80 md:col-span-2">
                <CardContent className="py-8 text-sm text-muted-foreground">
                  No projects yet.
                </CardContent>
              </Card>
            ) : null}
            {projectList.map((project) => {
              const projectLinks = getProjectLinks(project.links);

              return (
                <Card key={project.title} className="border-border/70 bg-card/80">
                  <CardHeader>
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-muted-foreground">
                    <p>{project.excerpt}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.stack.map((item) => (
                        <Badge key={item} variant="outline">
                          {item}
                        </Badge>
                      ))}
                    </div>
                    {projectLinks.length > 0 ? (
                      <div className="flex flex-wrap gap-3 text-xs">
                        {projectLinks.map((item) => (
                          <a
                            key={`${project.title}-${item.key}`}
                            href={item.href}
                            target="_blank"
                            rel="noreferrer"
                            className="underline decoration-muted-foreground underline-offset-4 hover:text-foreground"
                          >
                            {item.key}
                          </a>
                        ))}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section id="experience" className="scroll-mt-24 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-2xl font-semibold">
            <BriefcaseBusiness className="size-6" />
            Experience
          </h2>
          <Separator className="hidden w-24 lg:block" />
        </div>
        {showPortfolioManage ? (
          <div className="space-y-4">
            {experiences.length === 0 ? <p className="text-sm text-muted-foreground">No existing experiences.</p> : null}
            {experiences.map((item) => (
              <Card key={item.id} className="border-border/70 bg-card/80">
                <CardHeader>
                  <CardTitle className="text-lg">Edit Experience</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3">
                  <input type="hidden" name="experienceId" form="site-edit-form" value={item.id} />
                  <div className="grid gap-2 md:grid-cols-2">
                    <input name="experienceOrg" form="site-edit-form" defaultValue={item.org} placeholder="Organization" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                    <input name="experienceRole" form="site-edit-form" defaultValue={item.role} placeholder="Role" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                  </div>
                  <div className="grid gap-2 md:grid-cols-3">
                    <input name="experienceStartDate" form="site-edit-form" defaultValue={item.start_date ?? ""} placeholder="Start (YYYY-MM)" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                    <input name="experienceEndDate" form="site-edit-form" defaultValue={item.end_date ?? ""} placeholder="End (YYYY-MM)" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                    <input name="experienceSortOrder" form="site-edit-form" defaultValue={String(item.sort_order ?? 0)} type="number" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                  </div>
                  <textarea
                    name="experienceBullets"
                    form="site-edit-form"
                    defaultValue={(item.bullets ?? []).join("\n")}
                    placeholder="Bullets (one per line)"
                    className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                  <label className="flex items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      name={`experienceDelete:${item.id}`}
                      form="site-edit-form"
                      className="h-4 w-4 accent-destructive"
                    />
                    <span className="text-destructive">Delete experience</span>
                  </label>
                </CardContent>
              </Card>
            ))}

            <NewExperienceCards formId="site-edit-form" />
          </div>
        ) : (
          <div className="space-y-6">
            {experienceGroups.length === 0 ? (
              <Card className="border-border/70 bg-card/80">
                <CardContent className="py-8 text-sm text-muted-foreground">
                  No experiences yet.
                </CardContent>
              </Card>
            ) : null}
            {experienceGroups.map((group) => (
              <Card key={group.org} className="border-border/70 bg-card/80">
                <CardHeader>
                  <CardTitle className="text-lg">{group.org}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm text-muted-foreground">
                  {group.entries.map((entry, index) => {
                    const period = entry.startDate
                      ? `${entry.startDate} - ${entry.endDate || "Present"}`
                      : entry.endDate || "";

                    return (
                      <div
                        key={entry.id}
                        className={`relative pl-8 ${index === group.entries.length - 1 ? "" : "pb-6"}`}
                      >
                        {index !== group.entries.length - 1 ? (
                          <span className="absolute left-[7px] top-5 h-[calc(100%-0.25rem)] w-px bg-border" />
                        ) : null}
                        <span className="absolute left-0 top-1.5 size-4 rounded-full border-2 border-primary bg-background" />
                        <div className="space-y-2">
                          <p className="text-base font-medium text-foreground">{entry.role}</p>
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">{period}</p>
                          {entry.points.length > 0 ? (
                            <div className="space-y-1">
                              {entry.points.map((point) => (
                                <p key={`${entry.id}-${point}`}>- {point}</p>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-2xl font-semibold">
            <Link2 className="size-6" />
            Links
          </h2>
          <Separator className="hidden w-24 lg:block" />
        </div>
        <div className="flex flex-wrap gap-4 text-sm font-medium">
          {linksList.map((item) => (
            <Link
              key={item.label}
              className="inline-flex items-center gap-2 underline-offset-4 hover:underline"
              href={item.href}
            >
              {getLinkIcon(item.label)}
              {item.label}
            </Link>
          ))}
        </div>
      </section>

      <section id="tutoring" className="scroll-mt-24 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-2xl font-semibold">
            <GraduationCap className="size-6 shrink-0" />
            {tutoringText.tutoringTitle}
          </h2>
          <Separator className="hidden w-24 lg:block" />
        </div>
        <Card className="overflow-hidden border-border/70 bg-card/90">
          <CardContent className="grid gap-6 p-0 md:grid-cols-[1.25fr_0.75fr]">
            <div className="space-y-5 p-6 md:p-8">
              <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs tracking-wide">
                {tutoringText.tutoringBadge}
              </Badge>
              <div className="space-y-3">
                <h3 className="text-2xl font-semibold leading-tight">
                  {tutoringText.tutoringHeading}
                </h3>
                <p className="max-w-2xl text-sm text-muted-foreground">
                  {tutoringText.tutoringDescription}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {tutoringText.tutoringTags.map((tag) => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
            </div>
            <div className="flex flex-col justify-between gap-4 border-t border-border/70 bg-muted/30 p-6 md:border-l md:border-t-0 md:p-8">
              <p className="text-sm text-muted-foreground">
                {tutoringText.tutoringFormats}
              </p>
              <Button size="lg" className="w-full justify-between" asChild>
                <Link href="/tutoring">
                  {tutoringText.tutoringCta}
                  <ArrowUpRight />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-2xl font-semibold">
            <Newspaper className="size-6" />
            Latest from the blog
          </h2>
          <Button variant="ghost" asChild>
            <Link href="/blog">View all</Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {blogPreview.length === 0 ? (
            <Card className="border-border/70 bg-card/80 md:col-span-3">
              <CardContent className="py-8 text-sm text-muted-foreground">
                No published content yet.
              </CardContent>
            </Card>
          ) : null}
          {blogPreview.map((item, index) => {
            const content = (
              <Card
                className="motion-reveal media-zoom card-hover-lift overflow-hidden border-border/70 bg-card/80 hover:border-foreground/30"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <div className="flex items-start gap-4 p-4">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-24 w-40 shrink-0 rounded-md object-cover"
                    />
                  ) : null}
                  <div className="min-w-0 space-y-2">
                    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span>{item.date}</span>
                      <Badge variant="secondary">{item.type}</Badge>
                    </div>
                    <CardTitle className="text-base leading-snug">{item.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{item.excerpt}</p>
                    {item.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {item.tags.map((tag) => (
                          <Badge key={`${item.title}-${tag}`} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </Card>
            );

            if (!item.external) {
              return (
                <Link key={item.title} href={item.href} className="block">
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
    </>
  );
}
