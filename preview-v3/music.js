(() => {
  let ctx = null;
  let master = null;
  let timer = null;
  let playing = false;
  let step = 0;
  let gestureArmed = false;

  const scale = [220, 246.94, 293.66, 329.63, 392, 440];

  function init() {
    if (ctx) return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 0.0001;
    master.connect(ctx.destination);

    const drone = ctx.createOscillator();
    const droneGain = ctx.createGain();
    drone.type = 'sine';
    drone.frequency.value = 55;
    droneGain.gain.value = 0.025;
    drone.connect(droneGain).connect(master);
    drone.start();

    const overtone = ctx.createOscillator();
    const overtoneGain = ctx.createGain();
    overtone.type = 'sine';
    overtone.frequency.value = 110;
    overtoneGain.gain.value = 0.008;
    overtone.connect(overtoneGain).connect(master);
    overtone.start();
  }

  function pluck(frequency, when, duration, gain) {
    const oscillator = ctx.createOscillator();
    const envelope = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(frequency, when);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1800, when);
    envelope.gain.setValueAtTime(0.0001, when);
    envelope.gain.exponentialRampToValueAtTime(gain, when + 0.018);
    envelope.gain.exponentialRampToValueAtTime(0.0001, when + duration);
    oscillator.connect(filter).connect(envelope).connect(master);
    oscillator.start(when);
    oscillator.stop(when + duration + 0.05);
  }

  function shimmer(when) {
    const oscillator = ctx.createOscillator();
    const envelope = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = 880 + Math.random() * 440;
    envelope.gain.setValueAtTime(0.0001, when);
    envelope.gain.exponentialRampToValueAtTime(0.007, when + 0.04);
    envelope.gain.exponentialRampToValueAtTime(0.0001, when + 1.7);
    oscillator.connect(envelope).connect(master);
    oscillator.start(when);
    oscillator.stop(when + 1.8);
  }

  function schedule() {
    if (!playing || !ctx) return;

    const now = ctx.currentTime;
    const base = scale[(step * 2 + (step % 3)) % scale.length];
    pluck(base, now + 0.05, 2.1, 0.03);

    if (step % 3 === 1) pluck(base * 2, now + 0.75, 1.5, 0.012);
    if (step % 5 === 0) shimmer(now + 1.1);

    step += 1;
    timer = window.setTimeout(schedule, 2400 + Math.random() * 1900);
  }

  function removeGestureListeners() {
    if (!gestureArmed) return;
    gestureArmed = false;
    ['pointerdown', 'touchstart', 'keydown'].forEach((eventName) => {
      window.removeEventListener(eventName, startOnGesture, true);
    });
  }

  function startOnGesture() {
    start();
  }

  function armGestureFallback() {
    if (gestureArmed || playing) return;
    gestureArmed = true;
    ['pointerdown', 'touchstart', 'keydown'].forEach((eventName) => {
      window.addEventListener(eventName, startOnGesture, true);
    });
  }

  async function start() {
    init();
    if (!ctx || !master) return;

    try {
      if (ctx.state === 'suspended') {
        await Promise.race([
          ctx.resume(),
          new Promise((_, reject) => window.setTimeout(() => reject(new Error('autoplay-blocked')), 400))
        ]);
      }
    } catch (error) {
      armGestureFallback();
      return;
    }

    if (ctx.state !== 'running') {
      armGestureFallback();
      return;
    }

    removeGestureListeners();
    if (playing) return;

    playing = true;
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), now);
    master.gain.exponentialRampToValueAtTime(0.42, now + 1.8);
    schedule();
  }

  window.addEventListener('DOMContentLoaded', () => {
    window.setTimeout(start, 120);
  });
})();
