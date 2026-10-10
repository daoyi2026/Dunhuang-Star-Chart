/* 敦煌星图 · 天极版
 * Canvas 2D renderer. Star positions are stored for J2000 and precessed in the
 * page, so the sky can turn around the Tang-dynasty pole or show Dunhuang now.
 */
(() => {
  'use strict';

  const SKY = window.SKY;
  const TX = window.TEXTS;
  const ORDER = ['北斗', '天棓', '华盖', '天厨', '传舍', '天柱', '文昌', '三师', '太尊', '天牢', '内阶', '天床', '八谷', '天理',
    '六甲', '勾陈', '北极', '天皇', '五帝', '尚书', '女史', '柱史', '御女', '天枪', '玄戈', '三公', '相', '紫微垣'];
  const ALWAYS = new Set(['北极', '北斗', '紫微垣', '勾陈', '文昌']);
  const D2R = Math.PI / 180;
  const PD_MAX = 118;
  const NEI_GUI = 34.3;                 // 内规 at Chang'an
  const TANG_YEAR = 700;
  const DUNHUANG = { lat: 40.14, lon: 94.66 };
  const BG = '#04060c';
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const cv = document.getElementById('sky');
  const ctx = cv.getContext('2d');
  const body = document.body;

  let W = 0, H = 0, DPR = 1, S = 8, R = 0, mobile = false;
  let bake = null, bakeAlpha = 1, bakeTarget = 1;
  let rot = 34, spin = 0, paused = false;
  let clock = 0, last = performance.now();
  let introT = reduceMotion ? 99 : 0, introDone = reduceMotion;
  let sel = null, hover = null;
  let nextMeteor = 14;
  const meteors = [];
  const cam = { z: 1, ax: 0, ay: 0, fx: 0, fy: 0 };
  const lamp = { x: -999, y: -999, tx: -999, ty: -999, amt: 0, touchUntil: 0, mouse: false };
  let LR = 200;

  let mode = 'tang';                    // 'tang' | 'now'
  let epoch = TANG_YEAR;
  let nowK = 0;                         // weight of the horizon / live-sky features
  const trans = { on: false, t0: 0, dur: 4.6, from: 0, to: 0, rot0: 0, toMode: 'tang' };
  let tour = null;
  let sunAlt = -90;

  // ---------- utilities ----------
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = (v) => 1 - Math.pow(1 - clamp(v), 3);
  const easeIO = (v) => { v = clamp(v); return v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2; };
  const smooth = (v) => { v = clamp(v); return v * v * (3 - 2 * v); };
  const lerp = (a, b, t) => a + (b - a) * t;
  function rng(seed) {
    return () => {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let r = Math.imul(seed ^ seed >>> 15, 1 | seed);
      r = r + Math.imul(r ^ r >>> 7, 61 | r) ^ r;
      return ((r ^ r >>> 14) >>> 0) / 4294967296;
    };
  }
  const BV_STOPS = [[-0.3, [165, 192, 255]], [0, [200, 216, 255]], [0.4, [244, 244, 250]], [0.8, [255, 236, 208]], [1.4, [255, 206, 156]], [2, [255, 190, 130]]];
  function bvRGB(bv) {
    for (let i = 1; i < BV_STOPS.length; i++) {
      if (bv <= BV_STOPS[i][0]) {
        const [b0, c0] = BV_STOPS[i - 1], [b1, c1] = BV_STOPS[i];
        const f = clamp((bv - b0) / (b1 - b0));
        return c0.map((c, k) => Math.round(c + (c1[k] - c) * f));
      }
    }
    return BV_STOPS[BV_STOPS.length - 1][1];
  }
  const spriteCache = new Map();
  function sprite(rgb) {
    const key = rgb.join(',');
    if (spriteCache.has(key)) return spriteCache.get(key);
    const s = 64, c = document.createElement('canvas');
    c.width = c.height = s;
    const g = c.getContext('2d');
    const gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    gr.addColorStop(0, `rgba(${key},1)`);
    gr.addColorStop(0.07, `rgba(${key},.92)`);
    gr.addColorStop(0.2, `rgba(${key},.32)`);
    gr.addColorStop(0.45, `rgba(${key},.08)`);
    gr.addColorStop(1, `rgba(${key},0)`);
    g.fillStyle = gr;
    g.fillRect(0, 0, s, s);
    spriteCache.set(key, c);
    return c;
  }
  const GOLD = [236, 196, 122];
  const GOLD_HI = [255, 232, 180];
  const CINNABAR = [232, 112, 72];
  const PALE = [150, 172, 215];

  // ---------- precession (rotation about the ecliptic pole) ----------
  const EPS = 23.4393 * D2R, cE = Math.cos(EPS), sE = Math.sin(EPS);
  const PREC = 50.29 / 3600 * D2R;      // general precession per year
  function toEcl(ra, dec) {
    const a = ra * D2R, d = dec * D2R;
    const x = Math.cos(d) * Math.cos(a), y = Math.cos(d) * Math.sin(a), z = Math.sin(d);
    const ye = y * cE + z * sE, ze = -y * sE + z * cE;
    return [Math.atan2(ye, x), ze];
  }
  function fromEcl(lam, sb, cb, out, i) {
    const x = cb * Math.cos(lam), ye = cb * Math.sin(lam);
    const y = ye * cE - sb * sE, z = ye * sE + sb * cE;
    out[0][i] = (Math.atan2(y, x) / D2R + 360) % 360;
    out[1][i] = 90 - Math.asin(clamp(z, -1, 1)) / D2R;
  }

  // stars
  const NS = SKY.stars.length;
  const sLam = new Float64Array(NS), sSb = new Float64Array(NS), sCb = new Float64Array(NS);
  const sMag = new Float32Array(NS), sBV = new Float32Array(NS);
  const sRA = new Float64Array(NS), sPD = new Float64Array(NS);
  const sOut = [sRA, sPD];
  SKY.stars.forEach((s, i) => {
    const [l, z] = toEcl(s[0], s[1]);
    sLam[i] = l; sSb[i] = z; sCb[i] = Math.sqrt(1 - z * z); sMag[i] = s[2]; sBV[i] = s[3];
  });
  const bright = [];
  const live = [];
  for (let i = 0; i < NS; i++) {
    if (sMag[i] <= 3.4) {
      const rgb = bvRGB(sBV[i]);
      bright.push({ i, rgb, spr: sprite(rgb), ph: i * 2.399, f: 0.6 + (i % 7) * 0.23 });
    }
    if (sMag[i] <= 6.3) live.push(i);
  }

  // asterisms: vertices are shared objects so every line follows precession
  const asts = SKY.ast.map((a) => {
    const map = new Map();
    const verts = [];
    const lines = a.l.map((line) => line.map((p) => {
      const k = p[0] + ',' + p[1];
      if (!map.has(k)) {
        const [l, z] = toEcl(p[0], p[1]);
        const v = { lam: l, sb: z, cb: Math.sqrt(1 - z * z), ra: 0, pd: 0 };
        map.set(k, v); verts.push(v);
      }
      return map.get(k);
    }));
    return {
      name: a.n, main: !!a.m, isWall: a.n === '紫微垣', lines, verts,
      idx: a.m ? ORDER.indexOf(a.n) : -1,
      cra: 0, cpd: 0, minpd: 0, maxpd: 0, delay: 0,
      hov: 0, light: 0, sp: null, screenC: null, lit: 0, up: true
    };
  });
  const mainAsts = asts.filter((a) => a.main).sort((p, q) => p.idx - q.idx);
  const byName = new Map(mainAsts.map((a) => [a.name, a]));
  const poleCandidates = [...byName.get('北极').verts, ...byName.get('勾陈').verts];
  let poleStar = poleCandidates[0];

  const vOut = [[0], [0]];
  function computeEpoch(Y) {
    const dl = (Y - 2000) * PREC;
    for (let i = 0; i < NS; i++) fromEcl(sLam[i] + dl, sSb[i], sCb[i], sOut, i);
    for (const a of asts) {
      for (const v of a.verts) { fromEcl(v.lam + dl, v.sb, v.cb, vOut, 0); v.ra = vOut[0][0]; v.pd = vOut[1][0]; }
      let sx = 0, sy = 0, mn = 999, mx = 0;
      for (const v of a.verts) {
        sx += v.pd * Math.cos((90 - v.ra) * D2R); sy += v.pd * Math.sin((90 - v.ra) * D2R);
        mn = Math.min(mn, v.pd); mx = Math.max(mx, v.pd);
      }
      sx /= a.verts.length; sy /= a.verts.length;
      a.cra = 90 - Math.atan2(sy, sx) / D2R; a.cpd = Math.hypot(sx, sy); a.minpd = mn; a.maxpd = mx;
    }
    poleStar = poleCandidates.reduce((p, q) => (q.pd < p.pd ? q : p));
  }
  computeEpoch(TANG_YEAR);
  asts.forEach((a) => { a.delay = a.isWall ? 6.2 : (a.main ? 2.4 + a.cpd * 0.06 : 3.4 + a.cpd * 0.05); });

  // ---------- Milky Way as particles ----------
  // Sampled from the real brightness contours (mw.json), with 3D value noise
  // for grain and dark lanes. Stored in ecliptic form so they precess like stars.
  function hash3(x, y, z) { let h = (x * 374761393 + y * 668265263 + z * 2147483647) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
  function vnoise(x, y, z) {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    const xf = x - xi, yf = y - yi, zf = z - zi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
    let r = 0;
    for (let dz = 0; dz < 2; dz++) for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) {
      r += hash3(xi + dx, yi + dy, zi + dz) * (dx ? u : 1 - u) * (dy ? v : 1 - v) * (dz ? w : 1 - w);
    }
    return r;
  }
  function fbm(x, y, z) { let a = 0.5, f = 1, t = 0; for (let o = 0; o < 4; o++) { t += a * vnoise(x * f, y * f, z * f); f *= 2.1; a *= 0.5; } return t / 0.9375; }

  const MWW = 1024, MWH = 512;
  const mwMask = (() => {
    const c = document.createElement('canvas'); c.width = MWW; c.height = MWH;
    const g = c.getContext('2d');
    if ('filter' in g) g.filter = 'blur(1.5px)';
    SKY.mw.forEach((level, li) => {
      g.fillStyle = `rgba(0,0,0,${0.16 + li * 0.08})`;
      level.forEach((ring) => {
        // unwrap RA so rings crossing 0h stay continuous, then draw shifted copies
        const pts = []; let prev = null;
        ring.forEach(([ra, dec]) => { let r = ra; if (prev !== null) { while (r - prev > 180) r -= 360; while (prev - r > 180) r += 360; } pts.push([r, dec]); prev = r; });
        [-360, 0, 360].forEach((off) => {
          g.beginPath();
          pts.forEach(([r, d], i) => { const x = (r + off) / 360 * MWW, y = (90 - d) / 180 * MWH; if (i) g.lineTo(x, y); else g.moveTo(x, y); });
          g.closePath(); g.fill('evenodd');
        });
      });
    });
    return g.getImageData(0, 0, MWW, MWH).data;
  })();
  function mwDensity(ra, dec) {
    const x = Math.min(MWW - 1, Math.floor(((ra % 360) + 360) % 360 / 360 * MWW)), y = Math.min(MWH - 1, Math.floor((90 - dec) / 180 * MWH));
    return mwMask[(y * MWW + x) * 4 + 3] / 255;
  }
  const P_LAM = [], P_SB = [], P_A = [], P_R = [], P_T = [], P_C = [];
  (() => {
    const rand = rng(4242);
    let stars = 0, clouds = 0;
    for (let t = 0; t < 900000 && (stars < 110000 || clouds < 4200); t++) {
      const z = rand() * 2 - 1, ra = rand() * 360, dec = Math.asin(z) / D2R;
      if (90 - dec > 128) continue;                        // far southern sky is never seen
      const d = mwDensity(ra, dec);
      const cd = Math.cos(dec * D2R), x = cd * Math.cos(ra * D2R), y = cd * Math.sin(ra * D2R);
      const roll = rand();
      if (d < 0.02) {
        if (roll < 0.11 && stars < 110000) { push(ra, dec, 0.035 + rand() * 0.09, 0.32 + rand() * 0.3, 0, rand() < 0.75 ? 0 : 1); stars++; }
        continue;
      }
      const n = fbm(x * 6 + 11, y * 6 + 3, z * 6 + 7);
      const lane = smooth((n - 0.36) / 0.2);                 // dark dust lanes where the noise dips
      const k = d * lane;
      if (roll < 0.12 + k * 1.15 && stars < 110000) {
        push(ra, dec, 0.05 + rand() * (0.1 + k * 0.45), 0.3 + rand() * (0.35 + k * 0.45), 0, rand() < 0.68 ? 0 : 1); stars++;
      } else if (roll > 0.982 - k * 0.05 && k > 0.1 && clouds < 4200) {
        push(ra, dec, 0.02 + k * 0.055 * (0.5 + n), 0.8 + rand() * 2.6, 1, rand() < 0.7 ? 0 : 1); clouds++;
      }
    }
    function push(ra, dec, a, r, type, warm) {
      const [l, zz] = toEcl(ra, dec);
      P_LAM.push(l); P_SB.push(zz); P_A.push(a); P_R.push(r); P_T.push(type); P_C.push(warm);
    }
  })();
  const NP = P_LAM.length;
  const pRA = new Float64Array(NP), pPD = new Float64Array(NP);
  let pEpoch = null;
  function precessParticles(Y, step = 1) {
    const dl = (Y - 2000) * PREC, out = [pRA, pPD];
    for (let i = 0; i < NP; i += step) { const sb = P_SB[i]; fromEcl(P_LAM[i] + dl, sb, Math.sqrt(1 - sb * sb), out, i); }
    pEpoch = step === 1 ? Y : null;
  }
  const MW_COOL = sprite([150, 172, 222]), MW_WARM = sprite([228, 206, 176]);

  // ---------- time & sun at Dunhuang ----------
  const jdNow = () => Date.now() / 86400000 + 2440587.5;
  const lstDeg = (jd) => ((280.46061837 + 360.98564736629 * (jd - 2451545) + DUNHUANG.lon) % 360 + 360) % 360;
  function sunAltitude(jd) {
    const n = jd - 2451545;
    const L = (280.46 + 0.9856474 * n) * D2R, g = (357.528 + 0.9856003 * n) * D2R;
    const lam = L + (1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * D2R;
    const e = 23.439 * D2R;
    const ra = Math.atan2(Math.cos(e) * Math.sin(lam), Math.cos(lam)) / D2R;
    const dec = Math.asin(Math.sin(e) * Math.sin(lam));
    const h = (lstDeg(jd) - ra) * D2R, la = DUNHUANG.lat * D2R;
    return Math.asin(Math.sin(la) * Math.sin(dec) + Math.cos(la) * Math.cos(dec) * Math.cos(h)) / D2R;
  }
  function altOf(ra, pd) {
    const la = DUNHUANG.lat * D2R, dec = (90 - pd) * D2R, h = (rot - ra) * D2R;
    return Math.asin(Math.sin(la) * Math.sin(dec) + Math.cos(la) * Math.cos(dec) * Math.cos(h)) / D2R;
  }

  // ---------- projection ----------
  function phiXY(phDeg, pd) { const ph = phDeg * D2R, r = pd * S; return [r * Math.cos(ph), -r * Math.sin(ph)]; }
  const skyXY = (ra, pd) => phiXY(90 + rot - ra, pd);
  function scr(X, Y) { return [cam.ax + cam.z * (X - cam.fx), cam.ay + cam.z * (Y - cam.fy)]; }
  // Standing at Dunhuang, facing north: stereographic alt-az view.
  const SLAT = Math.sin(DUNHUANG.lat * D2R), CLAT = Math.cos(DUNHUANG.lat * D2R);
  const view = { a0: 30 * D2R, sa: 0, ca: 1, F: 600, cx: 0, cy: 0 };
  function setView() {
    // Frame like a landscape photo: horizon near the bottom, the pole about a third of the way down.
    view.a0 = 20 * D2R;
    view.sa = Math.sin(view.a0); view.ca = Math.cos(view.a0);
    view.F = mobile ? H / 2 / (2 * Math.tan(82 * D2R / 4)) : Math.max(W, H) / 2 / (2 * Math.tan(112 * D2R / 4));
    const horizonY = H * (mobile ? 0.86 : 0.9);
    view.cx = W * (mobile ? 0.5 : 0.56);
    view.cy = horizonY - 2 * view.F * Math.tan(view.a0 / 2);
  }
  let lastU = 1;
  function perspNEU(N, E, U) {
    const y = -N * view.sa + U * view.ca, z = Math.max(-0.92, N * view.ca + U * view.sa);
    const k = 2 / (1 + z);
    return [view.cx + view.F * k * E, view.cy - view.F * k * y];
  }
  function perspAltAz(alt, az) {
    const h = alt * D2R, a = az * D2R;
    return perspNEU(Math.cos(h) * Math.cos(a), Math.cos(h) * Math.sin(a), Math.sin(h));
  }
  function persp(ra, pd) {
    const dec = (90 - pd) * D2R, H_ = (rot - ra) * D2R;
    const sd = Math.sin(dec), cd = Math.cos(dec), cH = Math.cos(H_);
    const N = CLAT * sd - SLAT * cd * cH, E = -cd * Math.sin(H_), U = SLAT * sd + CLAT * cd * cH;
    lastU = U;
    return perspNEU(N, E, U);
  }
  function project(ra, pd) {
    if (nowK <= 0.001) { lastU = 1; const [X, Y] = skyXY(ra, pd); return scr(X, Y); }
    const q = persp(ra, pd);
    if (nowK >= 0.999) return q;
    const [X, Y] = skyXY(ra, pd), p = scr(X, Y), k = easeIO(nowK);
    return [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k];
  }
  function homeAnchor() {
    const tang = mobile ? [W * 0.5, H * 0.47] : [W * 0.57, H * 0.52];
    const now = mobile ? [W * 0.5, H * 0.42] : [W * 0.56, H * 0.36];
    const k = mode === 'now' || (trans.on && trans.toMode === 'now') ? 1 : 0;
    return [lerp(tang[0], now[0], k), lerp(tang[1], now[1], k)];
  }

  // ---------- baked sky layer ----------
  function bakeSky() {
    R = PD_MAX * S;
    const k = Math.min(DPR * 1.25, 4096 / (2 * R));
    const n = Math.ceil(2 * R * k), c = n / 2;
    bake = document.createElement('canvas');
    bake.width = bake.height = n;
    const b = bake.getContext('2d');
    const P = (ra, pd) => { const ph = (90 - ra) * D2R, r = pd * S * k; return [c + r * Math.cos(ph), c - r * Math.sin(ph)]; };
    const dl = (epoch - 2000) * PREC;
    const tmp = [[0], [0]];

    // soft base glow from the real contours
    const m = 360, mw = document.createElement('canvas');
    mw.width = mw.height = m;
    const g = mw.getContext('2d');
    const mk = m / (2 * PD_MAX);
    if ('filter' in g) g.filter = 'blur(5px)';
    SKY.mw.forEach((level, li) => {
      g.fillStyle = `rgba(140,164,220,${0.045 + li * 0.022})`;
      g.beginPath();
      level.forEach((ring) => ring.forEach((p, i) => {
        const [l, z] = toEcl(p[0], p[1]);
        fromEcl(l + dl, z, Math.sqrt(1 - z * z), tmp, 0);
        const ph = (90 - tmp[0][0]) * D2R, r = tmp[1][0] * mk;
        const x = m / 2 + r * Math.cos(ph), y = m / 2 - r * Math.sin(ph);
        if (i) g.lineTo(x, y); else g.moveTo(x, y);
      }));
      g.fill('evenodd');
    });
    b.imageSmoothingEnabled = true;
    b.drawImage(mw, 0, 0, n, n);

    // star clouds, then the grain of faint stars
    if (pEpoch !== epoch) precessParticles(epoch);
    b.globalCompositeOperation = 'lighter';
    const degPx = S * k;
    for (let i = 0; i < NP; i++) {
      if (pPD[i] > PD_MAX + 1) continue;
      const [x, y] = P(pRA[i], pPD[i]);
      if (P_T[i] === 1) {
        const r = P_R[i] * degPx;
        b.globalAlpha = P_A[i];
        b.drawImage(P_C[i] ? MW_WARM : MW_COOL, x - r, y - r, r * 2, r * 2);
      }
    }
    b.globalAlpha = 1;
    for (let i = 0; i < NP; i++) {
      if (P_T[i] === 1 || pPD[i] > PD_MAX + 1) continue;
      const [x, y] = P(pRA[i], pPD[i]);
      const sz = P_R[i] * k * 1.6;
      b.fillStyle = P_C[i] ? `rgba(246,228,198,${P_A[i]})` : `rgba(206,220,250,${P_A[i]})`;
      b.fillRect(x, y, sz, sz);
    }
    b.globalCompositeOperation = 'source-over';

    for (let i = 0; i < NS; i++) {
      const mag = sMag[i];
      if (mag <= 3.4 || sPD[i] > PD_MAX) continue;
      const [x, y] = P(sRA[i], sPD[i]);
      const rgb = bvRGB(sBV[i]);
      const rad = Math.max(0.42, 1.95 - 0.21 * mag) * 0.8 * k;
      const al = Math.min(1, 0.2 + (7.4 - mag) * 0.18);
      if (mag < 5.4) {
        b.globalAlpha = al * 0.45;
        b.drawImage(sprite(rgb), x - rad * 6, y - rad * 6, rad * 12, rad * 12);
      }
      b.globalAlpha = al;
      b.fillStyle = `rgb(${rgb})`;
      b.beginPath(); b.arc(x, y, rad, 0, 7); b.fill();
    }
    b.globalAlpha = 1;
  }

  // ---------- paper ----------
  // ---------- layout ----------
  let resizeTimer = 0;
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    mobile = W < 760;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    mwC.width = cv.width; mwC.height = cv.height; mwKey = '';
    setView();
    S = mobile ? Math.max(Math.min(W, H) * 0.5 / 44, Math.max(W, H) * 0.5 / 66) : Math.min(W, H) * 0.5 / 46;
    LR = clamp(Math.min(W, H) * 0.26, 130, 320);
    const [ax, ay] = homeAnchor();
    if (!sel) { cam.ax = ax; cam.ay = ay; }
    bakeSky();
  }
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 160); });

  // ---------- camera ----------
  function updateCam(dt) {
    let tz = 1, tfx = 0, tfy = 0, [tax, tay] = homeAnchor();
    if (sel) {
      if (sel.isWall) {
        tz = mobile ? 1 : 1.08;
      } else {
        [tfx, tfy] = skyXY(sel.cra, sel.cpd);
        const ext = Math.max(...sel.verts.map((v) => { const [x, y] = skyXY(v.ra, v.pd); return Math.hypot(x - tfx, y - tfy); }), 8);
        tz = clamp(Math.min(W, H) * (mobile ? 0.17 : 0.26) / ext, mobile ? 1.1 : 1.25, 2.6);
      }
      if (mobile) { tax = W * 0.5; tay = H * 0.29; } else { tax = W * (sel.isWall ? 0.38 : 0.36); tay = H * 0.5; }
      if (tour) { if (mobile) { tay = H * 0.33; } else { tax = W * 0.55; tay = H * 0.42; } }
    }
    if (mode === 'now' || (trans.on && trans.toMode === 'now')) { tz = 1; tfx = 0; tfy = 0; [tax, tay] = homeAnchor(); }
    else if (!sel && !reduceMotion) tz = 1 + 0.035 * Math.sin(clock * 0.07);   // a very slow breath of depth
    const e = 1 - Math.exp(-dt * (tour ? 1.5 : 2.6));
    cam.z += (tz - cam.z) * e;
    cam.fx += (tfx - cam.fx) * e; cam.fy += (tfy - cam.fy) * e;
    cam.ax += (tax - cam.ax) * e; cam.ay += (tay - cam.ay) * e;
  }

  // ---------- drawing: sky ----------
  function lampAt(x, y) {
    if (lamp.amt < 0.01) return 0;
    const d = Math.hypot(x - lamp.x, y - lamp.y) / LR;
    return lamp.amt * Math.exp(-d * d * 2.2);
  }
  const flicker = () => 0.93 + 0.07 * Math.sin(clock * 7.3) * Math.sin(clock * 3.1 + 1);

  // the lamp: only a warm pool of light; it brings nearby names out of the dark
  function drawPaperLamp() {
    const amt = lamp.amt;
    if (amt < 0.01) return;
    const f = flicker();
    ctx.globalCompositeOperation = 'lighter';
    const w = ctx.createRadialGradient(lamp.x, lamp.y, 0, lamp.x, lamp.y, LR * 1.1);
    w.addColorStop(0, `rgba(255,178,96,${0.06 * amt * f})`);
    w.addColorStop(1, 'rgba(255,178,96,0)');
    ctx.fillStyle = w;
    ctx.fillRect(lamp.x - LR * 1.1, lamp.y - LR * 1.1, LR * 2.2, LR * 2.2);
  }


  function drawLiveStars(alpha) {
    if (alpha < 0.01) return;
    ctx.globalCompositeOperation = 'lighter';
    const z = Math.sqrt(cam.z);
    for (const i of live) {
      const [x, y] = project(sRA[i], sPD[i]);
      if (x < -4 || y < -4 || x > W + 4 || y > H + 4) continue;
      const ext = nowK > 0 ? lerp(1, clamp((lastU + 0.01) / 0.32) * 0.75 + 0.25 * (lastU > 0 ? 1 : 0), nowK) : 1;
      if (ext <= 0.01) continue;
      const m = sMag[i];
      const s = Math.max(0.9, 2.6 - 0.3 * m) * z;
      ctx.globalAlpha = alpha * ext * clamp(0.22 + (6.6 - m) * 0.16);
      ctx.fillStyle = sBV[i] < 0.5 ? '#d6e0ff' : '#ffe9cc';
      ctx.fillRect(x - s / 2, y - s / 2, s, s);
    }
    ctx.globalAlpha = 1;
  }

  // Milky Way for the live (non-baked) view: redrawn only when the view moves
  const mwC = document.createElement('canvas');
  const mwG = mwC.getContext('2d');
  let mwKey = '';
  function drawLiveMW(alpha) {
    if (alpha < 0.01) return;
    const moving = trans.on;
    const key = `${moving ? rot.toFixed(3) : Math.round(rot * 40)}|${nowK.toFixed(3)}|${epoch.toFixed(1)}|${cam.z.toFixed(3)}|${cam.ax.toFixed(0)}|${cam.ay.toFixed(0)}|${W}x${H}`;
    if (key !== mwKey) {
      mwKey = key;
      const step = moving ? 3 : 1;
      if (moving || pEpoch !== epoch) precessParticles(epoch, step);
      mwG.setTransform(DPR, 0, 0, DPR, 0, 0);
      mwG.globalCompositeOperation = 'source-over';
      mwG.clearRect(0, 0, W, H);
      mwG.globalCompositeOperation = 'lighter';
      const degPx = S * cam.z * (1 - nowK) + view.F * 2 * D2R * 0.5 * nowK;
      for (let i = 0; i < NP; i += step) {
        if (P_T[i] !== 1) continue;
        const [x, y] = project(pRA[i], pPD[i]);
        if (nowK > 0.5 && lastU < -0.05) continue;
        const r = P_R[i] * degPx;
        if (x < -r || y < -r || x > W + r || y > H + r) continue;
        mwG.globalAlpha = P_A[i] * step;
        mwG.drawImage(P_C[i] ? MW_WARM : MW_COOL, x - r, y - r, r * 2, r * 2);
      }
      mwG.globalAlpha = 1;
      for (let i = 0; i < NP; i += step) {
        if (P_T[i] === 1) continue;
        const [x, y] = project(pRA[i], pPD[i]);
        if (x < 0 || y < 0 || x > W || y > H) continue;
        if (nowK > 0.5 && lastU < -0.02) continue;
        const ext = nowK > 0 ? clamp((lastU + 0.02) / 0.3) * 0.7 + 0.3 : 1;
        const sz = P_R[i] * 1.5;
        mwG.fillStyle = P_C[i] ? `rgba(246,228,198,${P_A[i] * ext * step})` : `rgba(206,220,250,${P_A[i] * ext * step})`;
        mwG.fillRect(x, y, sz, sz);
      }
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = alpha;
    ctx.drawImage(mwC, 0, 0);
    ctx.globalAlpha = 1;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  // Sky colour: deep navy instead of black; in the live view it brightens toward the horizon.
  function drawSkyGlow() {
    ctx.globalCompositeOperation = 'source-over';
    const [px, py] = scr(0, 0);
    const m = Math.max(W, H);
    const g = ctx.createRadialGradient(px, py, 0, px, py, m * 0.9);
    g.addColorStop(0, 'rgba(16,26,52,.55)');
    g.addColorStop(0.55, 'rgba(9,15,32,.45)');
    g.addColorStop(1, 'rgba(4,6,12,0)');
    ctx.globalAlpha = 1 - nowK;
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    if (nowK > 0.01) {
      const hy = perspAltAz(0, 0)[1];
      const top = perspAltAz(70, 0)[1];
      const v = ctx.createLinearGradient(0, top, 0, hy);
      v.addColorStop(0, 'rgba(6,10,24,1)');
      v.addColorStop(0.55, 'rgba(12,22,46,1)');
      v.addColorStop(0.86, 'rgba(26,44,74,1)');
      v.addColorStop(1, 'rgba(44,66,96,1)');
      ctx.globalAlpha = nowK;
      ctx.fillStyle = v;
      ctx.fillRect(0, 0, W, H);
      if (sunAlt > -18) {
        const f = smooth((sunAlt + 18) / 18);
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = nowK * f * 0.7;
        const tw = ctx.createLinearGradient(0, top, 0, hy);
        tw.addColorStop(0, 'rgba(40,60,100,.3)');
        tw.addColorStop(1, 'rgba(120,120,140,.8)');
        ctx.fillStyle = tw;
        ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'source-over';
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawGuides(reveal) {
    const k = reveal * (1 - nowK);
    if (k < 0.01) return;
    const [px, py] = scr(0, 0);
    ctx.globalCompositeOperation = 'lighter';
    ctx.setLineDash([2, 7]);
    [NEI_GUI, 90].forEach((pd) => {
      const r = pd * S * cam.z;
      const lit = lampAt(px + r * Math.cos(-0.8), py + r * Math.sin(-0.8));
      ctx.strokeStyle = `rgba(214,96,62,${(0.12 + lit * 0.25) * k})`;
      ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.stroke();
    });
    ctx.setLineDash([]);
    const r = NEI_GUI * S * cam.z;
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 37; i++) {
      const a = (i * 10 * 360 / 365.25 + rot) * D2R;
      const x = px + Math.cos(a) * r, y = py - Math.sin(a) * r;
      const al = (0.08 + lampAt(x, y) * 0.4) * k;
      ctx.strokeStyle = `rgba(214,110,70,${al})`;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * 5, y - Math.sin(a) * 5); ctx.stroke();
    }
  }

  function pathLines(g, sp, progress) {
    g.beginPath();
    sp.forEach((line) => {
      g.moveTo(line[0][0], line[0][1]);
      if (progress >= 1) { for (let j = 1; j < line.length; j++) g.lineTo(line[j][0], line[j][1]); return; }
      let L = 0;
      for (let j = 1; j < line.length; j++) L += Math.hypot(line[j][0] - line[j - 1][0], line[j][1] - line[j - 1][1]);
      let budget = L * progress;
      for (let j = 1; j < line.length && budget > 0; j++) {
        const [x0, y0] = line[j - 1], [x1, y1] = line[j];
        const seg = Math.hypot(x1 - x0, y1 - y0);
        if (seg <= budget) { g.lineTo(x1, y1); budget -= seg; } else { const f = budget / seg; g.lineTo(x0 + (x1 - x0) * f, y0 + (y1 - y0) * f); budget = 0; }
      }
    });
  }

  function updateScreen() {
    for (const a of asts) {
      a.sp = a.lines.map((line) => line.map((v) => project(v.ra, v.pd)));
      a.screenC = project(a.cra, a.cpd);
      a.up = nowK < 0.5 || altOf(a.cra, a.cpd) > -1;
    }
  }

  function drawAsterisms(it) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const z = cam.z;
    for (const a of asts) {
      const appear = introDone ? 1 : smooth((it - a.delay) / (a.isWall ? 2.2 : 1.4));
      if (appear <= 0) continue;
      const [cx, cy] = a.screenC;
      const lit = a.isWall ? 0 : lampAt(cx, cy);
      a.lit = lit;
      if (!a.main) {
        const al = appear * (0.05 + 0.5 * lit) * (sel ? 0.5 : 1);
        ctx.strokeStyle = `rgba(${PALE},${al})`;
        ctx.lineWidth = 0.7;
        pathLines(ctx, a.sp, 1); ctx.stroke();
        ctx.globalAlpha = clamp(al * 1.6);
        a.sp.forEach((line) => line.forEach(([x, y]) => ctx.drawImage(sprite(PALE), x - 5, y - 5, 10, 10)));
        ctx.globalAlpha = 1;
        continue;
      }
      const isSel = sel === a;
      const dim = sel && !isSel ? 0.38 : 1;
      const wallLit = a.isWall ? lampWall(a) : 0;
      const strength = (0.3 + 0.45 * Math.max(lit, wallLit) + 0.5 * a.hov + 0.8 * a.light) * dim;
      const col = a.isWall ? CINNABAR : GOLD;
      ctx.strokeStyle = `rgba(${col},${0.07 * strength * appear})`;
      ctx.lineWidth = (a.isWall ? 7 : 6) * Math.sqrt(z);
      pathLines(ctx, a.sp, appear); ctx.stroke();
      ctx.strokeStyle = `rgba(${a.isWall ? CINNABAR : GOLD_HI},${clamp(0.62 * strength) * appear})`;
      ctx.lineWidth = a.isWall ? 1.5 : 1.15;
      pathLines(ctx, a.sp, appear); ctx.stroke();

      const nodeSize = (a.isWall ? 9 : 8) * Math.sqrt(z) * (1 + a.light * 0.4);
      a.verts.forEach((v, i) => {
        const [x, y] = project(v.ra, v.pd);
        const nodeAppear = introDone ? 1 : clamp((it - a.delay) * 2 - i * 0.12);
        if (nodeAppear <= 0) return;
        const tw = 0.85 + 0.15 * Math.sin(clock * (1.1 + i * 0.13) + i * 2.1 + a.idx);
        ctx.globalAlpha = clamp(nodeAppear * (0.55 + 0.45 * strength) * tw);
        ctx.drawImage(sprite(a.isWall ? CINNABAR : GOLD_HI), x - nodeSize, y - nodeSize, nodeSize * 2, nodeSize * 2);
        if (isSel || a.hov > 0.2) {
          ctx.globalAlpha = 0.18 * (a.light + a.hov);
          ctx.drawImage(sprite(col), x - nodeSize * 3, y - nodeSize * 3, nodeSize * 6, nodeSize * 6);
        }
      });
      ctx.globalAlpha = 1;
      if (isSel || (a.isWall && introDone)) drawFlow(a, isSel ? 1 : 0.5);
    }
  }

  function lampWall(a) {
    let best = 0;
    a.sp.forEach((line) => line.forEach(([x, y]) => { best = Math.max(best, lampAt(x, y)); }));
    return best;
  }

  function drawFlow(a, power) {
    const col = a.isWall ? CINNABAR : GOLD_HI;
    a.sp.forEach((line, li) => {
      let L = 0;
      const segs = [];
      for (let j = 1; j < line.length; j++) { const s = Math.hypot(line[j][0] - line[j - 1][0], line[j][1] - line[j - 1][1]); segs.push(s); L += s; }
      if (L < 1) return;
      const head = ((clock * (a.isWall ? 60 : 90) + li * 137) % (L + 120)) - 60;
      for (let k = 0; k < 14; k++) {
        const d = head - k * 5;
        if (d < 0 || d > L) continue;
        let acc = 0, j = 0;
        while (j < segs.length - 1 && acc + segs[j] < d) { acc += segs[j]; j++; }
        const f = segs[j] ? (d - acc) / segs[j] : 0;
        const x = line[j][0] + (line[j + 1][0] - line[j][0]) * f;
        const y = line[j][1] + (line[j + 1][1] - line[j][1]) * f;
        const s = (k === 0 ? 14 : 7) * (1 - k / 16);
        ctx.globalAlpha = power * (1 - k / 14) * 0.9;
        ctx.drawImage(sprite(col), x - s, y - s, s * 2, s * 2);
      }
    });
    ctx.globalAlpha = 1;
  }

  function drawBright(revealDeg) {
    ctx.globalCompositeOperation = 'lighter';
    const zf = Math.sqrt(cam.z);
    for (const s of bright) {
      const pd = sPD[s.i];
      if (pd > revealDeg + 2) continue;
      const fade = clamp((revealDeg + 2 - pd) / 6);
      const [x, y] = project(sRA[s.i], pd);
      if (x < -60 || y < -60 || x > W + 60 || y > H + 60) continue;
      const ext = nowK > 0 ? lerp(1, lastU < -0.01 ? 0 : 0.35 + 0.65 * smooth(lastU / 0.4), nowK) : 1;
      if (ext <= 0.01) continue;
      const mag = sMag[s.i];
      const tw = 0.82 + 0.12 * Math.sin(clock * s.f + s.ph) + 0.06 * Math.sin(clock * s.f * 3.7 + s.ph * 2);
      const core = Math.max(4, 12 - 2.1 * mag) * zf;
      ctx.globalAlpha = fade * tw * ext;
      ctx.drawImage(s.spr, x - core, y - core, core * 2, core * 2);
      if (mag < 2.3) {
        const halo = core * (3.2 + (2.3 - mag) * 0.5);
        ctx.globalAlpha = fade * tw * 0.2 * ext;
        ctx.drawImage(s.spr, x - halo, y - halo, halo * 2, halo * 2);
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawPole(it) {
    const [x, y] = project(poleStar.ra, poleStar.pd);
    ctx.globalCompositeOperation = 'lighter';
    if (!introDone && it < 3.2) {
      const f = smooth((it - 0.5) / 0.6) * (1 - smooth((it - 1.3) / 1.9));
      const s = 30 + 200 * f;
      ctx.globalAlpha = f;
      ctx.drawImage(sprite(GOLD_HI), x - s, y - s, s * 2, s * 2);
      const ringT = (it - 1.1) / 2.1;
      if (ringT > 0 && ringT < 1) {
        ctx.strokeStyle = `rgba(255,220,160,${0.5 * (1 - ringT)})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(x, y, ease(ringT) * Math.max(W, H) * 0.7, 0, Math.PI * 2); ctx.stroke();
      }
    }
    const on = introDone ? 1 : smooth((it - 0.5) / 0.8);
    const breath = 0.75 + 0.25 * Math.sin(clock * 0.9);
    const zf = Math.sqrt(cam.z);
    ctx.globalAlpha = on;
    ctx.drawImage(sprite([255, 246, 225]), x - 9 * zf, y - 9 * zf, 18 * zf, 18 * zf);
    ctx.globalAlpha = on * 0.32 * breath;
    const h = 46 * zf;
    ctx.drawImage(sprite(GOLD_HI), x - h, y - h, h * 2, h * 2);
    [[1, 0], [0, 1]].forEach(([dx, dy]) => {
      const L = (60 + 30 * breath) * zf;
      const g = ctx.createLinearGradient(x - dx * L, y - dy * L, x + dx * L, y + dy * L);
      g.addColorStop(0, 'rgba(255,230,180,0)');
      g.addColorStop(0.5, `rgba(255,236,200,${0.35 * on})`);
      g.addColorStop(1, 'rgba(255,230,180,0)');
      ctx.strokeStyle = g;
      ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(x - dx * L, y - dy * L); ctx.lineTo(x + dx * L, y + dy * L); ctx.stroke();
    });
    // the true celestial pole of this epoch: a small cinnabar cross
    const [px, py] = project(0, 0);
    ctx.globalAlpha = 0.5 * on;
    ctx.strokeStyle = 'rgba(232,120,80,1)';
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(px - 5, py); ctx.lineTo(px + 5, py); ctx.moveTo(px, py - 5); ctx.lineTo(px, py + 5); ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function drawMeteors(dt) {
    if (introDone && clock > nextMeteor && !reduceMotion && !relicOpen) {
      const ang = (Math.random() < 0.5 ? 0.35 : Math.PI - 0.35) + (Math.random() - 0.5) * 0.4;
      meteors.push({ x: W * (0.15 + Math.random() * 0.7), y: H * (0.08 + Math.random() * 0.35), a: ang, L: 140 + Math.random() * 160, age: 0, dur: 0.9 + Math.random() * 0.5 });
      nextMeteor = clock + 10 + Math.random() * 18;
    }
    ctx.globalCompositeOperation = 'lighter';
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      m.age += dt;
      const p = m.age / m.dur;
      if (p >= 1) { meteors.splice(i, 1); continue; }
      const travel = 420 * ease(p);
      const hx = m.x + Math.cos(m.a) * travel, hy = m.y + Math.sin(m.a) * travel;
      const tail = m.L * Math.sin(Math.PI * p);
      const tx = hx - Math.cos(m.a) * tail, ty = hy - Math.sin(m.a) * tail;
      const g = ctx.createLinearGradient(hx, hy, tx, ty);
      const al = Math.sin(Math.PI * p);
      g.addColorStop(0, `rgba(255,240,215,${0.85 * al})`);
      g.addColorStop(1, 'rgba(255,240,215,0)');
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(tx, ty); ctx.stroke();
      ctx.globalAlpha = al;
      ctx.drawImage(sprite(GOLD_HI), hx - 6, hy - 6, 12, 12);
      ctx.globalAlpha = 1;
    }
  }

  // ---------- horizon at Dunhuang ----------
  // Three silhouettes: distant ranges in haze, a middle line of hills, the near dunes.
  const RIDGES = [
    // far ranges in haze
    { fill: [22, 32, 50], rim: 'rgba(130,160,200,.16)', f: (A) => 1.6 + 2.6 * Math.pow(fbm(A * 0.05 + 3, 1.7, 0.4), 1.6) + 1.2 * Math.max(0, Math.sin(A * 0.045 + 2)) },
    // middle hills
    { fill: [12, 17, 28], rim: 'rgba(120,140,180,.12)', f: (A) => 0.8 + 2.2 * Math.pow(fbm(A * 0.032 + 9, 4.1, 2.2), 1.3) + 0.8 * Math.sin(A * 0.019 + 0.6) },
    // near dunes: long smooth crests, lit faintly by starlight
    { fill: [7, 8, 12], rim: 'rgba(214,190,150,.22)', f: (A) => -0.6 + 3.0 * Math.pow(0.5 + 0.5 * Math.sin(A * 0.03 + 1.3), 2.6) + 1.0 * Math.pow(0.5 + 0.5 * Math.sin(A * 0.071 + 4.1), 3) }
  ];
  function drawGround() {
    if (nowK < 0.01) return;
    ctx.globalCompositeOperation = 'source-over';
    const lift = (1 - smooth(nowK)) * H * 0.5;            // ground rises into place
    const hy = perspAltAz(0, 0)[1] + lift;
    RIDGES.forEach((r, ri) => {
      ctx.beginPath();
      for (let A = -160; A <= 160; A += 0.8) {
        const [x, y] = perspAltAz(r.f(A), A);
        if (A === -160) ctx.moveTo(x, y + lift); else ctx.lineTo(x, y + lift);
      }
      const crest = new Path2D();
      crest.addPath(new Path2D());
      ctx.lineTo(W * 3, H * 3); ctx.lineTo(-W * 2, H * 3); ctx.closePath();
      ctx.globalAlpha = nowK;
      if (ri === 2) {
        const g = ctx.createLinearGradient(0, hy - 40, 0, H);
        g.addColorStop(0, `rgb(${r.fill})`);
        g.addColorStop(0.35, 'rgb(5,5,8)');
        g.addColorStop(1, 'rgb(3,3,5)');
        ctx.fillStyle = g;
      } else {
        ctx.fillStyle = `rgb(${r.fill})`;
      }
      ctx.fill();
      // crest highlight
      ctx.beginPath();
      for (let A = -160; A <= 160; A += 0.8) {
        const [x, y] = perspAltAz(r.f(A), A);
        if (A === -160) ctx.moveTo(x, y + lift); else ctx.lineTo(x, y + lift);
      }
      ctx.strokeStyle = r.rim;
      ctx.lineWidth = ri === 2 ? 1.2 : 1;
      ctx.stroke();
      if (ri === 0) {
        // haze lying in front of the far range
        const hz = ctx.createLinearGradient(0, hy - 30, 0, hy + 20);
        hz.addColorStop(0, 'rgba(60,84,120,0)');
        hz.addColorStop(1, 'rgba(60,84,120,.35)');
        ctx.fillStyle = hz;
        ctx.fillRect(0, hy - 30, W, 50);
      }
    });
    // the north point, on the sand
    const [nx, ny] = perspAltAz(-2.4, 0);
    ctx.globalAlpha = nowK * 0.55;
    ctx.font = `15px ${BRUSH}`;
    ctx.fillStyle = 'rgba(200,170,120,1)';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('正北', nx, ny + lift);
    ctx.globalAlpha = 1;
  }

  function drawVignette() {
    ctx.globalCompositeOperation = 'source-over';
    const [px, py] = homeAnchor();
    const m = Math.max(W, H);
    const g = ctx.createRadialGradient(px, py, m * 0.28, px, py, m * 0.82);
    g.addColorStop(0, 'rgba(3,4,9,0)');
    g.addColorStop(0.65, 'rgba(3,4,9,.22)');
    g.addColorStop(1, 'rgba(3,4,9,.62)');
    ctx.globalAlpha = 1 - nowK * 0.85;
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }

  const SERIF = '"Noto Serif SC","Songti SC","STSong",serif';
  const BRUSH = '"Ma Shan Zheng","STKaiti","KaiTi",serif';
  function vText(g, str, x, y, size, color, font) {
    g.font = `${size}px ${font}`;
    g.fillStyle = color;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    const step = size * 1.08;
    const top = y - (str.length - 1) * step / 2;
    for (let i = 0; i < str.length; i++) g.fillText(str[i], x, top + i * step);
  }
  function labelPos(a) {
    if (a.isWall) { const line = a.sp[0]; const p = line[Math.floor(line.length / 2)]; return [p[0] + 18, p[1]]; }
    let mx = -1e9;
    a.sp.forEach((l) => l.forEach((p) => { if (p[0] > mx) mx = p[0]; }));
    return [mx + (a.main ? 14 : 9), a.screenC[1]];
  }

  function drawLabels(it) {
    ctx.globalCompositeOperation = 'source-over';
    for (const a of asts) {
      if (!a.screenC || !a.up) continue;
      const appear = introDone ? 1 : smooth((it - a.delay - 0.9) / 1.2);
      if (appear <= 0) continue;
      const [x, y] = labelPos(a);
      if (x < -20 || x > W + 20 || y < -40 || y > H + 40) continue;
      const lit = a.isWall ? lampWall(a) : a.lit;
      if (!a.main) {
        const al = appear * lit * 0.6 * (sel ? 0.5 : 1);
        if (al < 0.03) continue;
        vText(ctx, a.name, x, y, 11, `rgba(160,176,212,${al})`, SERIF);
        continue;
      }
      const base = ALWAYS.has(a.name) ? 0.5 : 0;
      const dim = sel && sel !== a ? 0.35 : 1;
      const al = appear * dim * clamp(base + lit * 0.9 + a.hov + a.light);
      if (al < 0.03) continue;
      const size = (a.isWall ? 17 : 15) * (sel === a ? 1.2 : 1);
      vText(ctx, a.name, x, y, size, a.isWall ? `rgba(234,124,86,${al})` : `rgba(246,218,160,${al})`, BRUSH);
    }
  }

  // ---------- mode transitions ----------
  const DYN = [[618, '唐'], [907, '五代'], [960, '宋'], [1279, '元'], [1368, '明'], [1644, '清'], [1912, '民国'], [1949, '今']];
  const epochEl = document.getElementById('epoch');
  function dynasty(y) { let d = '唐'; for (const [s, n] of DYN) if (y >= s) d = n; return d; }
  function currentYear() { const d = new Date(); return d.getUTCFullYear() + (d.getUTCMonth() + d.getUTCDate() / 31) / 12; }

  function setMode(m) {
    if (trans.on || m === mode) return;
    if (m === 'now' && sel && !tour) select(null);
    trans.on = true; trans.t0 = clock; trans.from = epoch;
    trans.to = m === 'now' ? currentYear() : TANG_YEAR;
    trans.rot0 = rot; trans.toMode = m;
    trans.dur = reduceMotion ? 0.01 : 6.2;
    bakeTarget = 0;
    body.classList.toggle('is-now', m === 'now');
    updateModeButtons(m);
    updateNowLine();
  }
  function stepTransition() {
    const p = clamp((clock - trans.t0) / trans.dur);
    const e = trans.toMode === 'now' ? easeIO(p / 0.6) : easeIO((p - 0.4) / 0.6);
    epoch = lerp(trans.from, trans.to, e);
    computeEpoch(epoch);
    if (trans.toMode === 'now') {
      const target = lstDeg(jdNow() + (1 - p) * trans.dur / 86400);
      const diff = ((target - trans.rot0 + 540) % 360) - 180;
      rot = trans.rot0 + diff * easeIO(p);
    }
    nowK = trans.toMode === 'now' ? smooth((p - 0.52) / 0.48) : 1 - smooth(p / 0.45);
    const yr = Math.floor(epoch);
    epochEl.querySelector('.ep-year').textContent = `公元 ${yr} 年`;
    epochEl.querySelector('.ep-dyn').textContent = dynasty(yr);
    epochEl.classList.toggle('is-on', p < 0.97);
    if (p >= 1) {
      trans.on = false;
      mode = trans.toMode;
      epoch = trans.to;
      computeEpoch(epoch);
      bakeSky();
      bakeAlpha = 0; bakeTarget = 1;
      nowK = mode === 'now' ? 1 : 0;
    }
  }

  // ---------- 此刻敦煌 status ----------
  const TERMS = [[1, 6, '小寒'], [1, 20, '大寒'], [2, 4, '立春'], [2, 19, '雨水'], [3, 6, '惊蛰'], [3, 21, '春分'], [4, 5, '清明'], [4, 20, '谷雨'],
    [5, 6, '立夏'], [5, 21, '小满'], [6, 6, '芒种'], [6, 21, '夏至'], [7, 7, '小暑'], [7, 23, '大暑'], [8, 8, '立秋'], [8, 23, '处暑'],
    [9, 8, '白露'], [9, 23, '秋分'], [10, 8, '寒露'], [10, 24, '霜降'], [11, 8, '立冬'], [11, 22, '小雪'], [12, 7, '大雪'], [12, 22, '冬至']];
  const VERSE = { '春': '斗柄东指，天下皆春', '夏': '斗柄南指，天下皆夏', '秋': '斗柄西指，天下皆秋', '冬': '斗柄北指，天下皆冬' };
  function updateNowLine() {
    const d = new Date();
    const parts = Object.fromEntries(new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })
      .formatToParts(d).map((p) => [p.type, p.value]));
    const mo = +parts.month, da = +parts.day;
    let term = '冬至';
    for (const [m, dd, t] of TERMS) if (mo > m || (mo === m && da >= dd)) term = t;
    const md = mo * 100 + da;
    const season = md >= 1108 || md < 204 ? '冬' : md >= 808 ? '秋' : md >= 506 ? '夏' : '春';
    sunAlt = sunAltitude(jdNow());
    let sky = '';
    if (sunAlt > 0) sky = '敦煌此刻正是白昼，这些星都在天光之后';
    else if (sunAlt > -12) sky = '敦煌此刻天色未尽，星光正在浮现';
    document.getElementById('nowWhere').textContent = `敦煌 · 北纬 ${DUNHUANG.lat.toFixed(1)}° 东经 ${DUNHUANG.lon.toFixed(1)}°`;
    document.getElementById('nowTime').textContent = `${parts.month}月${parts.day}日 ${parts.hour}:${parts.minute} 北京时间 · ${term}`;
    document.getElementById('nowVerse').textContent = `${VERSE[season]}（《鹖冠子》）`;
    const skyEl = document.getElementById('nowSky');
    skyEl.textContent = sky;
    skyEl.hidden = !sky;
  }
  setInterval(() => { if (mode === 'now' || trans.toMode === 'now') updateNowLine(); }, 20000);

  // ---------- tour ----------
  const TOUR = [
    { k: null, kick: '天极', name: '紫微', text: '北天的星终夜不落，绕着一个看不见的点旋转。古人把这里称作紫宫，是天帝所居。我们从宫城的中心走进去。' },
    { k: '北极', kick: '天之枢纽', text: '北极五星中最暗的一颗叫纽星，唐代它离天极不到一度，几乎不动，所以被当作天的枢纽。众星都在围着它转。' },
    { k: '勾陈', kick: '环卫帝居', text: '勾陈六星环绕北极，古籍说它是后宫与帝居常处。今天的北极星就是勾陈一，唐代时它离天极还有将近八度。' },
    { k: '天皇', kick: '统御群灵', text: '天皇大帝一星在勾陈口中，神名耀魄宝，主御群灵、执万神图。宫城最深处，住的是众神的名籍。' },
    { k: '紫微垣', kick: '宫墙十五星', text: '东西两藩共十五星，像两道宫墙护住中枢，南面留出宫门。墙内是官署、寝舍和厨膳，一座完整的天上都城。' },
    { k: '尚书', kick: '出纳王命', text: '尚书五星在宫门内，掌纳言与出纳诏令。政令从中枢发出，要先经过这里，才能传到人间。' },
    { k: '北斗', kick: '帝车', text: '出宫门，便是北斗。《天官书》说“斗为帝车，运于中央”。斗柄随四时转向，古人看它的指向就知道季节。' },
    { k: '文昌', kick: '天之六府', text: '文昌六星在斗魁之前，分别配上将、次将、贵相、司禄、司命、司寇，像一座缩小的官署，主计天下之事。' },
    { k: '天牢', kick: '贵人之牢', text: '最后一站是斗魁下的天牢，主绳愆禁暴。古人把法禁也放进天帝身边：连中枢近旁，也要受约束。' }
  ];
  const STOP = 11;
  const tourEl = document.getElementById('tour');
  function startTour() {
    if (!introDone) finishIntro();
    if (mode === 'now') setMode('tang');
    panelHide();
    tour = { i: -1, t0: clock };
    body.classList.add('is-touring');
    btnTour.textContent = '结束导览';
    btnTour.setAttribute('aria-pressed', 'true');
    tourEl.setAttribute('aria-hidden', 'false');
    showStop(0);
  }
  function showStop(i) {
    if (i < 0) i = 0;
    if (i >= TOUR.length) { endTour(); return; }
    const st = TOUR[i];
    tour.i = i; tour.t0 = clock;
    sel = st.k ? byName.get(st.k) : null;
    const name = st.name || st.k;
    document.getElementById('tKick').textContent = `${st.kick} · ${i + 1} / ${TOUR.length}`;
    const tn = document.getElementById('tName');
    tn.replaceChildren(...[...name].map((c) => { const s = document.createElement('span'); s.textContent = c; return s; }));
    tn.setAttribute('aria-label', name);
    document.getElementById('tText').textContent = st.text;
    document.getElementById('tPrev').disabled = i === 0;
    document.getElementById('tNext').textContent = i === TOUR.length - 1 ? '结束' : '下一站';
    tourEl.classList.remove('is-swap'); void tourEl.offsetWidth; tourEl.classList.add('is-swap');
    window.StarSound && window.StarSound.chime(sel ? sel.idx : 0);
  }
  function endTour() {
    tour = null; sel = null;
    body.classList.remove('is-touring');
    btnTour.textContent = '入宫导览';
    btnTour.setAttribute('aria-pressed', 'false');
    tourEl.setAttribute('aria-hidden', 'true');
  }
  document.getElementById('tPrev').addEventListener('click', () => tour && showStop(tour.i - 1));
  document.getElementById('tNext').addEventListener('click', () => tour && showStop(tour.i + 1));
  document.getElementById('tExit').addEventListener('click', endTour);
  const tBar = document.getElementById('tBar');

  // ---------- main loop ----------
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    clock += dt;
    if (!introDone) { introT += dt; if (introT > 11) finishIntro(); }
    const it = introT;

    if (trans.on) {
      stepTransition();
      if (trans.toMode === 'tang') rot += spin * dt;
    } else if (mode === 'now') {
      rot = lstDeg(jdNow());
    } else {
      const target = paused || reduceMotion || relicOpen ? 0 : (sel ? 0.08 : 0.42);
      spin += (target - spin) * (1 - Math.exp(-dt * 1.5));
      rot += spin * dt;
    }
    bakeAlpha += (bakeTarget - bakeAlpha) * (1 - Math.exp(-dt * (bakeTarget ? 2 : 8)));

    if (tour) {
      const p = (clock - tour.t0) / STOP;
      tBar.style.transform = `scaleX(${clamp(p)})`;
      if (p >= 1) showStop(tour.i + 1);
    }

    updateCam(dt);
    updateLamp(dt);
    asts.forEach((a) => {
      const e = 1 - Math.exp(-dt * 6);
      a.hov += ((a === hover ? 1 : 0) - a.hov) * e;
      a.light += ((a === sel ? 1 : 0) - a.light) * e;
    });
    updateScreen();

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);
    drawSkyGlow();

    const revealDeg = introDone ? 120 : ease((it - 1.3) / 5.6) * 120;
    {
      drawPaperLamp();
      if (bakeAlpha > 0.01) {
        ctx.save();
        ctx.translate(cam.ax - cam.z * cam.fx, cam.ay - cam.z * cam.fy);
        ctx.scale(cam.z, cam.z);
        ctx.rotate(-rot * D2R);
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = bakeAlpha;
        ctx.drawImage(bake, -R, -R, 2 * R, 2 * R);
        ctx.restore();
        ctx.globalAlpha = 1;
      }
      drawLiveMW(1 - bakeAlpha);
      drawLiveStars(1 - bakeAlpha);
      if (revealDeg < 110) {
        const [px, py] = scr(0, 0);
        const r0 = Math.max(0, revealDeg * S * cam.z);
        const r1 = r0 + 14 * S * cam.z;
        ctx.globalCompositeOperation = 'source-over';
        const g = ctx.createRadialGradient(px, py, r0, px, py, r1);
        g.addColorStop(0, 'rgba(4,6,12,0)');
        g.addColorStop(1, BG);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }
      drawGuides(introDone ? 1 : smooth((it - 4) / 2));
      drawBright(revealDeg);
      drawAsterisms(it);
      drawPole(it);
      drawMeteors(dt);
      drawGround();
      drawVignette();
      drawLabels(it);
    }
    drawHold();
    requestAnimationFrame(frame);
  }

  function finishIntro() {
    if (introDone) return;
    introDone = true;
    introT = 99;
    body.classList.add('is-in');
  }

  // ---------- lamp ----------
  function updateLamp(dt) {
    const want = lamp.mouse || performance.now() < lamp.touchUntil ? 1 : 0;
    lamp.amt += (want * (introDone ? 1 : 0) - lamp.amt) * (1 - Math.exp(-dt * (want ? 3 : 1.6)));
    const e = 1 - Math.exp(-dt * 9);
    lamp.x += (lamp.tx - lamp.x) * e;
    lamp.y += (lamp.ty - lamp.y) * e;
  }

  // ---------- interaction ----------
  function hit(x, y) {
    let best = null, bestD = mobile ? 26 : 16;
    for (const a of mainAsts) {
      if (!a.sp || !a.up) continue;
      for (const line of a.sp) {
        for (let j = 0; j < line.length; j++) {
          let d = Math.hypot(x - line[j][0], y - line[j][1]);
          if (j > 0) {
            const [x0, y0] = line[j - 1], [x1, y1] = line[j];
            const dx = x1 - x0, dy = y1 - y0, L2 = dx * dx + dy * dy;
            const t = L2 ? clamp(((x - x0) * dx + (y - y0) * dy) / L2) : 0;
            d = Math.min(d, Math.hypot(x - (x0 + t * dx), y - (y0 + t * dy)));
          }
          const bias = a.isWall ? 4 : 0;
          if (d + bias < bestD) { bestD = d + bias; best = a; }
        }
      }
    }
    return best;
  }

  let downAt = null;
  // press and hold on the sky to open the real manuscript
  const HOLD_MS = 800;
  const hold = { on: false, x: 0, y: 0, t0: 0, done: false };
  cv.addEventListener('contextmenu', (e) => e.preventDefault());
  cv.addEventListener('pointermove', (e) => {
    if (hold.on && Math.hypot(e.clientX - hold.x, e.clientY - hold.y) > 12) hold.on = false;
    if (e.pointerType === 'mouse') {
      lamp.mouse = true;
      lamp.tx = e.clientX; lamp.ty = e.clientY;
      if (lamp.x < -500) { lamp.x = lamp.tx; lamp.y = lamp.ty; }
      hover = introDone && !tour ? hit(e.clientX, e.clientY) : null;
      cv.style.cursor = hover ? 'pointer' : 'default';
    } else {
      lamp.tx = e.clientX; lamp.ty = e.clientY; lamp.touchUntil = performance.now() + 2600;
    }
  });
  cv.addEventListener('pointerleave', () => { lamp.mouse = false; hover = null; hold.on = false; });
  cv.addEventListener('pointercancel', () => { hold.on = false; downAt = null; });
  cv.addEventListener('pointerdown', (e) => {
    downAt = [e.clientX, e.clientY];
    if (introDone && !relicOpen && e.button === 0) Object.assign(hold, { on: true, x: e.clientX, y: e.clientY, t0: performance.now(), done: false });
    if (e.pointerType !== 'mouse') {
      lamp.tx = lamp.x = e.clientX; lamp.ty = lamp.y = e.clientY;
      lamp.touchUntil = performance.now() + 2600;
    }
  });
  cv.addEventListener('pointerup', (e) => {
    hold.on = false;
    if (!downAt) return;
    const moved = Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]);
    downAt = null;
    if (hold.done) { hold.done = false; return; }
    if (moved > 10) return;
    if (performance.now() - relicClosedAt < 450) return;   // the tail of a tap that closed the viewer
    if (!introDone) { finishIntro(); return; }
    const a = hit(e.clientX, e.clientY);
    if (tour) { if (!a) return; endTour(); }
    select(a || null);
    dismissHint();
  });
  window.addEventListener('keydown', (e) => {
    if (e.target && e.target.closest && e.target.closest('button') && (e.code === 'Space' || e.key === 'Enter')) return;
    if (!introDone && (e.key === 'Enter' || e.code === 'Space')) { finishIntro(); return; }
    if (e.code === 'Space') { e.preventDefault(); paused = !paused; }
    if (relicOpen) { if (e.key === 'Escape') closeRelic(); return; }
    if (e.key === 'Escape') { if (tour) endTour(); else select(null); }
    if (tour && e.key === 'ArrowRight') showStop(tour.i + 1);
    if (tour && e.key === 'ArrowLeft') showStop(tour.i - 1);
  });

  // ---------- panel ----------
  const panel = document.getElementById('panel');
  const el = (id) => document.getElementById(id);
  const guDu = (deg) => Math.round(deg * 365.25 / 360);
  function panelHide() { body.classList.remove('has-detail'); panel.setAttribute('aria-hidden', 'true'); }
  function select(a) {
    sel = a;
    if (!a) { panelHide(); return; }
    body.classList.add('has-detail');
    panel.setAttribute('aria-hidden', 'false');
    const t = TX[a.name] || {};
    const nameEl = el('pName');
    nameEl.replaceChildren(...[...a.name].map((c) => { const s = document.createElement('span'); s.textContent = c; return s; }));
    nameEl.setAttribute('aria-label', a.name);
    el('pIndex').textContent = `星官 ${String(a.idx + 1).padStart(2, '0')} / ${mainAsts.length}`;
    el('pCount').textContent = `${a.verts.length} 星`;
    const lo = guDu(a.minpd), hi = guDu(a.maxpd);
    el('pPolar').textContent = hi - lo < 6 ? `去极约 ${guDu((a.minpd + a.maxpd) / 2)} 度` : `去极 ${lo}–${hi} 度`;
    el('pLead').textContent = t.note || '';
    el('pDetail').textContent = t.detail || '';
    el('pSource').textContent = t.source || '';
    panel.scrollTop = 0;
    window.StarSound && window.StarSound.chime(a.idx);
  }
  el('pClose').addEventListener('click', () => select(null));

  const hint = el('hint');
  function dismissHint() { hint && hint.classList.add('is-gone'); }
  el('skip').addEventListener('click', finishIntro);

  // ---------- mode buttons ----------
  const btnNow = el('btnNow'), btnRelic = el('btnRelic'), btnTour = el('btnTour');
  function updateModeButtons(m) {
    btnNow.setAttribute('aria-pressed', String(m === 'now'));
    btnNow.textContent = m === 'now' ? '回到唐时' : '此刻敦煌';
  }
  btnNow.addEventListener('click', () => setMode(mode === 'now' || (trans.on && trans.toMode === 'now') ? 'tang' : 'now'));
  btnRelic.addEventListener('click', () => openRelic());

  btnTour.addEventListener('click', () => (tour ? endTour() : startTour()));

  // a gold ring fills around the pointer while it is held down
  function drawHold() {
    if (!hold.on) return;
    const p = (performance.now() - hold.t0) / HOLD_MS;
    if (p < 0.18) return;                       // a normal click never shows the ring
    const k = clamp((p - 0.18) / 0.82);
    if (k >= 1) { hold.on = false; hold.done = true; openRelic(hold.x, hold.y); return; }
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = `rgba(244,210,150,${0.25 + 0.5 * k})`;
    ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(hold.x, hold.y, 26, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 0.25 * k;
    ctx.drawImage(sprite(GOLD_HI), hold.x - 40, hold.y - 40, 80, 80);
    ctx.globalAlpha = 1;
  }

  // ---------- the real manuscript ----------
  let relicOpen = false, relicClosedAt = 0;
  const relic = el('relic'), stage = el('relicStage'), rImg = el('relicImg');
  const view2 = { s: 1, x: 0, y: 0, base: 1, ox: 0 };
  function relicFit() {
    const iw = rImg.naturalWidth || 2128, ih = rImg.naturalHeight || 2136;
    const pad = mobile ? 0.94 : 0.86;
    const w = Math.min(W * pad, H * pad * iw / ih);
    rImg.style.setProperty('--rw', w + 'px');
    view2.base = w;
    // leave the caption its own column on wide screens
    const cap = el('relic').querySelector('.relic-cap').getBoundingClientRect();
    const need = cap.right + 28 - (W - w) / 2;
    view2.ox = !mobile && need > 0 && (W + w) / 2 + need < W - 16 ? need : 0;
  }
  function relicApply() {
    const w = view2.base, h = w * ((rImg.naturalHeight || 2136) / (rImg.naturalWidth || 2128));
    const maxX = Math.max(0, (w * view2.s - W) / 2 + 40), maxY = Math.max(0, (h * view2.s - H) / 2 + 40);
    view2.x = clamp(view2.x, -maxX, maxX); view2.y = clamp(view2.y, -maxY, maxY);
    rImg.style.transform = `translate(${view2.x + view2.ox - w * view2.s / 2}px, ${view2.y - h * view2.s / 2}px) scale(${view2.s})`;
    relic.classList.toggle('is-zoomed', view2.s > 1.05);
  }
  function zoomAt(f, cx, cy) {
    const s2 = clamp(view2.s * f, 1, 6), k = s2 / view2.s;
    const ox = cx - W / 2 - view2.ox, oy = cy - H / 2;
    view2.x = ox - (ox - view2.x) * k; view2.y = oy - (oy - view2.y) * k; view2.s = s2;
    relicApply();
  }
  function openRelic() {
    if (relicOpen) return;
    if (!introDone) finishIntro();
    if (tour) endTour();
    select(null);
    relicOpen = true;
    Object.assign(view2, { s: 1, x: 0, y: 0 });
    relicFit(); relicApply();
    relic.setAttribute('aria-hidden', 'false');
    body.classList.add('relic-open');
    requestAnimationFrame(() => relic.classList.add('is-open'));
    window.StarSound && window.StarSound.chime(16);
    dismissHint();
    setTimeout(() => el('relicClose').focus({ preventScroll: true }), 50);
  }
  function closeRelic() {
    if (!relicOpen) return;
    relicOpen = false;
    relicClosedAt = performance.now();
    relic.classList.remove('is-open');
    relic.setAttribute('aria-hidden', 'true');
    body.classList.remove('relic-open');
    btnRelic.focus({ preventScroll: true });
  }
  el('relicClose').addEventListener('click', closeRelic);
  rImg.addEventListener('load', () => { relicFit(); relicApply(); });
  window.addEventListener('resize', () => { if (relicOpen) { relicFit(); relicApply(); } });
  stage.addEventListener('wheel', (e) => { e.preventDefault(); zoomAt(Math.exp(-e.deltaY * 0.0015), e.clientX, e.clientY); }, { passive: false });
  stage.addEventListener('dblclick', (e) => { zoomAt(view2.s > 1.5 ? 1 / view2.s : 2.6, e.clientX, e.clientY); });
  const ptrs = new Map();
  let pinch0 = 0, dragged = false, downXY = null;
  stage.addEventListener('pointerdown', (e) => {
    stage.setPointerCapture(e.pointerId);
    ptrs.set(e.pointerId, [e.clientX, e.clientY]);
    dragged = false; downXY = [e.clientX, e.clientY];
    if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch0 = Math.hypot(a[0] - b[0], a[1] - b[1]); }
    stage.classList.add('is-drag');
  });
  stage.addEventListener('pointermove', (e) => {
    if (!ptrs.has(e.pointerId)) return;
    const prev = ptrs.get(e.pointerId);
    ptrs.set(e.pointerId, [e.clientX, e.clientY]);
    if (downXY && Math.hypot(e.clientX - downXY[0], e.clientY - downXY[1]) > 6) dragged = true;
    if (ptrs.size === 2) {
      const [a, b] = [...ptrs.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]);
      if (pinch0 > 0) zoomAt(d / pinch0, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
      pinch0 = d;
    } else {
      view2.x += e.clientX - prev[0]; view2.y += e.clientY - prev[1];
      relicApply();
    }
  });
  const endPtr = (e) => {
    ptrs.delete(e.pointerId);
    if (ptrs.size < 2) pinch0 = 0;
    if (!ptrs.size) stage.classList.remove('is-drag');
    // a tap on the dark around the image closes the viewer
    // (only when the press also began here: the release of the long-press must not close it)
    // pointer capture makes every release target the stage, so test where the press really was
    if (downXY && !dragged && e.type === 'pointerup' && view2.s <= 1.01) {
      const r = rImg.getBoundingClientRect();
      const onImg = downXY[0] >= r.left && downXY[0] <= r.right && downXY[1] >= r.top && downXY[1] <= r.bottom;
      if (!onImg) closeRelic();
    }
    if (!ptrs.size) downXY = null;
  };
  stage.addEventListener('pointerup', endPtr);
  stage.addEventListener('pointercancel', endPtr);

  // ---------- go ----------
  resize();
  if (introDone) body.classList.add('is-in');
  const fontText = asts.map((a) => a.name).join('') + '北西东紫微';
  if (document.fonts && document.fonts.load) {
    document.fonts.load('16px "Ma Shan Zheng"', fontText).catch(() => {});
    document.fonts.load('12px "Noto Serif SC"', fontText).catch(() => {});
  }
  requestAnimationFrame((n) => { last = n; requestAnimationFrame(frame); });
})();
