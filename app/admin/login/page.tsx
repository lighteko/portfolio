import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAdminSessionEmail } from "@/lib/admin-auth";

import { loginAction } from "./actions";

type AdminLoginPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

function getErrorMessage(error?: string): string | null {
  if (error === "config") {
    return "Admin auth is not configured. Set ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_SESSION_SECRET.";
  }

  if (error === "invalid") {
    return "Invalid email or password.";
  }

  return null;
}

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const sessionEmail = await getAdminSessionEmail();
  if (sessionEmail) {
    redirect("/");
  }

  const params = (await searchParams) ?? {};
  const message = getErrorMessage(params.error);

  return (
    <div className="mx-auto flex min-h-[80vh] w-full max-w-md items-center">
      <Card className="w-full border-border/70 bg-card/80">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={loginAction} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="admin@portfolio.io" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" placeholder="********" required />
            </div>
            <Button className="w-full" type="submit">
              Sign in
            </Button>
            {message ? <p className="text-xs text-destructive">{message}</p> : null}
            <p className="text-xs text-muted-foreground">Access restricted to administrators only.</p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
