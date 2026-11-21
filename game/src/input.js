// Twin Scenes — mouse, touch and keyboard input. A pointer click is first
// offered to the HUD buttons; otherwise, if it lands inside a panel while
// playing, it is tested against the current scene's differences. Clicking
// either panel counts: the two pictures are a pair, and a find on one side
// is a find on both.
import { CANVAS_HEIGHT, CANVAS_WIDTH, LEFT_PANEL, PANEL_HEIGHT, PANEL_WIDTH, RIGHT_PANEL } from './config.js';
import { SCENES } from './scenes.js';
import {
  SCREEN_PLAY,
  SCREEN_RESULTS,
  SCREEN_SCENE_DONE,
  SCREEN_TIMEOUT,
  SCREEN_TITLE,
  nextScene,
  retryScene,
  skipScene,
  startRun,
  startScene,
  toTitle,
  toggleMute,
  tryFind,
  useHint,
} from './state.js';
import { buttonAt } from './hud.js';
import { Sounds, unlockAudio } from './audio.js';

/** Convert a pointer event to canvas coordinates (1280 x 720 space). */
export function eventToCanvas(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * CANVAS_WIDTH,
    y: ((event.clientY - rect.top) / rect.height) * CANVAS_HEIGHT,
  };
}

/** Which panel (0 = left, 1 = right) holds canvas point (x, y), or -1. */
function panelAt(x, y) {
  if (y < LEFT_PANEL.y || y > LEFT_PANEL.y + PANEL_HEIGHT) return -1;
  if (x >= LEFT_PANEL.x && x <= LEFT_PANEL.x + PANEL_WIDTH) return 0;
  if (x >= RIGHT_PANEL.x && x <= RIGHT_PANEL.x + PANEL_WIDTH) return 1;
  return -1;
}

/** Panel-local coordinates for a canvas point inside the given panel. */
function panelLocal(panel, x, y) {
  const origin = panel === 0 ? LEFT_PANEL : RIGHT_PANEL;
  return { x: x - origin.x, y: y - origin.y };
}

function doButton(state, id) {
  switch (id) {
    case 'start':
      startRun(state);
      Sounds.click();
      return true;
    case 'card-0':
    case 'card-1':
    case 'card-2': {
      const index = Number(id.slice(5));
      startRun(state);
      state.sceneIndex = index;
      startScene(state);
      Sounds.click();
      return true;
    }
    case 'hint':
      return useHint(state);
    case 'restart':
      startScene(state);
      Sounds.click();
      return true;
    case 'sound':
      toggleMute(state);
      Sounds.click();
      return true;
    case 'menu':
      toTitle(state);
      Sounds.click();
      return true;
    case 'next':
      nextScene(state);
      Sounds.click();
      return true;
    case 'retry':
      retryScene(state);
      Sounds.click();
      return true;
    case 'skip':
      skipScene(state);
      Sounds.click();
      return true;
    case 'again':
      startRun(state);
      Sounds.click();
      return true;
    default:
      return false;
  }
}

/** Handle one pointer press at canvas coordinates (x, y). */
export function handlePointer(state, x, y) {
  unlockAudio();
  const button = buttonAt(state, x, y);
  if (button) {
    doButton(state, button.id);
    return;
  }
  if (state.screen !== SCREEN_PLAY) return;
  const panel = panelAt(x, y);
  if (panel === -1) return;
  const local = panelLocal(panel, x, y);
  tryFind(state, local.x, local.y);
}

/** Handle one key press. Returns true when the key did something. */
export function handleKey(state, key) {
  unlockAudio();
  const lower = key.toLowerCase();
  if (lower === 'm') {
    toggleMute(state);
    return true;
  }
  if (state.screen === SCREEN_TITLE) {
    if (key === 'Enter' || key === ' ') {
      startRun(state);
      Sounds.click();
      return true;
    }
    if (key === '1' || key === '2' || key === '3') {
      const index = Number(key) - 1;
      if (index < SCENES.length) {
        startRun(state);
        state.sceneIndex = index;
        startScene(state);
        Sounds.click();
        return true;
      }
    }
    return false;
  }
  if (state.screen === SCREEN_PLAY) {
    if (lower === 'h') return useHint(state);
    if (lower === 'r') {
      startScene(state);
      Sounds.click();
      return true;
    }
    if (key === 'Escape') {
      toTitle(state);
      Sounds.click();
      return true;
    }
    return false;
  }
  if (state.screen === SCREEN_SCENE_DONE && (key === 'Enter' || key === ' ' || lower === 'n')) {
    nextScene(state);
    Sounds.click();
    return true;
  }
  if (state.screen === SCREEN_TIMEOUT) {
    if (lower === 'r') {
      retryScene(state);
      Sounds.click();
      return true;
    }
    if (lower === 'n') {
      skipScene(state);
      Sounds.click();
      return true;
    }
    return false;
  }
  if (state.screen === SCREEN_RESULTS && (key === 'Enter' || key === ' ')) {
    startRun(state);
    Sounds.click();
    return true;
  }
  return false;
}
