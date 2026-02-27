import Link from "next/link";
import { AlertTriangle, ArrowLeft, Home } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center px-6 py-12">
      <Card className="w-full border-border/70 bg-card/80">
        <CardHeader className="space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">404</p>
          <CardTitle className="flex items-center gap-2 text-3xl">
            <AlertTriangle className="size-7 text-amber-500" />
            Page Not Found
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            The page you requested does not exist or is no longer available.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/">
                <Home />
                Go Home
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/blog">
                <ArrowLeft />
                Back to Blog
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
