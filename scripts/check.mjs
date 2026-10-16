// Pre-deploy checks: CSP hashes, broken local links, inline style/handlers, and banned dashes.
// Usage: npm run check
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP_DIRS = new Set(['.git', 'node_modules', '.idea', '.vscode', '.vercel', '.claude', 'lighthouse']);
const errors = [];

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const files = walk(ROOT);
const rel = (f) => path.relative(ROOT, f).replace(/\\/g, '/');
const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));
const csp = config.headers.flatMap((h) => h.headers).find((h) => h.key === 'Content-Security-Policy').value;
const scriptSrc = (csp.match(/script-src([^;]*)/) || [])[1] || '';

for (const file of files.filter((f) => f.endsWith('.html'))) {
  const html = fs.readFileSync(file, 'utf8');
  const name = rel(file);

  // Inline scripts must be allowed by hash; JSON-LD is data and never executes.
  for (const m of html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/application\/ld\+json/.test(m[1])) continue;
    const hash = crypto.createHash('sha256').update(m[2], 'utf8').digest('base64');
    if (!scriptSrc.includes(`'sha256-${hash}'`)) errors.push(`${name}: inline script hash sha256-${hash} missing from CSP`);
  }
  if (/\sstyle\s*=/.test(html)) errors.push(`${name}: inline style attribute (blocked by CSP)`);
  if (/\son[a-z]+\s*=/.test(html)) errors.push(`${name}: inline event handler (blocked by CSP)`);
  if (/<style[\s>]/.test(html)) errors.push(`${name}: <style> block (blocked by CSP)`);

  // Every local reference must exist.
  const refs = [...html.matchAll(/\s(?:href|src)="([^"]+)"/g)].map((m) => m[1])
    .concat([...html.matchAll(/\ssrcset="([^"]+)"/g)].flatMap((m) => m[1].split(',').map((s) => s.trim().split(/\s+/)[0])));
  for (const ref of refs) {
    if (/^(https?:|mailto:|tel:|data:|#)/.test(ref) || ref.startsWith('/api/')) continue;
    const clean = ref.split(/[?#]/)[0];
    if (clean === '/' || clean === '') continue;
    const target = path.join(ROOT, clean.startsWith('/') ? clean.slice(1) : path.join(path.dirname(name), clean));
    if (!fs.existsSync(target)) errors.push(`${name}: missing local file ${ref}`);
  }
}

// House style: no em or en dashes anywhere in authored files.
const TEXT = /\.(html|css|js|mjs|json|md|txt|xml|webmanifest|svg)$/i;
const VENDORED = /(motion\.min\.js|LICENSE|\.txt$)/;
for (const file of files.filter((f) => TEXT.test(f) && !VENDORED.test(f))) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    if (/[\u2013\u2014]/.test(line)) errors.push(`${rel(file)}:${i + 1}: contains an em or en dash`);
  });
}

if (errors.length) {
  console.error(`✗ ${errors.length} problem(s):\n  ${errors.join('\n  ')}`);
  process.exit(1);
}
console.log(`✓ ${files.length} files checked: CSP hashes, local links, inline code and dashes are clean.`);
