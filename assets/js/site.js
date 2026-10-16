/* Site interactions. Everything here is progressive enhancement: the page works without it. */
(() => {
  'use strict';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

  $$('[data-mod-key]').forEach((k) => { k.textContent = isMac ? '⌘K' : 'Ctrl K'; });

  // ---------- Toast ----------
  const toastEl = $('[data-toast]');
  let toastTimer = 0;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1800);
  }

  // ---------- Theme ----------
  const systemLight = window.matchMedia('(prefers-color-scheme: light)');
  const effectiveTheme = () => root.getAttribute('data-theme') || (systemLight.matches ? 'light' : 'dark');
  function setTheme(next) {
    const apply = () => {
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) { /* ignore */ }
    };
    if (document.startViewTransition && !reduceMotion.matches) document.startViewTransition(apply);
    else apply();
  }
  const toggleTheme = () => setTheme(effectiveTheme() === 'dark' ? 'light' : 'dark');
  $$('[data-theme-toggle]').forEach((b) => b.addEventListener('click', toggleTheme));

  // ---------- Copy to clipboard ----------
  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.className = 'sr-only';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (err) { /* ignore */ }
      ta.remove();
    }
    toast(`Copied ${text}`);
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-copy]');
    if (b) { e.preventDefault(); copy(b.dataset.copy); }
  });

  // ---------- Header: scrolled state + active section ----------
  const header = $('.site-header');
  const onScroll = () => header && header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const navLinks = $$('.nav a');
  const sections = navLinks.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  let navRaf = 0;
  const syncNav = () => {
    navRaf = 0;
    const line = window.innerHeight * 0.4;
    let current = null;
    for (const s of sections) if (s.getBoundingClientRect().top <= line) current = s;
    navLinks.forEach((a) => {
      if (current && a.getAttribute('href') === `#${current.id}`) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  };
  if (sections.length) {
    window.addEventListener('scroll', () => { if (!navRaf) navRaf = requestAnimationFrame(syncNav); }, { passive: true });
    syncNav();
  }

  // ---------- Card spotlight ----------
  document.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    const card = e.target.closest && e.target.closest('.card');
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  }, { passive: true });

  // ---------- Video dialog ----------
  const vDialog = $('[data-video-dialog]');
  const vFrame = $('[data-video-frame]');
  const vTitle = $('[data-video-title]');
  const vExternal = $('[data-video-external]');
  function openVideo(spec, title, href) {
    if (!vDialog || typeof vDialog.showModal !== 'function') { window.open(href, '_blank', 'noopener'); return; }
    vFrame.textContent = '';
    const [kind, ...rest] = spec.split(':');
    const value = rest.join(':');
    if (kind === 'yt' && /^[\w-]{6,20}$/.test(value)) {
      const f = document.createElement('iframe');
      f.src = `https://www.youtube-nocookie.com/embed/${value}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
      f.title = title || 'Video';
      f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      f.referrerPolicy = 'strict-origin-when-cross-origin';
      vFrame.appendChild(f);
    } else if (kind === 'mp4' && /^https:\/\//.test(value)) {
      const v = document.createElement('video');
      v.src = value; v.controls = true; v.autoplay = true; v.playsInline = true; v.preload = 'metadata';
      vFrame.appendChild(v);
    } else {
      window.open(href, '_blank', 'noopener');
      return;
    }
    vTitle.textContent = title || 'Demo';
    vExternal.href = href;
    vDialog.showModal();
  }
  function closeVideo() {
    if (!vDialog) return;
    vDialog.close();
  }
  if (vDialog) {
    vDialog.addEventListener('close', () => { vFrame.textContent = ''; });
    vDialog.addEventListener('click', (e) => { if (e.target === vDialog) closeVideo(); });
    $('[data-video-close]').addEventListener('click', closeVideo);
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-video]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
    e.preventDefault();
    openVideo(a.dataset.video, a.dataset.title, a.getAttribute('href'));
  });

  // ---------- Command palette ----------
  const cmdk = $('[data-cmdk]');
  const cmdInput = $('[data-cmdk-input]');
  const cmdList = $('[data-cmdk-list]');
  const go = (hash) => () => {
    const el = $(hash);
    if (el) el.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    history.replaceState(null, '', hash);
  };
  const open = (url) => () => window.open(url, '_blank', 'noopener');
  const COMMANDS = [
    { group: 'Navigate', label: 'Ventures: LLMSlim and AMEYOR', run: go('#ventures') },
    { group: 'Navigate', label: 'Selected work', keys: 'projects portfolio krishyak pratibimb hearthbeat polygraph', run: go('#work') },
    { group: 'Navigate', label: 'Open source', keys: 'github prs pull requests contributions', run: go('#open-source') },
    { group: 'Navigate', label: 'Experience', run: go('#experience') },
    { group: 'Navigate', label: 'Recognition', keys: 'awards achievements hackathons', run: go('#recognition') },
    { group: 'Navigate', label: 'About and skills', run: go('#about') },
    { group: 'Navigate', label: 'Contact', keys: 'email hire freelance form', run: go('#contact') },
    { group: 'Actions', label: 'Copy hello@ameyor.in', hint: 'projects', keys: 'email mail contact hire freelance ameyor', run: () => copy('hello@ameyor.in') },
    { group: 'Actions', label: 'Copy founder@llmslim.app', hint: 'direct', keys: 'email mail contact founder', run: () => copy('founder@llmslim.app') },
    { group: 'Actions', label: 'Copy support@llmslim.app', hint: 'LLMSlim', keys: 'email mail help support', run: () => copy('support@llmslim.app') },
    { group: 'Actions', label: 'Book a 30-minute call', keys: 'calendly meeting schedule hire', run: open('https://calendly.com/yashvt9404/30min') },
    { group: 'Actions', label: 'Download resume (PDF)', keys: 'cv pdf', run: () => { const a = document.createElement('a'); a.href = '/Yashvardhan-Thanvi-Resume.pdf'; a.download = ''; a.click(); } },
    { group: 'Actions', label: 'Watch the LLMSlim demo', keys: 'video youtube film', run: () => openVideo('yt:kRCYIhu3UW8', 'LLMSlim official demo', 'https://youtu.be/kRCYIhu3UW8') },
    { group: 'Actions', label: 'Toggle light and dark theme', keys: 'mode appearance', run: toggleTheme },
    { group: 'Links', label: 'GitHub', hint: 'Thanatos9404', run: open('https://github.com/Thanatos9404') },
    { group: 'Links', label: 'LinkedIn', run: open('https://www.linkedin.com/in/yashvardhanthanvi/') },
    { group: 'Links', label: 'YouTube', hint: '@ytbuildsai', run: open('https://www.youtube.com/@ytbuildsai') },
    { group: 'Links', label: 'Instagram', run: open('https://www.instagram.com/yashvardhan.thanvi/') },
    { group: 'Links', label: 'LLMSlim website', hint: 'llmslim.app', run: open('https://www.llmslim.app') },
    { group: 'Links', label: 'AMEYOR studio', hint: 'ameyor.in', run: open('https://ameyor.in') },
    { group: 'Links', label: 'Krishyak app', run: open('https://krishyak.vercel.app/') },
    { group: 'Links', label: 'LLMSlim on PyPI', run: open('https://pypi.org/project/llmslim/') },
  ];
  let filtered = COMMANDS;
  let active = 0;

  function renderCmd() {
    const q = cmdInput.value.trim().toLowerCase();
    filtered = q
      ? COMMANDS.filter((c) => `${c.label} ${c.hint || ''} ${c.group} ${c.keys || ''}`.toLowerCase().includes(q))
      : COMMANDS;
    active = Math.min(active, Math.max(0, filtered.length - 1));
    cmdList.textContent = '';
    if (!filtered.length) {
      const empty = document.createElement('div');
      empty.className = 'cmdk-empty';
      empty.textContent = 'No matches. Try "email", "work" or "github".';
      cmdList.appendChild(empty);
      cmdInput.removeAttribute('aria-activedescendant');
      return;
    }
    let lastGroup = '';
    filtered.forEach((c, i) => {
      if (c.group !== lastGroup) {
        lastGroup = c.group;
        const g = document.createElement('div');
        g.className = 'cmdk-group';
        g.textContent = c.group;
        g.setAttribute('role', 'presentation');
        cmdList.appendChild(g);
      }
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'cmdk-item';
      item.id = `cmd-${i}`;
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', String(i === active));
      item.tabIndex = -1;
      const label = document.createElement('span');
      label.textContent = c.label;
      item.appendChild(label);
      if (c.hint) {
        const h = document.createElement('span');
        h.className = 'hint';
        h.textContent = c.hint;
        item.appendChild(h);
      }
      item.addEventListener('click', () => runCmd(i));
      item.addEventListener('pointermove', () => { if (active !== i) { active = i; syncActive(); } });
      cmdList.appendChild(item);
    });
    syncActive();
  }
  function syncActive() {
    $$('.cmdk-item', cmdList).forEach((el, i) => el.setAttribute('aria-selected', String(i === active)));
    const el = $(`#cmd-${active}`, cmdList);
    if (el) { cmdInput.setAttribute('aria-activedescendant', el.id); el.scrollIntoView({ block: 'nearest' }); }
  }
  function runCmd(i) {
    const c = filtered[i];
    if (!c) return;
    cmdk.close();
    c.run();
  }
  function openCmd() {
    if (!cmdk || typeof cmdk.showModal !== 'function') return;
    cmdInput.value = '';
    active = 0;
    renderCmd();
    cmdk.showModal();
    if (window.matchMedia('(pointer: fine)').matches) cmdInput.focus();
    else cmdList.focus?.();
  }
  if (cmdk) {
    $$('[data-cmdk-open]').forEach((b) => b.addEventListener('click', openCmd));
    cmdInput.addEventListener('input', () => { active = 0; renderCmd(); });
    cmdInput.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); active = (active + 1) % Math.max(1, filtered.length); syncActive(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); active = (active - 1 + filtered.length) % Math.max(1, filtered.length); syncActive(); }
      else if (e.key === 'Enter') { e.preventDefault(); runCmd(active); }
    });
    cmdk.addEventListener('click', (e) => { if (e.target === cmdk) cmdk.close(); });
    document.addEventListener('keydown', (e) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || '') && !cmdk.open;
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        cmdk.open ? cmdk.close() : openCmd();
      } else if (e.key === '/' && !typing && !cmdk.open && !(vDialog && vDialog.open)) {
        e.preventDefault();
        openCmd();
      }
    });
  }

  // ---------- Terminal typing ----------
  const term = $('[data-term]');
  if (term) {
    const lines = $$('.term-line', term);
    const spin = $('[data-spin]', term);
    const bars = $$('.bar', term);
    const fillBars = () => bars.forEach((b) => { b.style.width = `${Math.round(Number(b.dataset.w) * 0.34)}%`; });
    term.classList.add('is-typing');

    const startSpinner = () => {
      if (!spin) return;
      spin.classList.add('is-shown');
      if (reduceMotion.matches) return;
      const glyphs = ['·', '✢', '✳', '✶', '✻', '✽', '✻', '✶', '✳', '✢'];
      const words = ['Shipping', 'Compressing', 'Benchmarking', 'Reviewing PRs', 'Building', 'Scoping'];
      const g = $('[data-spin-glyph]', spin);
      const w = $('[data-spin-word]', spin);
      let i = 0;
      let visible = true;
      new IntersectionObserver((en) => { visible = en[0].isIntersecting; }).observe(term);
      setInterval(() => {
        if (!visible || document.hidden) return;
        i++;
        g.textContent = glyphs[i % glyphs.length];
        if (i % 24 === 0) w.textContent = words[(i / 24) % words.length];
      }, 120);
    };

    if (reduceMotion.matches) {
      lines.forEach((l) => l.classList.add('is-shown'));
      fillBars();
      startSpinner();
    } else {
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
      (async () => {
        await sleep(450);
        for (const line of lines) {
          if (line.hasAttribute('data-cmd')) {
            const c = $('.c', line);
            const text = c.textContent;
            c.textContent = '';
            const caret = document.createElement('span');
            caret.className = 'caret';
            line.appendChild(caret);
            line.classList.add('is-shown');
            await sleep(240);
            for (let i = 1; i <= text.length; i++) {
              c.textContent = text.slice(0, i);
              await sleep(26 + Math.random() * 38);
            }
            await sleep(200);
            caret.remove();
          } else {
            line.classList.add('is-shown');
            if (line.classList.contains('bench')) {
              await sleep(30);
              const b = $('.bar', line);
              if (b) b.style.width = `${Math.round(Number(b.dataset.w) * 0.34)}%`;
              await sleep(160);
            } else {
              await sleep(120);
            }
          }
        }
        startSpinner();
      })();
    }
  }

  // ---------- Contact form ----------
  const form = $('[data-contact-form]');
  if (form) {
    const ts = form.querySelector('input[name="ts"]');
    if (ts) ts.value = String(Date.now());
    const status = $('.form-status', form);
    const btn = form.querySelector('button[type="submit"]');
    const setStatus = (msg, kind) => { status.textContent = msg; status.className = `form-status ${kind || ''}`; };
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      if (!data.name || !data.name.trim()) return setStatus('Please add your name.', 'err');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email || '')) return setStatus('Please add a valid email.', 'err');
      if (!data.message || data.message.trim().length < 10) return setStatus('A few more words in the message, please.', 'err');
      btn.disabled = true;
      setStatus('Sending…');
      try {
        const res = await fetch(form.action, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(data),
        });
        const out = await res.json().catch(() => ({}));
        if (res.ok && out.ok) {
          form.reset();
          if (ts) ts.value = String(Date.now());
          setStatus('Thanks! Your message is in. Expect a reply within two working days.', 'ok');
        } else {
          setStatus(out.error || 'Could not send right now. Please email hello@ameyor.in instead.', 'err');
        }
      } catch (err) {
        setStatus('Network error. Please email hello@ameyor.in instead.', 'err');
      } finally {
        btn.disabled = false;
      }
    });
    if (/[?&]sent=1/.test(location.search)) setStatus('Thanks! Your message is in. Expect a reply within two working days.', 'ok');
  }

  // ---------- Live stats (GitHub + PyPI via our cached API) ----------
  const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1200));
  idle(() => {
    if (!$$('[data-stat]').length) return;
    fetch('/api/stats', { headers: { Accept: 'application/json' } })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        $$('[data-stat]').forEach((el) => {
          const v = el.dataset.stat.split('.').reduce((o, k) => (o == null ? o : o[k]), data);
          if (v === undefined || v === null || v === '') return;
          el.textContent = typeof v === 'number' ? v.toLocaleString('en-IN') : String(v);
        });
      })
      .catch(() => { /* keep the static values */ });
  });

  // ---------- Motion: reveals, counters, scroll progress ----------
  // Motion loads after the page is interactive, so it never competes with first paint.
  function initMotion() {
    const M = window.Motion;
    if (!M || !M.animate || !M.inView) return;
    const { animate, inView, stagger, scroll } = M;
    const ease = [0.16, 1, 0.3, 1];
    const fold = window.innerHeight * 0.92;

    // Read every position first, then write, to avoid layout thrashing.
    const reveals = $$('[data-reveal]');
    const counters = $$('[data-count]');
    const below = new Set();
    reveals.concat(counters).forEach((el) => { if (el.getBoundingClientRect().top > fold) below.add(el); });

    root.classList.add('has-motion');
    reveals.forEach((el) => { if (!below.has(el)) el.style.opacity = '1'; });

    $$('[data-reveal-group]').forEach((group) => {
      const items = $$('[data-reveal]', group).filter((el) => below.has(el));
      if (!items.length) return;
      inView(group, () => {
        animate(items, { opacity: [0, 1], y: [22, 0], filter: ['blur(6px)', 'blur(0px)'] },
          { duration: 0.8, ease, delay: stagger(0.07) });
      }, { amount: 0.12 });
    });
    reveals.filter((el) => below.has(el) && !el.closest('[data-reveal-group]')).forEach((el) => {
      inView(el, () => { animate(el, { opacity: [0, 1], y: [22, 0] }, { duration: 0.8, ease }); }, { amount: 0.15 });
    });

    counters.filter((el) => below.has(el)).forEach((el) => {
      const target = parseFloat(el.dataset.count);
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      const suffix = el.dataset.suffix || '';
      const group = el.dataset.group === '1';
      const fmt = (v) => (group ? Math.round(v).toLocaleString('en-US') : v.toFixed(decimals)) + suffix;
      el.textContent = fmt(0);
      inView(el, () => {
        animate(0, target, { duration: 1.4, ease, onUpdate: (v) => { el.textContent = fmt(v); } });
      }, { amount: 0.6 });
    });

    const bar = $('.progress');
    if (bar && scroll) {
      try { scroll(animate(bar, { scaleX: [0, 1] }, { ease: 'linear' })); } catch (e) { /* older API */ }
    }
  }

  if (!reduceMotion.matches) {
    const loadMotion = () => {
      const s = document.createElement('script');
      s.src = '/assets/js/motion.min.js?v=12.23.24';
      s.async = true;
      s.onload = initMotion;
      document.head.appendChild(s);
    };
    const whenIdle = () => (window.requestIdleCallback ? requestIdleCallback(loadMotion, { timeout: 1500 }) : setTimeout(loadMotion, 300));
    if (document.readyState === 'complete') whenIdle();
    else window.addEventListener('load', whenIdle, { once: true });
  }
})();
