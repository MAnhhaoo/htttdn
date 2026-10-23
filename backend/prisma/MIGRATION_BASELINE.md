# Migration baseline — 23/10/2026

The previous migration directory did not match the existing `ecommerce`
database: two applied migrations had no SQL files in the repository, and one
local employee migration had never been applied. The 31 old migration folders
are preserved in `migrations_legacy_20261023/` for audit. They are not part of
the active Prisma migration chain.

The active `migrations/20261023000000_baseline_current_schema/` migration was
generated from `schema.prisma` and successfully deployed to a fresh PostgreSQL
database. It is the starting point for **new databases**. Future schema changes
must be added as migrations after this baseline.

For the existing local `ecommerce` database, a full `pg_dump` backup was saved
at `C:\DoAnHTTDN\_qa_monolith\ecommerce_before_migration_sync_20261023.dump`.
The 32 legacy rows in `_prisma_migrations` were replaced with one applied
baseline row. Application records were not modified. The existing Vendor
`address` column is represented in Prisma, and the database default for
`commissionRate` was aligned with the schema at 8.0.

Existing databases that still use the old history must be checked against
`schema.prisma` before marking this baseline as applied. Do not run the baseline
SQL against a populated database, and do not replace its migration history
without a verified backup and a matching schema.
