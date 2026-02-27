import { NextResponse } from "next/server";

import { downloadObjectFromObjectStorage } from "@/lib/object-storage";

type UploadRouteProps = {
  params: Promise<{ key: string[] }>;
};

export async function GET(_request: Request, { params }: UploadRouteProps) {
  const resolved = await params;
  const key = resolved.key?.join("/")?.trim();

  if (!key) {
    return NextResponse.json({ error: "Object key is required" }, { status: 400 });
  }

  try {
    const object = await downloadObjectFromObjectStorage(key);
    return new NextResponse(new Uint8Array(object.data), {
      status: 200,
      headers: {
        "content-type": object.contentType,
        "cache-control": "public, max-age=31536000, immutable",
        ...(object.contentLength ? { "content-length": String(object.contentLength) } : {}),
        ...(object.eTag ? { etag: object.eTag } : {}),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Image fetch failed";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
