// Twin Scenes — all sound is synthesised with WebAudio. No audio files are
// shipped, so the game loads nothing over the network and stays silent
// until the player first interacts (browsers require a gesture first).

let audioContext = null;
let muted = false;

export function isMuted() {
  return muted;
}

export function setMuted(value) {
  muted = value;
}

function context() {
  if (audioContext === null) {
    const AudioCtor = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioCtor) return null;
    audioContext = new AudioCtor();
  }
  if (audioContext.state === 'suspended') void audioContext.resume();
  return audioContext;
}

/** Unlock audio on the first pointer or key gesture. Safe to call often. */
export function unlockAudio() {
  context();
}

function tone(freq, startAt, duration, type, volume) {
  const ac = context();
  if (ac === null || muted) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime + startAt);
  gain.gain.setValueAtTime(0.0001, ac.currentTime + startAt);
  gain.gain.exponentialRampToValueAtTime(volume, ac.currentTime + startAt + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + startAt + duration);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(ac.currentTime + startAt);
  osc.stop(ac.currentTime + startAt + duration + 0.05);
}

export const Sounds = {
  /** A soft tick for a plain click. */
  click() {
    tone(660, 0, 0.06, 'sine', 0.08);
  },
  /** Two-note chime when a difference is found. */
  found() {
    tone(659.25, 0, 0.14, 'sine', 0.16);
    tone(880, 0.09, 0.22, 'sine', 0.16);
  },
  /** Low buzz for a wrong click. */
  miss() {
    tone(140, 0, 0.18, 'sawtooth', 0.07);
    tone(110, 0.05, 0.2, 'sawtooth', 0.06);
  },
  /** A gentle pluck when a hint is spent. */
  hint() {
    tone(523.25, 0, 0.12, 'triangle', 0.12);
    tone(783.99, 0.08, 0.18, 'triangle', 0.1);
  },
  /** Rising arpeggio when a scene is completed. */
  sceneComplete() {
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => tone(freq, i * 0.11, 0.3, 'sine', 0.15));
  },
  /** A longer fanfare for finishing all three scenes. */
  gameComplete() {
    [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.5].forEach((freq, i) => tone(freq, i * 0.12, 0.32, 'sine', 0.14));
  },
  /** A short tick-tock warning when the clock drops under 30 seconds. */
  tick() {
    tone(980, 0, 0.05, 'sine', 0.06);
  },
};
