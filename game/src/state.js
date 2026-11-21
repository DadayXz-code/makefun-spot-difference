// Twin Scenes — the game's state: which screen is showing, what has been
// found, the score, the clock and the per-scene results. Rendering and
// input read this; they never keep their own copy of it.
import {
  BEST_SCORE_KEY,
  COMBO_BONUS_PER_STEP,
  FOUND_POP_SECONDS,
  HINTS_PER_SCENE,
  HINT_COST,
  HINT_RING_SECONDS,
  MAX_COMBO_BONUS,
  MISS_MARK_SECONDS,
  MISS_PENALTY,
  POINTS_PER_FIND,
  SCENE_TIME_SECONDS,
  STAR_ACCURACY,
  STAR_TIME_SECONDS,
  TIME_BONUS_PER_SECOND,
} from './config.js';
import { SCENES } from './scenes.js';
import { Sounds, setMuted as setAudioMuted } from './audio.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_SCENE_DONE = 'scene-done';
export const SCREEN_RESULTS = 'results';
export const SCREEN_TIMEOUT = 'timeout';

/** A fresh, empty run. */
export function newState() {
  let best = 0;
  try {
    best = Number(window.localStorage.getItem(BEST_SCORE_KEY) ?? 0) || 0;
  } catch {
    best = 0;
  }
  return {
    screen: SCREEN_TITLE,
    sceneIndex: 0,
    // Indices of the current scene's differences already found.
    found: new Set(),
    // Names of found differences, in the order they were found.
    foundNames: [],
    score: 0,
    combo: 0,
    clicks: 0,
    hits: 0,
    misses: 0,
    hintsLeft: HINTS_PER_SCENE,
    timeLeft: SCENE_TIME_SECONDS,
    // Seconds the clock has spent under 30, for the warning tick.
    warnedAt: -1,
    // Per-scene results, one entry per finished scene.
    sceneResults: [],
    // Transient effects: { kind: 'pop'|'miss'|'hint', x, y, until, index }
    // in panel coordinates (x, y are on the right panel for pop/miss).
    effects: [],
    // Index of the difference a hint is currently ringing, or -1.
    hintTarget: -1,
    hintUntil: 0,
    best,
    muted: false,
    // Total seconds played across the run (for the results screen).
    elapsed: 0,
    // True while a screenshot staging (?shot=) freezes the clock.
    frozen: false,
  };
}

export function currentScene(state) {
  return SCENES[state.sceneIndex];
}

export function foundCount(state) {
  return state.found.size;
}

export function sceneTotal(state) {
  return currentScene(state).differences.length;
}

export function accuracy(state) {
  return state.clicks === 0 ? 1 : state.hits / state.clicks;
}

export function startRun(state) {
  state.screen = SCREEN_PLAY;
  state.sceneIndex = 0;
  state.score = 0;
  state.clicks = 0;
  state.hits = 0;
  state.misses = 0;
  state.elapsed = 0;
  state.sceneResults = [];
  startScene(state);
}

export function startScene(state) {
  state.found = new Set();
  state.foundNames = [];
  state.combo = 0;
  state.hintsLeft = HINTS_PER_SCENE;
  state.timeLeft = SCENE_TIME_SECONDS;
  state.warnedAt = -1;
  state.effects = [];
  state.hintTarget = -1;
  state.screen = SCREEN_PLAY;
}

/** Go back to the title screen, keeping the best score. */
export function toTitle(state) {
  state.screen = SCREEN_TITLE;
  state.effects = [];
  state.hintTarget = -1;
}

export function toggleMute(state) {
  state.muted = !state.muted;
  setAudioMuted(state.muted);
  return state.muted;
}

/**
 * Try the click at panel coordinates (x, y) against the current scene.
 * Returns 'found' | 'miss' | 'none' (none: not playing, or already found).
 */
export function tryFind(state, x, y) {
  if (state.screen !== SCREEN_PLAY) return 'none';
  const scene = currentScene(state);
  state.clicks += 1;
  for (let i = 0; i < scene.differences.length; i += 1) {
    if (state.found.has(i)) continue;
    const d = scene.differences[i];
    const dx = x - d.x;
    const dy = y - d.y;
    if (dx * dx + dy * dy <= d.r * d.r) {
      state.found.add(i);
      state.foundNames.push(d.name);
      state.hits += 1;
      state.combo += 1;
      const bonus = Math.min((state.combo - 1) * COMBO_BONUS_PER_STEP, MAX_COMBO_BONUS);
      state.score += POINTS_PER_FIND + bonus;
      state.effects.push({ kind: 'pop', x: d.x, y: d.y, index: i, until: FOUND_POP_SECONDS });
      if (state.hintTarget === i) {
        state.hintTarget = -1;
      }
      Sounds.found();
      if (state.found.size === scene.differences.length) finishScene(state);
      return 'found';
    }
  }
  state.misses += 1;
  state.combo = 0;
  state.score = Math.max(0, state.score - MISS_PENALTY);
  state.effects.push({ kind: 'miss', x, y, until: MISS_MARK_SECONDS });
  Sounds.miss();
  return 'miss';
}

/** Spend a hint: ring a random still-hidden difference for a few seconds. */
export function useHint(state) {
  if (state.screen !== SCREEN_PLAY) return false;
  if (state.hintsLeft <= 0) return false;
  const scene = currentScene(state);
  const hidden = [];
  for (let i = 0; i < scene.differences.length; i += 1) {
    if (!state.found.has(i)) hidden.push(i);
  }
  if (hidden.length === 0) return false;
  state.hintsLeft -= 1;
  state.score = Math.max(0, state.score - HINT_COST);
  state.hintTarget = hidden[Math.floor(Math.random() * hidden.length)];
  state.hintUntil = HINT_RING_SECONDS;
  Sounds.hint();
  return true;
}

/** Stars for a finished scene: 3 for fast and accurate, 2 for clean, else 1. */
export function starsFor(result) {
  if (result.accuracy >= STAR_ACCURACY && result.timeLeft >= STAR_TIME_SECONDS) return 3;
  if (result.accuracy >= 0.75) return 2;
  return 1;
}

function finishScene(state) {
  const timeBonus = Math.round(state.timeLeft) * TIME_BONUS_PER_SECOND;
  state.score += timeBonus;
  const result = {
    sceneIndex: state.sceneIndex,
    name: currentScene(state).name,
    found: state.found.size,
    total: sceneTotal(state),
    accuracy: accuracy(state),
    timeLeft: Math.round(state.timeLeft),
    timeBonus,
    score: state.score,
    stars: 0,
  };
  result.stars = starsFor(result);
  state.sceneResults.push(result);
  state.hintTarget = -1;
  if (state.sceneIndex + 1 >= SCENES.length) {
    state.screen = SCREEN_RESULTS;
    Sounds.gameComplete();
    saveBest(state);
  } else {
    state.screen = SCREEN_SCENE_DONE;
    Sounds.sceneComplete();
  }
}

/** Advance from the scene-done overlay to the next scene. */
export function nextScene(state) {
  if (state.screen !== SCREEN_SCENE_DONE) return;
  state.sceneIndex += 1;
  startScene(state);
}

/** Retry the scene whose clock ran out, keeping the run's score. */
export function retryScene(state) {
  if (state.screen !== SCREEN_TIMEOUT) return;
  startScene(state);
}

/** Continue to the next scene after a timeout, with this scene unfinished. */
export function skipScene(state) {
  if (state.screen !== SCREEN_TIMEOUT) return;
  state.sceneResults.push({
    sceneIndex: state.sceneIndex,
    name: currentScene(state).name,
    found: state.found.size,
    total: sceneTotal(state),
    accuracy: accuracy(state),
    timeLeft: 0,
    timeBonus: 0,
    score: state.score,
    stars: 0,
  });
  if (state.sceneIndex + 1 >= SCENES.length) {
    state.screen = SCREEN_RESULTS;
    saveBest(state);
  } else {
    state.sceneIndex += 1;
    startScene(state);
  }
}

function saveBest(state) {
  if (state.score <= state.best) return;
  state.best = state.score;
  try {
    window.localStorage.setItem(BEST_SCORE_KEY, String(state.best));
  } catch {
    // Private mode or no storage: the best score just does not persist.
  }
}

/** Advance the clock and the transient effects by dt seconds. */
export function update(state, dt) {
  if (state.frozen) return;
  for (const effect of state.effects) effect.until -= dt;
  state.effects = state.effects.filter((effect) => effect.until > 0);
  if (state.hintTarget >= 0) {
    state.hintUntil -= dt;
    if (state.hintUntil <= 0) state.hintTarget = -1;
  }
  if (state.screen !== SCREEN_PLAY) return;
  state.elapsed += dt;
  state.timeLeft -= dt;
  const whole = Math.ceil(state.timeLeft);
  if (state.timeLeft <= 30 && whole !== state.warnedAt) {
    state.warnedAt = whole;
    Sounds.tick();
  }
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    state.screen = SCREEN_TIMEOUT;
    state.hintTarget = -1;
  }
}
