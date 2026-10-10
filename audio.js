/* 听星河: generated in the browser, starts only from the button. */
(() => {
  'use strict';
  let ctx = null, master = null, wet = null, playing = false, timer = 0;
  // D 宫调五声: 宫 商 角 徵 羽
  const PENTA = [293.66, 329.63, 369.99, 440.0, 493.88];

  function impulse(seconds) {
    const rate = ctx.sampleRate, len = Math.floor(rate * seconds);
    const buf = ctx.createBuffer(2, len, rate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
    }
    return buf;
  }

  function init() {
    if (ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    const verb = ctx.createConvolver();
    verb.buffer = impulse(5.5);
    wet = ctx.createGain();
    wet.gain.value = 0.55;
    wet.connect(verb).connect(master);

    // drone: low D and A, gently breathing
    [[73.42, 0.05], [110, 0.026], [146.83, 0.012]].forEach(([f, g], i) => {
      const o = ctx.createOscillator(), a = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
      o.type = 'sine'; o.frequency.value = f; o.detune.value = (i - 1) * 4;
      a.gain.value = g;
      lfo.frequency.value = 0.05 + i * 0.03; lg.gain.value = g * 0.5;
      lfo.connect(lg).connect(a.gain);
      o.connect(a); a.connect(master); a.connect(wet);
      o.start(); lfo.start();
    });
    // night wind: filtered noise
    const n = ctx.createBufferSource();
    const nb = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
    const nd = nb.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    n.buffer = nb; n.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 520; bp.Q.value = 0.7;
    const ng = ctx.createGain(); ng.gain.value = 0.006;
    n.connect(bp).connect(ng); ng.connect(wet);
    n.start();
    return true;
  }

  function bell(freq, when, gain) {
    [[1, 1], [2.76, 0.32], [5.4, 0.12]].forEach(([ratio, amp]) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = freq * ratio;
      g.gain.setValueAtTime(0.0001, when);
      g.gain.exponentialRampToValueAtTime(gain * amp, when + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, when + 4.5 / ratio);
      o.connect(g); g.connect(master); g.connect(wet);
      o.start(when); o.stop(when + 5);
    });
  }

  function loop() {
    if (!playing) return;
    const now = ctx.currentTime;
    const f = PENTA[Math.floor(Math.random() * PENTA.length)] * (Math.random() < 0.3 ? 0.5 : 1);
    bell(f, now + 0.05, 0.035);
    if (Math.random() < 0.35) bell(f * 1.5, now + 0.9 + Math.random(), 0.014);
    timer = setTimeout(loop, 2600 + Math.random() * 3600);
  }

  async function start() {
    if (!init()) return false;
    if (ctx.state === 'suspended') { try { await ctx.resume(); } catch (e) { return false; } }
    playing = true;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(0.9, ctx.currentTime, 1.2);
    clearTimeout(timer);
    timer = setTimeout(loop, 1200);
    return true;
  }
  function stop() {
    playing = false;
    clearTimeout(timer);
    if (master) master.gain.setTargetAtTime(0, ctx.currentTime, 0.5);
  }

  const btn = document.getElementById('sound');
  btn.addEventListener('click', async () => {
    if (playing) { stop(); } else { await start(); }
    btn.setAttribute('aria-pressed', String(playing));
    btn.querySelector('.sound-label').textContent = playing ? '静夜' : '听星河';
  });

  window.StarSound = {
    wake() {},
    chime(i) {
      if (!playing || i < 0) return;
      const f = PENTA[i % 5] * (i % 10 < 5 ? 1 : 2);
      bell(f, ctx.currentTime + 0.02, 0.06);
    }
  };
})();
