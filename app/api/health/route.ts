import { isPgConfigured, query } from "@/lib/db";

export async function GET() {
  if (!isPgConfigured()) {
    return Response.json({ ok: true, db: "not_configured" });
  }

  try {
    await query("select 1 as ok");
    return Response.json({ ok: true, db: "ok" });
  } catch (error) {
    return Response.json(
      { ok: false, db: "error", message: error instanceof Error ? error.message : "unknown" },
      { status: 500 }
    );
  }
}
