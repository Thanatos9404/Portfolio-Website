// Local dev server that mirrors production: serves static files, applies the
// headers, redirects and clean URLs from vercel.json, and runs /api/* handlers.
// Usage: npm run dev   (PORT=3000 by default)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT || 3000);
const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));
process.env.CONTACT_DRY_RUN ??= '1';

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.pdf': 'application/pdf', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml',
  '.webmanifest': 'application/manifest+json',
};
const loaded = new Map();
const BLOCKED = /^\/(scripts|node_modules|\.git|\.env|\.idea|package(-lock)?\.json|README\.md|vercel\.json)/;

// Convert Vercel path patterns (":slug", "(.*)", "(a|b)") into RegExps.
const toRegex = (src) => new RegExp(`^${src.replace(/:(\w+)/g, '([^/]+)')}$`);
const headerRules = config.headers.map((h) => ({ re: toRegex(h.source), headers: h.headers }));
const redirects = config.redirects.map((r) => ({ re: toRegex(r.source), ...r }));

function applyHeaders(res, pathname) {
  for (const rule of headerRules) if (rule.re.test(pathname)) rule.headers.forEach(({ key, value }) => res.setHeader(key, value));
  // Local only: keep the CSP but do not force HTTPS on localhost.
  const csp = res.getHeader('Content-Security-Policy');
  if (csp) res.setHeader('Content-Security-Policy', String(csp).replace('; upgrade-insecure-requests', ''));
  res.removeHeader('Strict-Transport-Security');
  // Local only: always serve fresh files while editing.
  if (process.env.DEV_CACHE !== '1') res.setHeader('Cache-Control', 'no-cache');
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', (c) => { size += c.length; if (size > 64 * 1024) { reject(new Error('too large')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

async function runApi(req, res, name) {
  const file = path.join(ROOT, 'api', `${name}.js`);
  if (!/^[a-z-]+$/.test(name) || !fs.existsSync(file)) { res.statusCode = 404; return res.end('Not found'); }
  // Reload a handler only when its file changes, so in-memory state (rate limits) behaves like a warm instance.
  const mtime = fs.statSync(file).mtimeMs;
  if (loaded.get(file) !== mtime) { delete require.cache[file]; loaded.set(file, mtime); }
  const handler = require(file);
  const raw = req.method === 'POST' ? await readBody(req) : '';
  const type = String(req.headers['content-type'] || '');
  if (type.includes('application/json')) { try { req.body = JSON.parse(raw || '{}'); } catch { req.body = raw; } }
  else if (type.includes('urlencoded')) req.body = Object.fromEntries(new URLSearchParams(raw));
  else req.body = raw;
  await handler(req, res);
}

// Compress text like Vercel does, so local Lighthouse runs match production.
const COMPRESSIBLE = /\.(html|css|js|mjs|json|svg|txt|xml|webmanifest)$/i;
function sendFile(res, file, status = 200, req) {
  res.statusCode = status;
  res.setHeader('Content-Type', TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream');
  const accept = String((req && req.headers['accept-encoding']) || '');
  const stream = fs.createReadStream(file);
  if (COMPRESSIBLE.test(file) && /\bbr\b/.test(accept)) {
    res.setHeader('Content-Encoding', 'br'); res.setHeader('Vary', 'Accept-Encoding');
    return stream.pipe(zlib.createBrotliCompress()).pipe(res);
  }
  if (COMPRESSIBLE.test(file) && /\bgzip\b/.test(accept)) {
    res.setHeader('Content-Encoding', 'gzip'); res.setHeader('Vary', 'Accept-Encoding');
    return stream.pipe(zlib.createGzip()).pipe(res);
  }
  return stream.pipe(res);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let pathname = decodeURIComponent(url.pathname);
  try {
    if (pathname.startsWith('/api/')) {
      applyHeaders(res, pathname);
      return await runApi(req, res, pathname.slice(5).replace(/\/$/, ''));
    }
    // cleanUrls: /foo.html -> /foo
    if (pathname.endsWith('.html') && pathname !== '/index.html') {
      res.statusCode = 308; res.setHeader('Location', pathname.slice(0, -5)); return res.end();
    }
    for (const r of redirects) {
      if (r.re.test(pathname)) { res.statusCode = r.permanent ? 308 : 307; res.setHeader('Location', r.destination); return res.end(); }
    }
    if (BLOCKED.test(pathname)) { applyHeaders(res, pathname); return sendFile(res, path.join(ROOT, '404.html'), 404, req); }

    let file = path.join(ROOT, pathname);
    if (!file.startsWith(ROOT)) { res.statusCode = 400; return res.end(); }
    if (pathname === '/' ) file = path.join(ROOT, 'index.html');
    else if (!path.extname(file) && fs.existsSync(`${file}.html`)) file = `${file}.html`;

    applyHeaders(res, pathname);
    if (fs.existsSync(file) && fs.statSync(file).isFile()) return sendFile(res, file, 200, req);
    return sendFile(res, path.join(ROOT, '404.html'), 404, req);
  } catch (err) {
    console.error(err);
    res.statusCode = 500; res.end('Server error');
  }
});

server.listen(PORT, () => console.log(`Portfolio running at http://localhost:${PORT}`));
