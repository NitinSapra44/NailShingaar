/**
 * Database URL Updater
 *
 * After running migrate-to-cloudinary.js, run this script to
 * replace all old Supabase storage URLs in your database with
 * the new Cloudinary URLs.
 *
 * Usage:
 *   1. Put your DATABASE_URL in .env (see .env.example)
 *   2. npm install
 *   3. node update-db-urls.js
 *
 * The script does a DRY RUN first — review the changes before applying.
 */

require('dotenv').config();

const { Client } = require('pg');
const fs = require('fs');

// ─── CONFIGURATION ────────────────────────────────────────────────────────────
const DATABASE_URL = process.env.DATABASE_URL || 'YOUR_POSTGRES_CONNECTION_STRING';

// Columns that store image/file URLs in this schema.
// `array: true` marks Postgres TEXT[] columns (products.images, orders.nail_photos)
// which need array_replace() instead of a plain equality UPDATE.
const IMAGE_COLUMNS = [
  { table: 'categories',  column: 'image_url' },
  { table: 'products',    column: 'image_url' },
  { table: 'products',    column: 'images', array: true },
  { table: 'orders',      column: 'payment_screenshot' },
  { table: 'orders',      column: 'nail_photos', array: true },
  { table: 'blog_posts',  column: 'cover_image_url' },
];

const MAPPING_FILE = './cloudinary-url-mapping.json';
const DRY_RUN = true;   // ← Set to false to actually apply changes
// ──────────────────────────────────────────────────────────────────────────────

async function processScalarColumn(client, table, column, validMappings, dryRun) {
  let updated = 0;
  for (const [oldUrl, newUrl] of validMappings) {
    const findResult = await client.query(
      `SELECT id FROM "${table}" WHERE "${column}" = $1`,
      [oldUrl]
    );

    if (findResult.rows.length > 0) {
      console.log(`  ${findResult.rows.length} row(s): ${oldUrl}`);
      console.log(`    → ${newUrl}`);

      if (!dryRun) {
        await client.query(
          `UPDATE "${table}" SET "${column}" = $1 WHERE "${column}" = $2`,
          [newUrl, oldUrl]
        );
      }
      updated += findResult.rows.length;
    }
  }
  return updated;
}

async function processArrayColumn(client, table, column, validMappings, dryRun) {
  let updated = 0;
  for (const [oldUrl, newUrl] of validMappings) {
    const findResult = await client.query(
      `SELECT id FROM "${table}" WHERE $1 = ANY("${column}")`,
      [oldUrl]
    );

    if (findResult.rows.length > 0) {
      console.log(`  ${findResult.rows.length} row(s) contain: ${oldUrl}`);
      console.log(`    → ${newUrl}`);

      if (!dryRun) {
        await client.query(
          `UPDATE "${table}" SET "${column}" = array_replace("${column}", $1, $2) WHERE $1 = ANY("${column}")`,
          [oldUrl, newUrl]
        );
      }
      updated += findResult.rows.length;
    }
  }
  return updated;
}

async function main() {
  if (!fs.existsSync(MAPPING_FILE)) {
    console.error(`❌ Mapping file not found: ${MAPPING_FILE}`);
    console.error('   Run migrate-to-cloudinary.js first.');
    process.exit(1);
  }

  if (DATABASE_URL === 'YOUR_POSTGRES_CONNECTION_STRING') {
    console.error('\n❌ Please set DATABASE_URL before running.');
    process.exit(1);
  }

  const urlMapping = JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf-8'));
  const validMappings = Object.entries(urlMapping).filter(([k]) => !k.startsWith('ERROR:'));

  console.log('🔄 Database URL Updater');
  console.log('========================');
  console.log(`Loaded ${validMappings.length} URL mappings`);
  console.log(DRY_RUN ? '🔍 DRY RUN mode — no changes will be made\n' : '⚡ LIVE mode — changes will be applied\n');

  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  let totalUpdated = 0;

  for (const { table, column, array } of IMAGE_COLUMNS) {
    console.log(`\n📋 ${table}.${column}${array ? ' (array)' : ''}`);
    const tableUpdated = array
      ? await processArrayColumn(client, table, column, validMappings, DRY_RUN)
      : await processScalarColumn(client, table, column, validMappings, DRY_RUN);

    if (tableUpdated === 0) {
      console.log('  (no matching URLs found)');
    } else {
      totalUpdated += tableUpdated;
    }
  }

  await client.end();

  console.log('\n========================');
  if (DRY_RUN) {
    console.log(`🔍 Dry run complete — ${totalUpdated} row(s) would be updated`);
    console.log('\nTo apply changes, set DRY_RUN = false and run again.');
  } else {
    console.log(`✅ Done — ${totalUpdated} row(s) updated`);
  }
}

main().catch(console.error);
