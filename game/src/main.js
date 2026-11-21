// Twin Scenes — bootstrap. Wires the canvas, the input and the game loop
// together, then steps the state and draws it every animation frame.
//
// The loop is deliberately plain: requestAnimationFrame, a clamped delta so
// a tab that was hidden does not fast-forward the clock, and one draw per
// frame. The game state is exposed as window.__game so an automated
// play-test (or a curious player in the console) can read it.
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './config.js';
import { draw } from './render.js';
import { eventToCanvas, handleKey, handlePointer } from './input.js';
import { currentScene, newState, tryFind, update } from './state.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const state = shot ? stageShot(shot) : newState();

// Exposed for play-testing: window.__game.state, .shot, and a helper that
// clicks a difference of the current scene by index (as a player would).
window.__game = {
  state,
  shot,
  clickDifference(index) {
    const diff = currentScene(state).differences[index];
    if (!diff) return 'none';
    return tryFind(state, diff.x, diff.y);
  },
};

canvas.addEventListener('pointerdown', (event) => {
  event.preventDefault();
  const point = eventToCanvas(event, canvas);
  handlePointer(state, point.x, point.y);
});

window.addEventListener('keydown', (event) => {
  if (event.repeat) return;
  const handled = handleKey(state, event.key);
  if (handled) event.preventDefault();
});

let last = performance.now();
function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.1);
  last = now;
  update(state, dt);
  draw(ctx, state, now / 1000);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
