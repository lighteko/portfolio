"use server";

import { redirect } from "next/navigation";

import { isAdminAuthConfigured, signInAdmin } from "@/lib/admin-auth";

export async function loginAction(formData: FormData) {
  if (!isAdminAuthConfigured()) {
    redirect("/admin/login?error=config");
  }

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const success = await signInAdmin(email, password);

  if (!success) {
    redirect("/admin/login?error=invalid");
  }

  redirect("/");
}
