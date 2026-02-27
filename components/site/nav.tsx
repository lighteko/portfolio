"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Check, Pencil, Shield, X } from "lucide-react";

import { Button } from "@/components/ui/button";

const links = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/#projects", label: "Projects" },
  { href: "/#experience", label: "Experience" },
];

type SiteNavProps = {
  isAdmin: boolean;
};

export function SiteNav({ isAdmin }: SiteNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isHome = pathname === "/";
  const isEditingSite = isAdmin && pathname === "/" && searchParams.get("manage") === "portfolio";

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Heejoon Yi
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {isAdmin ? (
            <>
              {isEditingSite ? (
                <>
                  <Button variant="default" type="submit" form="site-edit-form" className="hidden sm:inline-flex">
                    <Check />
                    Save
                  </Button>
                  <Button variant="outline" asChild className="hidden sm:inline-flex">
                    <Link href="/">
                      <X />
                      Cancel
                    </Link>
                  </Button>
                </>
              ) : isHome ? (
                <Button variant="ghost" asChild className="hidden sm:inline-flex">
                  <Link href="/?manage=portfolio">
                    <Pencil />
                    Edit Site
                  </Link>
                </Button>
              ) : null}
              <form action="/api/auth/logout" method="post">
                <Button variant="ghost" type="submit" className="hidden sm:inline-flex">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/admin/login">
                <Shield />
                Admin
              </Link>
            </Button>
          )}
          <Button variant="outline" className="hidden sm:inline-flex">
            Resume
          </Button>
          <Button>Contact</Button>
        </div>
      </div>
    </header>
  );
}
