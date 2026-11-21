// Twin Scenes — shared constants. One place for every number the game
// balances on: canvas size, panel layout, timing and scoring.
export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;

// Each scene is drawn in a 600 x 400 panel. The two panels sit side by
// side with a gap between them, under the top bar.
export const PANEL_WIDTH = 600;
export const PANEL_HEIGHT = 400;
export const LEFT_PANEL = { x: 20, y: 118 };
export const RIGHT_PANEL = { x: 660, y: 118 };
export const PANEL_GAP = 20;

// How close a click must land to a difference's centre to count, in panel
// pixels. A little generous so a fair find never feels robbed.
export const CLICK_TOLERANCE = 8;

// Seconds on the clock when a scene starts.
export const SCENE_TIME_SECONDS = 150;

// Scoring.
export const POINTS_PER_FIND = 100;
export const COMBO_BONUS_PER_STEP = 10;
export const MAX_COMBO_BONUS = 50;
export const MISS_PENALTY = 15;
export const HINT_COST = 50;
export const HINTS_PER_SCENE = 3;
export const TIME_BONUS_PER_SECOND = 2;

// How long a hint ring pulses over its difference, and how long a wrong
// click's red cross stays on screen (seconds).
export const HINT_RING_SECONDS = 3;
export const MISS_MARK_SECONDS = 0.6;
export const FOUND_POP_SECONDS = 0.45;

// Stars on the results screen: a scene earns 3 stars with high accuracy
// and plenty of time left, 2 with a clean finish, 1 for finishing at all.
export const STAR_TIME_SECONDS = 60;
export const STAR_ACCURACY = 0.9;

// Best score key in localStorage.
export const BEST_SCORE_KEY = 'twin-scenes-best-score';
