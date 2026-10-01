/**
 * Image URL validator — checks every URL in productImages.ts via HTTP HEAD.
 * Run: npm run validate-images
 */
import { PRODUCT_IMAGES } from '../data/productImages';

interface ValidationResult {
  url: string;
  category: string;
  status: number | 'error';
  ok: boolean;
  error?: string;
}

async function checkUrl(url: string): Promise<{ status: number | 'error'; ok: boolean; error?: string }> {
  try {
    const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    return { status: response.status, ok: response.ok };
  } catch (err) {
    return { status: 'error', ok: false, error: String(err) };
  }
}

async function main() {
  console.log('🔍 Validating product image URLs...\n');

  const results: ValidationResult[] = [];
  let total = 0;
  let passed = 0;
  let failed = 0;

  for (const [category, images] of Object.entries(PRODUCT_IMAGES)) {
    for (const img of images) {
      total++;
      const check = await checkUrl(img.url);
      results.push({ url: img.url, category, ...check });

      const icon = check.ok ? '✅' : '❌';
      console.log(`  ${icon} [${category}] ${check.status} — ${img.url}`);

      if (check.ok) passed++;
      else failed++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📊 Image Validation Report`);
  console.log(`   Total:  ${total}`);
  console.log(`   Passed: ${passed}`);
  console.log(`   Failed: ${failed}`);
  console.log('='.repeat(60));

  if (failed > 0) {
    console.log('\n❌ Failed URLs:');
    for (const r of results.filter((r) => !r.ok)) {
      console.log(`   [${r.category}] ${r.status} — ${r.url}`);
      if (r.error) console.log(`     Error: ${r.error}`);
    }
  }

  console.log('\nDone.');
}

main().catch(console.error);
