import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site/footer";
import { SiteNav } from "@/components/site/nav";
import { getAdminSessionEmail } from "@/lib/admin-auth";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const adminEmail = await getAdminSessionEmail();
  const isAdmin = Boolean(adminEmail);

  return (
    <div className="min-h-screen bg-background">
      <SiteNav isAdmin={isAdmin} />
      <div className="site-background site-grid">
        <main className="mx-auto flex w-full max-w-6xl flex-col gap-24 px-6 py-16">
          {children}
        </main>
      </div>
      <SiteFooter />
    </div>
  );
}
