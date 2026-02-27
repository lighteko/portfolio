export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-foreground">Heejoon Yi</p>
          <p>Product-minded engineer building thoughtful web experiences.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <a className="hover:text-foreground" href="https://github.com">
            GitHub
          </a>
          <a className="hover:text-foreground" href="https://linkedin.com">
            LinkedIn
          </a>
          <a className="hover:text-foreground" href="mailto:hello@example.com">
            Email
          </a>
        </div>
      </div>
    </footer>
  );
}
