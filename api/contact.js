// POST /api/contact
// Validates and rate-limits contact form submissions, then delivers them by email.
//
// Delivery, in order of preference:
//   RESEND_API_KEY (+ CONTACT_FROM on a verified domain)  -> Resend
//   FORMSPREE_FORM_ID                                      -> Formspree
// CONTACT_TO sets the inbox (default founder@llmslim.app).
// CONTACT_DRY_RUN=1 logs instead of sending (local testing).

const TOPICS = {
  project: 'Freelance or client project',
  llmslim: 'LLMSlim',
  collab: 'Collaboration, hiring or a talk',
  other: 'Something else',
};
const BUDGETS = {
  '': 'Not sure yet',
  'under-50k': 'Under ₹50,000',
  '50k-1l': '₹50,000 to ₹1,00,000',
  '1l-3l': '₹1,00,000 to ₹3,00,000',
  '3l-plus': '₹3,00,000 or more',
  usd: 'International, in USD',
};

const ALLOWED_HOSTS = new Set(['yashvardhan.tech', 'www.yashvardhan.tech', 'localhost:3000', '127.0.0.1:3000']);
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const MIN_FILL_MS = 2500;
const MAX_FORM_AGE_MS = 2 * 24 * 60 * 60 * 1000;
const EMAIL_RE = /^[^\s@<>"',;]{1,64}@[^\s@<>"',;]{1,190}\.[A-Za-z]{2,24}$/;

// Best effort: per warm instance. Honeypot and timing checks catch most bots anyway.
const hits = new Map();

function clientIp(req) {
  const fwd = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return fwd || String(req.headers['x-real-ip'] || '') || (req.socket && req.socket.remoteAddress) || 'unknown';
}

function rateLimited(ip) {
  const now = Date.now();
  for (const [k, v] of hits) if (now - v.start > WINDOW_MS) hits.delete(k);
  const entry = hits.get(ip) || { start: now, count: 0 };
  entry.count += 1;
  hits.set(ip, entry);
  return entry.count > MAX_PER_WINDOW;
}

function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true; // non-browser clients and some no-JS form posts omit Origin
  let host;
  try { host = new URL(origin).host; } catch { return false; }
  if (ALLOWED_HOSTS.has(host)) return true;
  // Vercel preview deployments of this project.
  if (/^[a-z0-9-]+\.vercel\.app$/i.test(host) && process.env.VERCEL_ENV !== 'production') return true;
  return host === req.headers.host;
}

const clean = (v, max) => String(v == null ? '' : v)
  .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
  .trim()
  .slice(0, max);
const oneLine = (v) => v.replace(/[\r\n]+/g, ' ');

function parseBody(req) {
  const b = req.body;
  if (b && typeof b === 'object') return b;
  if (typeof b === 'string') {
    try { return JSON.parse(b); } catch { return Object.fromEntries(new URLSearchParams(b)); }
  }
  return {};
}

function wantsHtml(req) {
  const accept = String(req.headers.accept || '');
  return accept.includes('text/html') && !accept.includes('application/json');
}

function reply(req, res, status, payload) {
  if (wantsHtml(req)) {
    res.statusCode = 303;
    res.setHeader('Location', payload.ok ? '/?sent=1#contact' : '/?error=1#contact');
    return res.end();
  }
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.end(JSON.stringify(payload));
}

async function deliver(msg) {
  const to = process.env.CONTACT_TO || 'founder@llmslim.app';
  const subject = oneLine(`[yashvardhan.tech] ${msg.topicLabel} from ${msg.name}`).slice(0, 180);
  const text = [
    `Name: ${msg.name}`,
    `Email: ${msg.email}`,
    `Topic: ${msg.topicLabel}`,
    `Budget: ${msg.budgetLabel}`,
    '',
    msg.message,
    '',
    `Sent ${new Date().toISOString()} from yashvardhan.tech`,
  ].join('\n');

  if (process.env.CONTACT_DRY_RUN === '1') {
    console.log('[contact:dry-run]', JSON.stringify({ to, subject, replyTo: msg.email, chars: text.length }));
    return true;
  }

  const signal = AbortSignal.timeout(8000);

  if (process.env.RESEND_API_KEY) {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM || 'Portfolio <contact@yashvardhan.tech>',
        to: [to],
        reply_to: msg.email,
        subject,
        text,
      }),
      signal,
    });
    if (!r.ok) console.error('[contact] resend failed', r.status);
    return r.ok;
  }

  const formId = process.env.FORMSPREE_FORM_ID || 'meozqqoj';
  if (!/^[a-z0-9]{6,12}$/i.test(formId)) return false;
  const r = await fetch(`https://formspree.io/f/${formId}`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: msg.name,
      email: msg.email,
      _replyto: msg.email,
      _subject: subject,
      topic: msg.topicLabel,
      budget: msg.budgetLabel,
      message: msg.message,
    }),
    signal,
  });
  if (!r.ok) console.error('[contact] formspree failed', r.status);
  return r.ok;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.end();
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return reply(req, res, 405, { ok: false, error: 'Method not allowed.' });
  }
  if (!sameOrigin(req)) return reply(req, res, 403, { ok: false, error: 'Forbidden.' });

  const type = String(req.headers['content-type'] || '');
  if (!/application\/json|application\/x-www-form-urlencoded|multipart\/form-data/.test(type)) {
    return reply(req, res, 415, { ok: false, error: 'Unsupported content type.' });
  }
  if (Number(req.headers['content-length'] || 0) > 32 * 1024) {
    return reply(req, res, 413, { ok: false, error: 'Message is too long.' });
  }

  const ip = clientIp(req);
  if (rateLimited(ip)) {
    res.setHeader('Retry-After', String(Math.ceil(WINDOW_MS / 1000)));
    return reply(req, res, 429, { ok: false, error: 'Too many messages. Please try again later or email hello@ameyor.in.' });
  }

  let body;
  try { body = parseBody(req); } catch { body = {}; }

  // Bots: filled honeypot or impossible timing. Pretend success so they do not retry.
  const ts = Number(body.ts || 0);
  const age = Date.now() - ts;
  if (clean(body.company, 200) || (ts && (age < MIN_FILL_MS || age > MAX_FORM_AGE_MS))) {
    return reply(req, res, 200, { ok: true });
  }

  const name = oneLine(clean(body.name, 100));
  const email = clean(body.email, 254).toLowerCase();
  const message = clean(body.message, 5000);
  const topic = Object.prototype.hasOwnProperty.call(TOPICS, body.topic) ? body.topic : 'other';
  const budget = Object.prototype.hasOwnProperty.call(BUDGETS, body.budget || '') ? (body.budget || '') : '';

  if (!name) return reply(req, res, 400, { ok: false, error: 'Please add your name.' });
  if (!EMAIL_RE.test(email)) return reply(req, res, 400, { ok: false, error: 'Please add a valid email.' });
  if (message.length < 10) return reply(req, res, 400, { ok: false, error: 'A few more words in the message, please.' });
  if ((message.match(/https?:\/\//g) || []).length > 6) {
    return reply(req, res, 400, { ok: false, error: 'Too many links in the message.' });
  }

  try {
    const sent = await deliver({ name, email, message, topicLabel: TOPICS[topic], budgetLabel: BUDGETS[budget] });
    if (!sent) return reply(req, res, 502, { ok: false, error: 'Could not send right now. Please email hello@ameyor.in instead.' });
    return reply(req, res, 200, { ok: true });
  } catch (err) {
    console.error('[contact] error', err && err.name);
    return reply(req, res, 502, { ok: false, error: 'Could not send right now. Please email hello@ameyor.in instead.' });
  }
};
