// Twin Scenes — screenshot staging. The URL query ?shot=<name> puts the
// game into a fixed, deterministic state so a screenshot is a real render
// of the game's own code, exactly as a player would reach it:
//
//   ?shot=start  — the title screen.
//   ?shot=play   — Night Market mid-game: 3 of 7 found, clock at 2:31.
//   ?shot=play2  — Botanical Garden mid-game: 5 of 7 found, 1 hint left.
//   ?shot=end    — the results screen of a finished three-scene run.
//
// In shot mode the clock is frozen, so the same URL always gives the same
// frame. Normal play (no ?shot=) is untouched.
import { SCREEN_PLAY, SCREEN_RESULTS, SCREEN_TITLE, newState, startRun } from './state.js';
import { SCENES } from './scenes.js';

function markFound(state, indices, score) {
  const scene = SCENES[state.sceneIndex];
  for (const i of indices) {
    state.found.add(i);
    state.foundNames.push(scene.differences[i].name);
  }
  state.hits = indices.length;
  state.clicks = indices.length + 1;
  state.misses = 1;
  state.score = score;
  state.combo = indices.length;
}

/** Stage the named shot on a fresh state. Unknown names stage 'start'. */
export function stageShot(name) {
  const state = newState();
  state.frozen = true;
  if (name === 'play') {
    startRun(state);
    state.sceneIndex = 0;
    markFound(state, [0, 2, 4], 315);
    state.timeLeft = 151;
    state.screen = SCREEN_PLAY;
    return state;
  }
  if (name === 'play2') {
    startRun(state);
    state.sceneIndex = 2;
    // Re-enter the garden scene directly (startRun began scene 0).
    state.found = new Set();
    state.foundNames = [];
    state.combo = 0;
    state.hintsLeft = 1;
    state.timeLeft = 68;
    state.screen = SCREEN_PLAY;
    markFound(state, [0, 1, 3, 4, 6], 640);
    state.hintsLeft = 1;
    state.timeLeft = 68;
    return state;
  }
  if (name === 'end') {
    startRun(state);
    state.sceneResults = [
      { sceneIndex: 0, name: 'Night Market', found: 7, total: 7, accuracy: 0.92, timeLeft: 74, timeBonus: 148, score: 920, stars: 3 },
      { sceneIndex: 1, name: 'Mountain Lake', found: 7, total: 7, accuracy: 0.86, timeLeft: 41, timeBonus: 82, score: 1620, stars: 2 },
      { sceneIndex: 2, name: 'Botanical Garden', found: 7, total: 7, accuracy: 0.95, timeLeft: 88, timeBonus: 176, score: 2540, stars: 3 },
    ];
    state.score = 2540;
    state.best = 2540;
    state.hits = 23;
    state.clicks = 26;
    state.misses = 3;
    state.elapsed = 412;
    state.screen = SCREEN_RESULTS;
    return state;
  }
  state.screen = SCREEN_TITLE;
  return state;
}
