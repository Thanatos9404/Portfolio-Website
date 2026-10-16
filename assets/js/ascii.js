/*
 * Interactive ASCII field.
 * Simplex-noise terrain drawn as monospace glyphs. The pointer opens a "decode" lens
 * that swaps glyphs for code characters; clicks send a ripple through the field.
 * Pauses when off-screen or when the tab is hidden; renders one still frame for
 * prefers-reduced-motion.
 */
(() => {
  'use strict';

  const canvases = document.querySelectorAll('canvas[data-ascii]');
  if (!canvases.length) return;

  // ---------- 3D simplex noise (Gustavson, public domain) ----------
  const grad3 = new Float32Array([1,1,0,-1,1,0,1,-1,0,-1,-1,0,1,0,1,-1,0,1,1,0,-1,-1,0,-1,0,1,1,0,-1,1,0,1,-1,0,-1,-1]);
  const perm = new Uint8Array(512);
  const permMod12 = new Uint8Array(512);
  (() => {
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    let seed = 1337;
    for (let i = 255; i > 0; i--) {
      seed = (seed * 16807) % 2147483647;
      const j = seed % (i + 1);
      const t = p[i]; p[i] = p[j]; p[j] = t;
    }
    for (let i = 0; i < 512; i++) { perm[i] = p[i & 255]; permMod12[i] = perm[i] % 12; }
  })();
  const F3 = 1 / 3, G3 = 1 / 6;
  function noise3(x, y, z) {
    const s = (x + y + z) * F3;
    const i = Math.floor(x + s), j = Math.floor(y + s), k = Math.floor(z + s);
    const t = (i + j + k) * G3;
    const x0 = x - (i - t), y0 = y - (j - t), z0 = z - (k - t);
    let i1, j1, k1, i2, j2, k2;
    if (x0 >= y0) {
      if (y0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
      else if (x0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1; }
      else { i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1; }
    } else {
      if (y0 < z0) { i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1; }
      else if (x0 < z0) { i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1; }
      else { i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
    }
    const x1 = x0 - i1 + G3, y1 = y0 - j1 + G3, z1 = z0 - k1 + G3;
    const x2 = x0 - i2 + 2 * G3, y2 = y0 - j2 + 2 * G3, z2 = z0 - k2 + 2 * G3;
    const x3 = x0 - 1 + 3 * G3, y3 = y0 - 1 + 3 * G3, z3 = z0 - 1 + 3 * G3;
    const ii = i & 255, jj = j & 255, kk = k & 255;
    let n = 0, t0, g;
    t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
    if (t0 > 0) { g = permMod12[ii + perm[jj + perm[kk]]] * 3; t0 *= t0; n += t0 * t0 * (grad3[g] * x0 + grad3[g + 1] * y0 + grad3[g + 2] * z0); }
    t0 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
    if (t0 > 0) { g = permMod12[ii + i1 + perm[jj + j1 + perm[kk + k1]]] * 3; t0 *= t0; n += t0 * t0 * (grad3[g] * x1 + grad3[g + 1] * y1 + grad3[g + 2] * z1); }
    t0 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
    if (t0 > 0) { g = permMod12[ii + i2 + perm[jj + j2 + perm[kk + k2]]] * 3; t0 *= t0; n += t0 * t0 * (grad3[g] * x2 + grad3[g + 1] * y2 + grad3[g + 2] * z2); }
    t0 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
    if (t0 > 0) { g = permMod12[ii + 1 + perm[jj + 1 + perm[kk + 1]]] * 3; t0 *= t0; n += t0 * t0 * (grad3[g] * x3 + grad3[g + 1] * y3 + grad3[g + 2] * z3); }
    return 32 * n; // roughly -1..1
  }

  const smooth = (a, b, x) => {
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };

  const RAMP = ' .·:-=+*#%@';
  const CODE = '01{}[]<>/\\=+*#$&?;:';
  const BUCKETS = 7;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  canvases.forEach((canvas) => field(canvas));

  function field(canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const host = canvas.parentElement;
    const variant = canvas.dataset.ascii || 'hero'; // 'hero' | 'band'

    let W = 0, H = 0, dpr = 1, cw = 8, ch = 16, cols = 0, rows = 0, fontPx = 13;
    let font = '';
    let fg = [237, 237, 237], accent = [125, 211, 160];
    let running = false, visible = false, ready = false, raf = 0, last = 0, frameMs = 33, baseFrameMs = 33, cost = 0;
    const pointer = { x: -1e4, y: -1e4, tx: -1e4, ty: -1e4, active: false, lastMove: 0 };
    const ripples = [];
    let buckets = [];

    function readColors() {
      const cs = getComputedStyle(canvas);
      const parse = (v, fb) => {
        const m = (v || '').match(/\d+(\.\d+)?/g);
        return m && m.length >= 3 ? m.slice(0, 3).map(Number) : fb;
      };
      fg = parse(cs.getPropertyValue('--ascii-fg'), fg);
      accent = parse(cs.getPropertyValue('--ascii-accent'), accent);
    }

    function resize() {
      const rect = host.getBoundingClientRect();
      W = Math.max(1, Math.floor(rect.width));
      H = Math.max(1, Math.floor(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      fontPx = W < 640 ? 12 : 13;
      font = `400 ${fontPx}px "Geist Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = font;
      cw = Math.ceil(ctx.measureText('M').width) + (W < 640 ? 4 : 3);
      ch = Math.round(fontPx * 1.45);
      baseFrameMs = W < 640 ? 50 : 33;
      frameMs = Math.max(frameMs, baseFrameMs);
      cols = Math.ceil(W / cw);
      rows = Math.ceil(H / ch);
      ctx.textBaseline = 'top';
      readColors();
      if (ready && !running) draw(performance.now());
    }

    // Where the field is allowed to be dense. Keeps the hero copy readable.
    function mask(nx, ny) {
      if (variant === 'band') return smooth(0, 0.35, ny) * smooth(1, 0.6, ny) * (0.25 + 0.6 * smooth(0.35, 0.95, nx));
      const wide = W >= 900;
      if (!wide) {
        // Small screens: copy fills the width, so keep glyphs faint and toward the right edge.
        return 0.6 * smooth(0.42, 1, nx) * smooth(1.0, 0.8, ny);
      }
      return smooth(0.18, 0.72, nx) * smooth(1.0, 0.72, ny);
    }

    function draw(now) {
      const t = now * 0.00006;
      ctx.clearRect(0, 0, W, H);
      ctx.font = font;

      // Ease pointer toward its target; drift on its own when idle or on touch.
      const idle = !pointer.active || now - pointer.lastMove > 4000;
      if (idle) {
        const s = now * 0.00018;
        const wide = W >= 900;
        pointer.tx = W * (wide ? 0.68 + 0.2 * Math.sin(s * 1.3) : 0.86 + 0.1 * Math.sin(s * 1.3));
        pointer.ty = H * (wide ? 0.45 + 0.28 * Math.sin(s * 0.9 + 1.2) : 0.62 + 0.3 * Math.sin(s * 0.9 + 1.2));
      }
      pointer.x += (pointer.tx - pointer.x) * 0.12;
      pointer.y += (pointer.ty - pointer.y) * 0.12;

      for (let r = ripples.length - 1; r >= 0; r--) {
        if (now - ripples[r].t0 > 2200) ripples.splice(r, 1);
      }

      const lensR = Math.max(90, Math.min(W, H) * 0.2);
      const lensR2 = lensR * lensR;
      const step = Math.floor(now / 90);

      if (buckets.length !== BUCKETS * 2) buckets = Array.from({ length: BUCKETS * 2 }, () => []);
      for (let b = 0; b < buckets.length; b++) buckets[b].length = 0;

      for (let y = 0; y < rows; y++) {
        const py = y * ch;
        const ny = py / H;
        for (let x = 0; x < cols; x++) {
          const px = x * cw;
          const nx = px / W;
          const m = mask(nx, ny);
          if (m < 0.02) continue;

          let n = noise3(x * 0.045, y * 0.09, t * 6) * 0.65 + noise3(x * 0.11, y * 0.2, t * 9 + 10) * 0.35;
          n = (n + 1) * 0.5;
          let v = smooth(0.42, 0.9, n) * m;

          const dx = px - pointer.x, dy = py - pointer.y;
          const d2 = dx * dx + dy * dy;
          let lens = 0;
          if (d2 < lensR2 * 2.2) lens = Math.exp(-d2 / (lensR2 * 0.45));

          let wave = 0;
          for (let r = 0; r < ripples.length; r++) {
            const rp = ripples[r];
            const age = (now - rp.t0) / 1000;
            const dist = Math.sqrt((px - rp.x) ** 2 + (py - rp.y) ** 2);
            const ring = dist - age * 520;
            wave += Math.exp(-(ring * ring) / 900) * (1 - age / 2.2);
          }

          v = Math.min(1, v + lens * 0.55 * (0.35 + n) + wave * 0.6);
          if (v < 0.06) continue;

          const hot = lens > 0.35 || wave > 0.3;
          let glyph;
          if (hot) {
            const h = (x * 73856093) ^ (y * 19349663) ^ step;
            glyph = CODE[(h >>> 0) % CODE.length];
          } else {
            glyph = RAMP[Math.min(RAMP.length - 1, 1 + Math.floor(v * (RAMP.length - 1)))];
          }
          const bucket = Math.min(BUCKETS - 1, Math.floor(v * BUCKETS)) + (hot ? BUCKETS : 0);
          buckets[bucket].push(px, py, glyph);
        }
      }

      for (let b = 0; b < buckets.length; b++) {
        const list = buckets[b];
        if (!list.length) continue;
        const isHot = b >= BUCKETS;
        const level = ((b % BUCKETS) + 1) / BUCKETS;
        const c = isHot ? accent : fg;
        const alpha = isHot ? 0.35 + level * 0.6 : 0.05 + level * 0.34;
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${alpha.toFixed(3)})`;
        for (let i = 0; i < list.length; i += 3) ctx.fillText(list[i + 2], list[i], list[i + 1]);
      }
    }

    function loop(now) {
      raf = 0;
      if (!running) return;
      if (now - last >= frameMs) { // glyphs do not need 60fps
        last = now;
        const t0 = performance.now();
        draw(now);
        // Adapt to the device: slow frames lower the frame rate instead of janking the page.
        cost = cost * 0.9 + (performance.now() - t0) * 0.1;
        if (cost > 14 && frameMs < 120) frameMs += 8;
        else if (cost < 6 && frameMs > baseFrameMs) frameMs -= 4;
      }
      raf = requestAnimationFrame(loop);
    }

    function start() {
      if (!ready || running || reduceMotion.matches || document.hidden || !visible) return;
      running = true;
      raf = requestAnimationFrame(loop);
    }
    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    const toLocal = (e) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    // Listen on the host so content above the canvas still drives the lens.
    host.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      const p = toLocal(e);
      pointer.tx = p.x; pointer.ty = p.y;
      pointer.active = true;
      pointer.lastMove = performance.now();
      if (reduceMotion.matches && ready) { pointer.x = p.x; pointer.y = p.y; draw(performance.now()); }
    }, { passive: true });
    host.addEventListener('pointerleave', () => { pointer.active = false; }, { passive: true });
    host.addEventListener('pointerdown', (e) => {
      if (e.target.closest('a, button, input, textarea, select, [role="button"]')) return;
      const p = toLocal(e);
      ripples.push({ x: p.x, y: p.y, t0: performance.now() });
      if (ripples.length > 4) ripples.shift();
    }, { passive: true });

    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      visible ? start() : stop();
    }, { rootMargin: '80px' }).observe(canvas);

    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
    reduceMotion.addEventListener?.('change', () => (reduceMotion.matches ? (stop(), ready && draw(performance.now())) : start()));

    // Theme switches swap the glyph colors.
    new MutationObserver(() => { readColors(); if (ready && !running) draw(performance.now()); })
      .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    let resizeRaf = 0;
    new ResizeObserver(() => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(resize);
    }).observe(host);

    // Wait until the page has loaded and gone idle so the field never delays first paint.
    const boot = () => {
      ready = true;
      const fontsReady = document.fonts && document.fonts.load
        ? document.fonts.load('400 13px "Geist Mono"').catch(() => {})
        : Promise.resolve();
      fontsReady.then(() => {
        resize();
        canvas.classList.add('is-on');
        start();
      });
    };
    const idle = () => (window.requestIdleCallback ? requestIdleCallback(boot, { timeout: 1200 }) : setTimeout(boot, 200));
    if (document.readyState === 'complete') idle();
    else window.addEventListener('load', idle, { once: true });
  }
})();
