// GET /api/stats
// Live counters for the page (GitHub stars, merged PRs, latest PyPI release).
// Cached at the edge for an hour so the page never hits upstream rate limits.
// Optional GITHUB_TOKEN (read-only, no scopes) raises GitHub's limits.

const USER = 'Thanatos9404';
const REPO = 'Thanatos9404/llmslim';
const PACKAGE = 'llmslim';

async function getJson(url, headers) {
  const r = await fetch(url, { headers, signal: AbortSignal.timeout(4500) });
  if (!r.ok) throw new Error(`${r.status}`);
  return r.json();
}

module.exports = async function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET, HEAD');
    return res.end();
  }

  const gh = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'yashvardhan.tech',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (process.env.GITHUB_TOKEN) gh.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const search = (q) => `https://api.github.com/search/issues?per_page=1&q=${encodeURIComponent(q)}`;

  const [repo, merged, opened, pypi] = await Promise.allSettled([
    getJson(`https://api.github.com/repos/${REPO}`, gh),
    getJson(search(`author:${USER} type:pr is:merged -user:${USER}`), gh),
    getJson(search(`author:${USER} type:pr -user:${USER}`), gh),
    getJson(`https://pypi.org/pypi/${PACKAGE}/json`, { Accept: 'application/json' }),
  ]);

  const out = { llmslim: {}, oss: {}, updatedAt: new Date().toISOString() };
  if (repo.status === 'fulfilled') {
    out.llmslim.stars = repo.value.stargazers_count;
    out.llmslim.forks = repo.value.forks_count;
  }
  if (pypi.status === 'fulfilled' && pypi.value.info) {
    out.llmslim.version = `v${pypi.value.info.version}`;
    out.llmslim.releases = Object.keys(pypi.value.releases || {}).length;
  }
  if (merged.status === 'fulfilled') out.oss.merged = merged.value.total_count;
  if (opened.status === 'fulfilled') out.oss.opened = opened.value.total_count;

  const complete = [repo, merged, opened, pypi].every((r) => r.status === 'fulfilled');
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  // Partial results are cached briefly so a transient upstream error heals quickly.
  res.setHeader('Cache-Control', complete
    ? 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400'
    : 'public, max-age=60, s-maxage=120');
  return res.end(req.method === 'HEAD' ? undefined : JSON.stringify(out));
};
