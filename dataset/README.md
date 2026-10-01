# MIVA Dataset Generator

Standalone TypeScript project that generates realistic test data for the MIVA E-Commerce Marketplace database.

> **⚠️ This project is independent from the Backend.** It does NOT modify any NestJS, Prisma, or Frontend files. All output is pure PostgreSQL SQL.

## Quick Start

```bash
# 1. Install dependencies
cd dataset
npm install

# 2. Generate SQL files
npm run generate

# 3. Check the output
ls output/
#   seed.sql           ← Main import file
#   validate.sql       ← Validation queries
#   reset_preview.sql  ← Safe reset script (after running preview-reset)
```

## Generated Data Volumes

| Entity            | Count      |
|-------------------|------------|
| Admin users       | 5          |
| Vendor users      | 25         |
| Customer users    | 120        |
| Categories        | 15         |
| Products          | ~400+      |
| Product Colors    | ~700+      |
| Product Variants  | ~2,000+    |
| Vouchers          | 65         |
| Carts             | 100        |
| Cart Items        | ~250       |
| Orders            | 800        |
| Order Details     | ~1,800     |
| Payments          | 800        |
| Status History    | ~2,400     |
| Reviews           | ~400       |

## How It Works

1. **Data files** (`data/`) contain curated Vietnamese categories, product catalogs, image URLs, and review templates.
2. **Generators** (`generators/`) use `@faker-js/faker` with a deterministic seed to produce data arrays.
3. **SQL Builder** (`utils/sqlBuilder.ts`) converts arrays into PostgreSQL-compatible INSERT statements.
4. **Orchestrator** (`scripts/generate.ts`) calls generators in FK dependency order and writes `output/seed.sql`.

### Insertion Order (FK-safe)

```
User → Category → Product → ProductColor → ProductVariant
→ Voucher → VoucherDetail(product) → Cart → CartItem
→ Order → OrderDetail → Payment → OrderStatusHistory
→ VoucherDetail(order) → Review
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run generate` | Generate `seed.sql` and `validate.sql` |
| `npm run preview-reset` | Generate `reset_preview.sql` (safe reset script) |
| `npm run validate-images` | Verify all product image URLs via HTTP |

## Importing into pgAdmin 4

1. Open **pgAdmin 4** and connect to your `db_miva` development database.
2. Right-click on the database → **Query Tool**.
3. Open `output/seed.sql` (File → Open).
4. Click **Execute** (▶️ or F5).
5. The entire import runs inside a `BEGIN…COMMIT` transaction. If any error occurs, no data is committed.
6. After import, open `output/validate.sql` and run it to verify data integrity.

## Safely Resetting Old Demo Data

```bash
# Generate the reset preview script
npm run preview-reset
```

Then in pgAdmin 4:

1. Open `output/reset_preview.sql`.
2. Run **Step 1** to verify the database name is `db_miva`.
3. Run **Step 2** to see existing record counts.
4. **BACKUP your database** before proceeding.
5. Uncomment the `DELETE` statements in **Step 3**.
6. Use `ROLLBACK` first to test safely, then change to `COMMIT`.
7. Import `seed.sql` to add fresh data.

> **⚠️ Never run the reset on a production database.**
> **⚠️ Never skip the backup step.**

## Increasing Data Volume

Edit `dataset/config/dataset.config.ts`:

```typescript
export const CONFIG = {
  counts: {
    customerUsers: 500,     // was 120
    orders: 3000,           // was 800
    reviewsTarget: 1500,    // was 400
    // ... adjust other counts
  },
};
```

Then re-run `npm run generate`.

## Validating Generated Data

After importing `seed.sql`, run the validation queries in pgAdmin:

1. Open `output/validate.sql`.
2. Execute all queries.
3. Check for:
   - ✅ Correct user counts by role
   - ✅ Products distributed across categories
   - ✅ No duplicate emails, slugs, or voucher codes
   - ✅ No orphan foreign keys
   - ✅ No negative stock or prices
   - ✅ Reviews only reference completed orders

## Validating Image URLs

```bash
npm run validate-images
```

This performs HTTP HEAD requests against all image URLs in `data/productImages.ts` and reports any broken links.

## Project Structure

```
dataset/
├── package.json              # Dependencies & scripts
├── tsconfig.json             # TypeScript config
├── config/
│   └── dataset.config.ts     # Volume settings, seed, constants
├── data/
│   ├── categories.ts         # 15 Vietnamese marketplace categories
│   ├── productCatalog.ts     # Product templates per category
│   ├── productImages.ts      # Real image URLs (Unsplash)
│   └── reviewTemplates.ts    # Vietnamese review templates
├── generators/
│   ├── users.generator.ts
│   ├── categories.generator.ts
│   ├── products.generator.ts
│   ├── productColors.generator.ts
│   ├── productVariants.generator.ts
│   ├── vouchers.generator.ts
│   ├── voucherDetails.generator.ts
│   ├── carts.generator.ts
│   ├── orders.generator.ts
│   ├── orderStatusHistory.generator.ts
│   ├── orderVoucherDetails.generator.ts
│   └── reviews.generator.ts
├── utils/
│   ├── faker.ts              # Deterministic Faker instance
│   ├── sqlBuilder.ts         # SQL INSERT builder
│   ├── validateImages.ts     # Image URL checker
│   └── validateDataset.ts    # Validation SQL generator
├── scripts/
│   ├── generate.ts           # Main orchestrator
│   └── previewReset.ts       # Reset preview generator
└── output/                   # Generated SQL files (gitignored)
    ├── seed.sql
    ├── validate.sql
    └── reset_preview.sql
```

## Important Rules

- ❌ **Do NOT modify** Backend files (`backend/`)
- ❌ **Do NOT modify** Frontend files (`frontend/`, `admin/`, `vendor/`)
- ❌ **Do NOT run** `prisma db push` or `prisma migrate`
- ❌ **Do NOT execute** SQL against the database without explicit permission
- ✅ All generated code stays inside `dataset/`
- ✅ All output is PostgreSQL 13 compatible SQL
- ✅ Data is deterministic (same seed = same output)

## Default Login Credentials

All generated users use the same password: **`admin123`**

| Role     | Email Pattern         | Count |
|----------|-----------------------|-------|
| Admin    | `admin1@miva.vn` …   | 5     |
| Vendor   | `vendor1@miva.vn` …  | 25    |
| Customer | faker-generated       | 120   |
