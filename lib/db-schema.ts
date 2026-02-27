function quoteIdent(value: string): string {
  return `"${value.replace(/"/g, "\"\"")}"`;
}

function getSchemaName(): string {
  const raw = process.env.PG_SCHEMA?.trim();
  return raw || "public";
}

export function tableName(table: string): string {
  return `${quoteIdent(getSchemaName())}.${quoteIdent(table)}`;
}
