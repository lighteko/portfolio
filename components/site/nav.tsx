"use client";

import type { MouseEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, Mail, MapPin, Pencil, Phone, Shield, X } from "lucide-react";

import { Button } from "@/components/ui/button";

type SiteNavProps = {
  isAdmin: boolean;
};

const NAV_TEXT = {
  home: "Home",
  blog: "Blog",
  tutoring: "Tutoring",
  projects: "Projects",
  experience: "Experience",
  save: "Save",
  cancel: "Cancel",
  editSite: "Edit Site",
  signOut: "Sign out",
  admin: "Admin",
  contact: "Contact",
  contactTitle: "Contact",
  contactDesc: "Feel free to reach out using the details below.",
  close: "Close",
  emailLabel: "Email",
  locationLabel: "Location",
  phoneLabel: "Phone",
  locationValue: "Seoul, South Korea",
  phoneHref: "+821027684973",
  phoneDisplay: "+82 10-2768-4973",
};

export function SiteNav({ isAdmin }: SiteNavProps) {
  const text = NAV_TEXT;
  const [isContactOpen, setIsContactOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isHome = pathname === "/";
  const isEditingSite = isAdmin && pathname === "/" && searchParams.get("manage") === "portfolio";
  const links = [
    { href: "/", label: text.home },
    { href: "/blog", label: text.blog },
    { href: "/tutoring", label: text.tutoring },
    { href: "/#projects", label: text.projects, sectionId: "projects" },
    { href: "/#experience", label: text.experience, sectionId: "experience" },
  ];

  const scrollToSection = (sectionId: string): boolean => {
    const section = document.getElementById(sectionId);
    if (!section) {
      return false;
    }

    section.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `/#${sectionId}`);
    return true;
  };

  const handleSectionLinkClick = (event: MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    event.preventDefault();

    if (pathname !== "/") {
      router.push("/");
    }

    let attempts = 0;
    const maxAttempts = 80;
    const tick = () => {
      attempts += 1;
      if (scrollToSection(sectionId) || attempts >= maxAttempts) {
        return;
      }

      window.requestAnimationFrame(tick);
    };

    window.requestAnimationFrame(tick);
  };

  return (
    <>
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
                onClick={
                  item.sectionId
                    ? (event) => handleSectionLinkClick(event, item.sectionId as string)
                    : undefined
                }
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
                      {text.save}
                    </Button>
                    <Button variant="outline" asChild className="hidden sm:inline-flex">
                      <Link href="/">
                        <X />
                        {text.cancel}
                      </Link>
                    </Button>
                  </>
                ) : isHome ? (
                  <Button variant="ghost" asChild className="hidden sm:inline-flex">
                    <Link href="/?manage=portfolio">
                      <Pencil />
                      {text.editSite}
                    </Link>
                  </Button>
                ) : null}
                <form action="/api/auth/logout" method="post">
                  <Button variant="ghost" type="submit" className="hidden sm:inline-flex">
                    {text.signOut}
                  </Button>
                </form>
              </>
            ) : (
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link href="/admin/login">
                  <Shield />
                  {text.admin}
                </Link>
              </Button>
            )}
            <Button onClick={() => setIsContactOpen(true)}>{text.contact}</Button>
          </div>
        </div>
      </header>

      {isContactOpen ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
            onClick={() => setIsContactOpen(false)}
            aria-label={text.close}
          />
          <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border/70 bg-background p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">{text.contactTitle}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{text.contactDesc}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsContactOpen(false)} aria-label={text.close}>
                <X />
              </Button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">{text.emailLabel}:</span>
                <a className="underline-offset-4 hover:underline" href="mailto:dev.lighteko@gmail.com">
                  dev.lighteko@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">{text.locationLabel}:</span>
                <span>{text.locationValue}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">{text.phoneLabel}:</span>
                <a className="underline-offset-4 hover:underline" href={`tel:${text.phoneHref}`}>
                  {text.phoneDisplay}
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
