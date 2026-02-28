import { SITE_LINKS } from "@/lib/site-links";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-foreground">Heejoon Yi</p>
          <p>Product-minded engineer building thoughtful web experiences.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          {SITE_LINKS.map((item) => (
            <a key={item.label} className="hover:text-foreground" href={item.href}>
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
