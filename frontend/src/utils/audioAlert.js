// Real-world Web Audio API Synthesizer Notification Chime & Ringtone for Tracto Platform

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Plays a pleasant 3-tone notification chime for new booking requests or dispatches
 */
export function playNotificationChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [587.33, 783.99, 1046.5]; // D5, G5, C6 (Pleasant Uplifting Chime)
    const now = ctx.currentTime;

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + index * 0.12);

      gain.gain.setValueAtTime(0, now + index * 0.12);
      gain.gain.linearRampToValueAtTime(0.3, now + index * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.12 + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + index * 0.12);
      osc.stop(now + index * 0.12 + 0.45);
    });

    // Also trigger mobile device vibration if available
    if ("vibrate" in navigator) {
      navigator.vibrate([150, 80, 150]);
    }
  } catch (err) {
    console.warn("Audio chime could not play (user interaction may be required):", err);
  }
}

/**
 * Plays a high-attention incoming ride alert ringtone for tractor owners (like Uber/Ola dispatch)
 */
export function playIncomingRideAlert() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const sweeps = [
      { startFreq: 440, endFreq: 880, time: 0 },
      { startFreq: 660, endFreq: 1320, time: 0.18 },
      { startFreq: 880, endFreq: 1760, time: 0.36 },
    ];

    sweeps.forEach(({ startFreq, endFreq, time }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(startFreq, now + time);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + time + 0.14);

      gain.gain.setValueAtTime(0.25, now + time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + time + 0.16);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + 0.18);
    });

    if ("vibrate" in navigator) {
      navigator.vibrate([200, 100, 200, 100, 300]);
    }
  } catch (err) {
    console.warn("Incoming ride alert error:", err);
  }
}
