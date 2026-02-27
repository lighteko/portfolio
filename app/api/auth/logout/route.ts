import { NextResponse } from "next/server";

import { signOutAdmin } from "@/lib/admin-auth";

export async function POST(request: Request) {
  await signOutAdmin();
  const url = new URL("/", request.url);
  return NextResponse.redirect(url, { status: 303 });
}
