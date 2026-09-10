/**
 * Supabase Storage → Cloudinary Migration Script
 *
 * Migrates files from Supabase buckets to Cloudinary and
 * generates a URL mapping file for updating your database.
 *
 * Usage:
 *   1. Put your credentials in .env (see .env.example)
 *   2. npm install
 *   3. node migrate-to-cloudinary.js
 */

require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const https = require('https');
const http = require('http');

// ─── CONFIGURATION ────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://mxehvcoednjpvukibjla.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'YOUR_SUPABASE_SERVICE_ROLE_KEY';

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'YOUR_CLOUD_NAME';
const CLOUDINARY_API_KEY    = process.env.CLOUDINARY_API_KEY    || 'YOUR_API_KEY';
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || 'YOUR_API_SECRET';

// Buckets to migrate
const BUCKETS = ['product-images', 'nail-photos', 'payment-screenshots'];

// Output file with old → new URL mapping (use this to update your DB)
const MAPPING_OUTPUT = './cloudinary-url-mapping.json';
// ──────────────────────────────────────────────────────────────────────────────

// Init clients
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key:    CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

// Helper: download file from URL into a Buffer
function downloadBuffer(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    lib.get(url, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

// Helper: upload buffer to Cloudinary
function uploadToCloudinary(buffer, publicId, folder) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        folder: `nail-shingaar/${folder}`,
        overwrite: true,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
}

// List all files in a Supabase bucket (handles pagination)
async function listAllFiles(bucket) {
  const files = [];
  const folders = [''];

  while (folders.length > 0) {
    const folder = folders.pop();
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder, { limit: 1000 });

    if (error) {
      console.error(`  ⚠ Error listing ${bucket}/${folder}:`, error.message);
      continue;
    }

    for (const item of data || []) {
      if (item.id === null) {
        // It's a folder
        folders.push(folder ? `${folder}/${item.name}` : item.name);
      } else {
        // It's a file
        files.push(folder ? `${folder}/${item.name}` : item.name);
      }
    }
  }

  return files;
}

async function migrateBucket(bucket, urlMapping) {
  console.log(`\n📦 Bucket: ${bucket}`);
  const files = await listAllFiles(bucket);

  if (files.length === 0) {
    console.log('  (empty — skipping)');
    return;
  }

  console.log(`  Found ${files.length} file(s)`);

  for (const filePath of files) {
    try {
      // Get public URL from Supabase
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      // Build a clean Cloudinary public_id (no extension, no slashes issue)
      const publicId = filePath.replace(/\.[^/.]+$/, '').replace(/\//g, '_');

      process.stdout.write(`  ↑ ${filePath} ... `);

      // Download from Supabase
      const buffer = await downloadBuffer(publicUrl);

      // Upload to Cloudinary
      const result = await uploadToCloudinary(buffer, publicId, bucket);

      // Save mapping
      urlMapping[publicUrl] = result.secure_url;

      console.log(`✅ ${result.secure_url}`);
    } catch (err) {
      console.log(`❌ FAILED: ${err.message}`);
      urlMapping[`ERROR:${bucket}/${filePath}`] = err.message;
    }
  }
}

async function main() {
  console.log('🚀 Supabase → Cloudinary Migration');
  console.log('=====================================');

  // Validate credentials
  if (SUPABASE_SERVICE_KEY === 'YOUR_SUPABASE_SERVICE_ROLE_KEY') {
    console.error('\n❌ Please set your SUPABASE_SERVICE_KEY before running.');
    console.error('   Get it from: Supabase Dashboard → Project Settings → API → service_role key');
    process.exit(1);
  }
  if (CLOUDINARY_CLOUD_NAME === 'YOUR_CLOUD_NAME') {
    console.error('\n❌ Please set your Cloudinary credentials before running.');
    process.exit(1);
  }

  const urlMapping = {};

  for (const bucket of BUCKETS) {
    await migrateBucket(bucket, urlMapping);
  }

  // Save URL mapping
  fs.writeFileSync(MAPPING_OUTPUT, JSON.stringify(urlMapping, null, 2));

  const successCount = Object.keys(urlMapping).filter(k => !k.startsWith('ERROR:')).length;
  const errorCount   = Object.keys(urlMapping).filter(k =>  k.startsWith('ERROR:')).length;

  console.log('\n=====================================');
  console.log(`✅ Migrated: ${successCount} files`);
  if (errorCount > 0) console.log(`❌ Failed:   ${errorCount} files`);
  console.log(`\n📄 URL mapping saved to: ${MAPPING_OUTPUT}`);
  console.log('\nNext step: use the mapping file to update image URLs in your database.');
  console.log('Run: node update-db-urls.js');
}

main().catch(console.error);
