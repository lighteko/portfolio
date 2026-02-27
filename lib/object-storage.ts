import { randomUUID } from "node:crypto";
import { Readable } from "node:stream";
import * as common from "oci-common";
import { ObjectStorageClient } from "oci-objectstorage";

function getRequiredEnv(
  name:
    | "OCI_REGION"
    | "OCI_TENANCY_OCID"
    | "OCI_USER_OCID"
    | "OCI_FINGERPRINT"
    | "OCI_PRIVATE_KEY"
    | "OCI_NAMESPACE"
    | "OCI_BUCKET_NAME"
): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value.trim();
}

function sanitizeFileName(fileName: string): string {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, "-")
    .replace(/-+/g, "-");
}

function normalizePrivateKey(value: string): string {
  return value.replace(/^['"]|['"]$/g, "").replace(/\\n/g, "\n");
}

function encodeObjectKey(objectKey: string): string {
  return objectKey
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

let cachedClient: ObjectStorageClient | null = null;

function getObjectStorageClient(): ObjectStorageClient {
  if (cachedClient) {
    return cachedClient;
  }

  const regionId = getRequiredEnv("OCI_REGION");
  const tenancy = getRequiredEnv("OCI_TENANCY_OCID");
  const user = getRequiredEnv("OCI_USER_OCID");
  const fingerprint = getRequiredEnv("OCI_FINGERPRINT");
  const privateKey = normalizePrivateKey(getRequiredEnv("OCI_PRIVATE_KEY"));
  const passphrase = process.env.OCI_PRIVATE_KEY_PASSPHRASE?.trim() || null;

  const authProvider = new common.SimpleAuthenticationDetailsProvider(
    tenancy,
    user,
    fingerprint,
    privateKey,
    passphrase,
    common.Region.fromRegionId(regionId)
  );

  cachedClient = new ObjectStorageClient({ authenticationDetailsProvider: authProvider });
  return cachedClient;
}

function buildPublicUrl(objectKey: string): string {
  const customPublicBase = process.env.OCI_PUBLIC_BASE_URL?.trim().replace(/\/+$/, "");
  const encodedKey = encodeObjectKey(objectKey);

  if (customPublicBase) {
    return `${customPublicBase}/${encodedKey}`;
  }
  return `/api/uploads/${encodedKey}`;
}

export async function uploadImageToObjectStorage(file: File): Promise<string> {
  const namespace = getRequiredEnv("OCI_NAMESPACE");
  const bucket = getRequiredEnv("OCI_BUCKET_NAME");

  const today = new Date();
  const y = today.getUTCFullYear();
  const m = String(today.getUTCMonth() + 1).padStart(2, "0");
  const d = String(today.getUTCDate()).padStart(2, "0");
  const objectKey = `blog/${y}/${m}/${d}/${randomUUID()}-${sanitizeFileName(file.name || "image")}`;

  const client = getObjectStorageClient();
  await client.putObject({
    namespaceName: namespace,
    bucketName: bucket,
    objectName: objectKey,
    putObjectBody: Buffer.from(await file.arrayBuffer()),
    contentType: file.type || "application/octet-stream",
  });

  return buildPublicUrl(objectKey);
}

async function streamToBuffer(streamLike: Readable | ReadableStream): Promise<Buffer> {
  if (streamLike instanceof Readable) {
    const chunks: Buffer[] = [];
    for await (const chunk of streamLike) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  const arrayBuffer = await new Response(streamLike).arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function downloadObjectFromObjectStorage(objectKey: string): Promise<{
  data: Buffer;
  contentType: string;
  contentLength: number | null;
  eTag: string | null;
}> {
  const namespace = getRequiredEnv("OCI_NAMESPACE");
  const bucket = getRequiredEnv("OCI_BUCKET_NAME");
  const client = getObjectStorageClient();

  const response = await client.getObject({
    namespaceName: namespace,
    bucketName: bucket,
    objectName: objectKey,
  });

  if (!response.value) {
    throw new Error("Object has no body");
  }

  return {
    data: await streamToBuffer(response.value),
    contentType: response.contentType || "application/octet-stream",
    contentLength: response.contentLength ?? null,
    eTag: response.eTag ?? null,
  };
}
