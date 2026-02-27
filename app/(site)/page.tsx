import Link from "next/link";
import { BriefcaseBusiness, Code2, FolderKanban, Newspaper, Sparkles, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { listPortfolioExperiences, listPortfolioProjects } from "@/lib/admin-cms";
import { getAdminSessionEmail } from "@/lib/admin-auth";
import { saveSiteInlineAction } from "@/lib/inline-admin-actions";
import { getPublishedContent } from "@/lib/content";
import { getPortfolioSections } from "@/lib/portfolio";

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
  const linksList =
    Array.isArray(sections.links?.items) && sections.links.items.length > 0
      ? sections.links.items
      : [
          { label: "GitHub", href: "https://github.com" },
          { label: "LinkedIn", href: "https://linkedin.com" },
          { label: "Email", href: "mailto:hello@example.com" },
          { label: "Blog", href: "/blog" },
        ];
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
  const experienceList =
    experiences.length > 0
      ? experiences.map((item) => ({
          org: item.org,
          role: item.role,
          period: item.start_date ? `${item.start_date} - ${item.end_date || "Present"}` : item.end_date || "",
          points: item.bullets ?? [],
        }))
      : [];

  const getProjectLinks = (links: unknown): Array<{ key: string; href: string }> => {
    if (!links || typeof links !== "object" || Array.isArray(links)) {
      return [];
    }

    const obj = links as Record<string, unknown>;
    return ["github", "demo", "docs"]
      .map((key) => ({ key, href: typeof obj[key] === "string" ? obj[key] : "" }))
      .filter((item) => Boolean(item.href));
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
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">{heroTitle}</h1>
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
              <Button size="lg" variant="outline">
                <FolderKanban />
                View projects
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

      <section id="projects" className="space-y-6">
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

            <Card className="border-dashed border-border/70 bg-card/50">
              <CardHeader>
                <CardTitle className="text-lg">Add Project</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <input name="newProjectTitle" form="site-edit-form" placeholder="Title" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                <input name="newProjectExcerpt" form="site-edit-form" placeholder="Excerpt" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                <textarea name="newProjectDescription" form="site-edit-form" placeholder="Description" className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                <input name="newProjectStackTags" form="site-edit-form" placeholder="Stack tags (comma separated)" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                <input name="newProjectThumbnailUrl" form="site-edit-form" placeholder="Thumbnail URL" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                <div className="grid gap-2 md:grid-cols-3">
                  <input name="newProjectGithubUrl" form="site-edit-form" placeholder="GitHub URL" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                  <input name="newProjectDemoUrl" form="site-edit-form" placeholder="Demo URL" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                  <input name="newProjectDocsUrl" form="site-edit-form" placeholder="Docs URL" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  <select name="newProjectPinned" form="site-edit-form" defaultValue="0" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="0">Not pinned</option>
                    <option value="1">Pinned</option>
                  </select>
                  <input name="newProjectSortOrder" form="site-edit-form" defaultValue="0" type="number" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                </div>
              </CardContent>
            </Card>
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

      <section id="experience" className="space-y-6">
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

            <Card className="border-dashed border-border/70 bg-card/50">
              <CardHeader>
                <CardTitle className="text-lg">Add Experience</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div className="grid gap-2 md:grid-cols-2">
                  <input name="newExperienceOrg" form="site-edit-form" placeholder="Organization" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                  <input name="newExperienceRole" form="site-edit-form" placeholder="Role" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                </div>
                <div className="grid gap-2 md:grid-cols-3">
                  <input name="newExperienceStartDate" form="site-edit-form" placeholder="Start (YYYY-MM)" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                  <input name="newExperienceEndDate" form="site-edit-form" placeholder="End (YYYY-MM)" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                  <input name="newExperienceSortOrder" form="site-edit-form" defaultValue="0" type="number" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                </div>
                <textarea name="newExperienceBullets" form="site-edit-form" placeholder="Bullets (one per line)" className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {experienceList.length === 0 ? (
              <Card className="border-border/70 bg-card/80">
                <CardContent className="py-8 text-sm text-muted-foreground">
                  No experiences yet.
                </CardContent>
              </Card>
            ) : null}
            {experienceList.map((item) => (
              <Card key={`${item.org}-${item.role}`} className="border-border/70 bg-card/80">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {item.role} - {item.org}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{item.period}</p>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  {item.points.map((point) => (
                    <p key={point}>- {point}</p>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Links</h2>
          <Separator className="hidden w-24 lg:block" />
        </div>
        <div className="flex flex-wrap gap-4 text-sm font-medium">
          {linksList.map((item) => (
            <Link key={item.label} className="underline-offset-4 hover:underline" href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
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
          {blogPreview.map((item) => {
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
                <CardHeader>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{item.date}</span>
                    <Badge variant="secondary">{item.type}</Badge>
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  {item.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.tags.map((tag) => (
                        <Badge key={`${item.title}-${tag}`} variant="outline">
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

