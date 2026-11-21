// Twin Scenes — every clickable button's rectangle, in canvas coordinates
// (1280 x 720). Render draws them, input hit-tests them; both import this
// one file so a button can never look clickable where it is not.
//
// Button ids: 'hint' | 'restart' | 'sound' | 'menu' | 'start' | 'next' |
// 'retry' | 'skip' | 'again' | 'card-0' | 'card-1' | 'card-2'.
import {
  SCREEN_PLAY,
  SCREEN_RESULTS,
  SCREEN_SCENE_DONE,
  SCREEN_TIMEOUT,
  SCREEN_TITLE,
} from './state.js';

/** The three scene cards on the title screen. */
export const TITLE_CARDS = [
  { x: 110, y: 296, w: 330, h: 168 },
  { x: 475, y: 296, w: 330, h: 168 },
  { x: 840, y: 296, w: 330, h: 168 },
];

export const START_BUTTON = { x: 490, y: 500, w: 300, h: 58 };
export const NEXT_BUTTON = { x: 540, y: 468, w: 200, h: 54 };
export const RETRY_BUTTON = { x: 420, y: 468, w: 190, h: 54 };
export const SKIP_BUTTON = { x: 650, y: 468, w: 190, h: 54 };
export const AGAIN_BUTTON = { x: 490, y: 588, w: 300, h: 56 };
export const RESULTS_MENU_BUTTON = { x: 560, y: 656, w: 160, h: 40 };

/** The control buttons under the panels, shown while playing. */
export function playButtons(state) {
  return [
    { id: 'hint', label: `Hint  ·  ${state.hintsLeft} left`, x: 660, y: 566, w: 150, h: 46, disabled: state.hintsLeft <= 0 },
    { id: 'restart', label: 'Restart scene', x: 824, y: 566, w: 150, h: 46, disabled: false },
    { id: 'sound', label: state.muted ? 'Sound: off' : 'Sound: on', x: 988, y: 566, w: 130, h: 46, disabled: false },
    { id: 'menu', label: 'Main menu', x: 1132, y: 566, w: 128, h: 46, disabled: false },
  ];
}

/** Every button on screen right now, as { id, x, y, w, h, disabled }. */
export function visibleButtons(state) {
  switch (state.screen) {
    case SCREEN_TITLE:
      return [
        { id: 'start', ...START_BUTTON, disabled: false },
        ...TITLE_CARDS.map((card, i) => ({ id: `card-${i}`, ...card, disabled: false })),
      ];
    case SCREEN_PLAY:
      return playButtons(state);
    case SCREEN_SCENE_DONE:
      return [{ id: 'next', ...NEXT_BUTTON, disabled: false }];
    case SCREEN_TIMEOUT:
      return [
        { id: 'retry', ...RETRY_BUTTON, disabled: false },
        { id: 'skip', ...SKIP_BUTTON, disabled: false },
      ];
    case SCREEN_RESULTS:
      return [
        { id: 'again', ...AGAIN_BUTTON, disabled: false },
        { id: 'menu', ...RESULTS_MENU_BUTTON, disabled: false },
      ];
    default:
      return [];
  }
}

/** The button under canvas point (x, y), or null. */
export function buttonAt(state, x, y) {
  for (const button of visibleButtons(state)) {
    if (button.disabled) continue;
    if (x >= button.x && x <= button.x + button.w && y >= button.y && y <= button.y + button.h) return button;
  }
  return null;
}

export function pointInRect(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}
