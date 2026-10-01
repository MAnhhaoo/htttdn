/**
 * PostgreSQL SQL builder utilities.
 * Handles proper escaping, array types, JSONB, enums, and NULL values.
 */

/** Escape single quotes for PostgreSQL string literals */
export function escapeString(str: string): string {
  return str.replace(/'/g, "''").replace(/\\/g, '\\\\');
}

/** Convert a JavaScript value to a PostgreSQL literal */
export function toSqlValue(value: unknown): string {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  if (typeof value === 'number') return String(value);
  if (value instanceof Date) return `'${value.toISOString()}'`;

  // PostgreSQL text[] array
  if (Array.isArray(value)) {
    if (value.length === 0) return "ARRAY[]::text[]";
    const items = value.map((v) => `'${escapeString(String(v))}'`).join(', ');
    return `ARRAY[${items}]`;
  }

  // JSONB object
  if (typeof value === 'object') {
    return `'${escapeString(JSON.stringify(value))}'::jsonb`;
  }

  // String (includes UUIDs, enum values, etc.)
  return `'${escapeString(String(value))}'`;
}

/**
 * Build a batched INSERT statement for a PostgreSQL table.
 * Rows are inserted in chunks to avoid excessively long statements.
 */
export function buildInsert(
  table: string,
  rows: Record<string, unknown>[],
  chunkSize = 500,
): string {
  if (rows.length === 0) return '';

  const columns = Object.keys(rows[0]);
  const columnList = columns.map((c) => `"${c}"`).join(', ');
  const chunks: string[] = [];

  for (let i = 0; i < rows.length; i += chunkSize) {
    const slice = rows.slice(i, i + chunkSize);
    const values = slice
      .map((row) => {
        const vals = columns.map((c) => toSqlValue(row[c]));
        return `  (${vals.join(', ')})`;
      })
      .join(',\n');

    chunks.push(`INSERT INTO "${table}" (${columnList}) VALUES\n${values};`);
  }

  return chunks.join('\n\n');
}

/** Build a section header comment for the SQL file */
export function sqlSection(title: string, count: number): string {
  const line = '='.repeat(60);
  return [
    '',
    `-- ${line}`,
    `-- ${title} (${count} records)`,
    `-- ${line}`,
    '',
  ].join('\n');
}

/** Build the complete SQL file with transaction wrapping */
export function buildSqlFile(sections: string[]): string {
  const header = [
    '-- ============================================================',
    '-- MIVA E-Commerce Marketplace — Dataset Seed',
    `-- Generated: ${new Date().toISOString()}`,
    '-- PostgreSQL 13 Compatible',
    '-- ============================================================',
    '',
    'BEGIN;',
    '',
  ].join('\n');

  const footer = [
    '',
    'COMMIT;',
    '',
    '-- ============================================================',
    '-- Import complete. Run validate.sql to verify data integrity.',
    '-- ============================================================',
    '',
  ].join('\n');

  return header + sections.join('\n') + footer;
}
