import { Pool, type QueryResult, type QueryResultRow } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __pgPoolKey: string | undefined;
}

const REQUIRED_ENV_KEYS = [
  "PG_HOST",
  "PG_PORT",
  "PG_USER",
  "PG_PASSWORD",
  "PG_DB",
] as const;

type RequiredEnvKey = (typeof REQUIRED_ENV_KEYS)[number];

function getMissingEnvKeys(): RequiredEnvKey[] {
  return REQUIRED_ENV_KEYS.filter((key) => !process.env[key]);
}

function getPoolConfig() {
  const missingKeys = getMissingEnvKeys();
  if (missingKeys.length > 0) {
    throw new Error(`Missing PG env vars: ${missingKeys.join(", ")}`);
  }

  const schema = process.env.PG_SCHEMA?.trim();
  const escapedSchema = schema ? `"${schema.replace(/"/g, "\"\"")}"` : null;
  const searchPath = escapedSchema ? `${escapedSchema},public` : "public";
  const options = `-c search_path=${searchPath}`;

  return {
    host: process.env.PG_HOST,
    port: Number(process.env.PG_PORT),
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DB,
    options,
  };
}

function getPoolKey() {
  return [
    process.env.PG_HOST,
    process.env.PG_PORT,
    process.env.PG_USER,
    process.env.PG_DB,
    process.env.PG_SCHEMA,
  ].join("|");
}

export function isPgConfigured(): boolean {
  return getMissingEnvKeys().length === 0;
}

function getPool(): Pool {
  const poolKey = getPoolKey();
  if (global.__pgPool && global.__pgPoolKey === poolKey) {
    return global.__pgPool;
  }

  if (global.__pgPool) {
    void global.__pgPool.end().catch(() => undefined);
  }

  const pool = new Pool(getPoolConfig());
  if (process.env.NODE_ENV !== "production") {
    global.__pgPool = pool;
    global.__pgPoolKey = poolKey;
  }

  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  return getPool().query<T>(text, params);
}
