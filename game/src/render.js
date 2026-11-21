// Twin Scenes — everything the player sees, drawn on one 1280 x 720 canvas:
// the title screen, the two picture panels with their markers, the top bar
// and bottom controls, and the scene-done / timeout / results overlays.
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  FOUND_POP_SECONDS,
  LEFT_PANEL,
  MISS_MARK_SECONDS,
  PANEL_HEIGHT,
  PANEL_WIDTH,
  RIGHT_PANEL,
} from './config.js';
import { SCENES } from './scenes.js';
import {
  SCREEN_PLAY,
  SCREEN_RESULTS,
  SCREEN_SCENE_DONE,
  SCREEN_TIMEOUT,
  SCREEN_TITLE,
  accuracy,
  currentScene,
  foundCount,
  sceneTotal,
} from './state.js';
import {
  AGAIN_BUTTON,
  NEXT_BUTTON,
  RESULTS_MENU_BUTTON,
  RETRY_BUTTON,
  SKIP_BUTTON,
  START_BUTTON,
  TITLE_CARDS,
  playButtons,
} from './hud.js';

function text(ctx, str, x, y, size, fill, weight = '700', align = 'center') {
  ctx.font = `${weight} ${size}px "Trebuchet MS", "Segoe UI", sans-serif`;
  ctx.fillStyle = fill;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function roundRect(ctx, x, y, w, h, r, fill) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

function circle(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function formatTime(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}

function formatScore(score) {
  return score.toLocaleString('en-US');
}

function stars(ctx, x, y, count, size = 26) {
  for (let i = 0; i < 3; i += 1) {
    const filled = i < count;
    drawStar(ctx, x + i * (size + 6), y, size / 2, filled ? '#ffc93c' : 'rgba(255,255,255,0.25)');
  }
}

function drawStar(ctx, x, y, r, fill) {
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const radius = i % 2 === 0 ? r : r * 0.45;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawButton(ctx, button, label, accent = false) {
  const { x, y, w, h } = button;
  roundRect(ctx, x, y, w, h, 10, button.disabled ? 'rgba(255,255,255,0.14)' : accent ? '#ff9f1c' : 'rgba(255,255,255,0.92)');
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 10);
  ctx.strokeStyle = accent ? '#d97e06' : 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, label, x + w / 2, y + h / 2 + 1, 17, button.disabled ? 'rgba(255,255,255,0.45)' : accent ? '#3a2503' : '#263238', '800');
}

// Miniature renders of each scene for the title cards, cached after the
// first draw (each scene is drawn once at full size, then scaled down).
const previewCache = new Map();
function scenePreview(index) {
  if (previewCache.has(index)) return previewCache.get(index);
  const off = document.createElement('canvas');
  off.width = PANEL_WIDTH;
  off.height = PANEL_HEIGHT;
  SCENES[index].draw(off.getContext('2d'), 0);
  previewCache.set(index, off);
  return off;
}

// ---------------------------------------------------------------------------
// Title screen.
// ---------------------------------------------------------------------------

function drawTitle(ctx, state) {
  const bg = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  bg.addColorStop(0, '#1d2b4f');
  bg.addColorStop(0.6, '#274b63');
  bg.addColorStop(1, '#1a2f45');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  // Soft decorative dots.
  for (let i = 0; i < 40; i += 1) {
    const x = (i * 173) % CANVAS_WIDTH;
    const y = (i * 97) % 220;
    circle(ctx, x, y, 2, 'rgba(255,255,255,0.08)');
  }
  text(ctx, 'TWIN SCENES', 640, 92, 64, '#ffffff', '900');
  text(ctx, 'S P O T   T H E   D I F F E R E N C E', 640, 142, 21, '#ffd166', '800');
  text(ctx, 'Two pictures. Seven hidden changes in each. Find them all before the clock runs out.', 640, 182, 18, 'rgba(255,255,255,0.85)', '400');
  text(ctx, 'Click a difference on either picture  ·  H for a hint  ·  1 / 2 / 3 to jump to a scene', 640, 212, 15, 'rgba(255,255,255,0.6)', '400');

  for (let i = 0; i < SCENES.length; i += 1) {
    const card = TITLE_CARDS[i];
    const scene = SCENES[i];
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 6;
    roundRect(ctx, card.x, card.y, card.w, card.h, 14, '#ffffff');
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(card.x + 6, card.y + 6, card.w - 12, 108, 10);
    ctx.clip();
    ctx.drawImage(scenePreview(i), card.x + 6, card.y + 6, card.w - 12, 108);
    ctx.restore();
    text(ctx, `${i + 1}. ${scene.name}`, card.x + card.w / 2, card.y + 132, 19, '#263238', '800');
    text(ctx, scene.subtitle, card.x + card.w / 2, card.y + 154, 12, '#607d8b', '400');
    // Difficulty dots: filled for this scene's level, faint for the rest.
    for (let d = 0; d < 3; d += 1) {
      circle(ctx, card.x + 16 + d * 14, card.y + 132, 4, d < scene.difficulty ? '#ff9f1c' : 'rgba(0,0,0,0.15)');
    }
  }
  drawButton(ctx, { ...START_BUTTON, disabled: false }, '▶  Start the hunt', true);
  if (state.best > 0) {
    text(ctx, `Best score: ${formatScore(state.best)}`, 640, 588, 17, '#ffd166', '800');
  }
  text(ctx, 'Three original scenes · 21 differences · hints, combos and a ticking clock', 640, 622, 14, 'rgba(255,255,255,0.55)', '400');
}

// ---------------------------------------------------------------------------
// Play screen: top bar, panels, markers, bottom bar.
// ---------------------------------------------------------------------------

function drawTopBar(ctx, state) {
  ctx.fillStyle = '#16233a';
  ctx.fillRect(0, 0, CANVAS_WIDTH, 72);
  text(ctx, 'TWIN SCENES', 130, 37, 26, '#ffffff', '900', 'left');
  const scene = currentScene(state);
  text(ctx, `Scene ${state.sceneIndex + 1} of ${SCENES.length} — ${scene.name}`, 640, 28, 20, '#ffffff', '800');
  text(ctx, scene.subtitle, 640, 54, 13, 'rgba(255,255,255,0.6)', '400');
  // Found counter, big and unmissable.
  const found = foundCount(state);
  const total = sceneTotal(state);
  const counter = `${found} / ${total}`;
  roundRect(ctx, 1008, 14, 96, 44, 10, found === total ? '#2e9e5b' : 'rgba(255,255,255,0.12)');
  text(ctx, 'FOUND', 1056, 26, 10, '#ffd166', '800');
  text(ctx, counter, 1056, 44, 20, '#ffffff', '900');
  // Timer.
  const low = state.timeLeft <= 30;
  text(ctx, `⏱ ${formatTime(state.timeLeft)}`, 880, 37, 24, low ? '#ff6b6b' : '#ffffff', '900', 'left');
  // Score.
  text(ctx, `Score ${formatScore(state.score)}`, 1130, 37, 20, '#ffd166', '800', 'left');
}

function drawPanelLabel(ctx, panel, label, sub) {
  text(ctx, label, panel.x + 8, panel.y - 14, 13, 'rgba(255,255,255,0.75)', '800', 'left');
  text(ctx, sub, panel.x + PANEL_WIDTH - 8, panel.y - 14, 13, 'rgba(255,255,255,0.45)', '400', 'right');
}

function drawFoundMarker(ctx, origin, diff, progress) {
  // progress 0..1: the ring grows in, then settles.
  const ease = 1 - (1 - progress) * (1 - progress);
  const r = diff.r + 4 + (1 - ease) * 10;
  ctx.beginPath();
  ctx.arc(origin.x + diff.x, origin.y + diff.y, r, 0, Math.PI * 2);
  ctx.strokeStyle = '#2ecc71';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(origin.x + diff.x, origin.y + diff.y, r, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Check mark.
  const cx = origin.x + diff.x;
  const cy = origin.y + diff.y;
  const s = Math.min(diff.r, 16) * ease;
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.55, cy);
  ctx.lineTo(cx - s * 0.12, cy + s * 0.5);
  ctx.lineTo(cx + s * 0.6, cy - s * 0.5);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
}

function drawPanels(ctx, state, now) {
  const scene = currentScene(state);
  const panels = [
    { origin: LEFT_PANEL, variant: 0 },
    { origin: RIGHT_PANEL, variant: 1 },
  ];
  for (const { origin, variant } of panels) {
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 6;
    roundRect(ctx, origin.x - 4, origin.y - 4, PANEL_WIDTH + 8, PANEL_HEIGHT + 8, 12, '#ffffff');
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.rect(origin.x, origin.y, PANEL_WIDTH, PANEL_HEIGHT);
    ctx.clip();
    ctx.translate(origin.x, origin.y);
    scene.draw(ctx, variant);
    ctx.restore();
  }
  drawPanelLabel(ctx, LEFT_PANEL, 'Picture A', 'the original');
  drawPanelLabel(ctx, RIGHT_PANEL, 'Picture B', 'spot the changes');

  // Markers for every difference already found, on both panels.
  for (const index of state.found) {
    const diff = scene.differences[index];
    const pop = state.effects.find((e) => e.kind === 'pop' && e.index === index);
    const progress = pop ? 1 - pop.until / FOUND_POP_SECONDS : 1;
    drawFoundMarker(ctx, LEFT_PANEL, diff, progress);
    drawFoundMarker(ctx, RIGHT_PANEL, diff, progress);
  }
  // Hint ring: a pulsing amber circle over one hidden difference.
  if (state.hintTarget >= 0) {
    const diff = scene.differences[state.hintTarget];
    const pulse = 1 + 0.12 * Math.sin(now * 6);
    for (const origin of [LEFT_PANEL, RIGHT_PANEL]) {
      ctx.beginPath();
      ctx.arc(origin.x + diff.x, origin.y + diff.y, (diff.r + 10) * pulse, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffb020';
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 8]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }
  // Miss marks: a red cross where a wrong click landed (right panel coords,
  // mirrored on the left so the player sees it on both pictures).
  for (const effect of state.effects) {
    if (effect.kind !== 'miss') continue;
    const alpha = Math.max(0, effect.until / MISS_MARK_SECONDS);
    for (const origin of [LEFT_PANEL, RIGHT_PANEL]) {
      const x = origin.x + effect.x;
      const y = origin.y + effect.y;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = '#ff5252';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x - 11, y - 11);
      ctx.lineTo(x + 11, y + 11);
      ctx.moveTo(x + 11, y - 11);
      ctx.lineTo(x - 11, y + 11);
      ctx.stroke();
      ctx.restore();
    }
  }
}

function drawBottomBar(ctx, state) {
  // Found-so-far chips, left side.
  text(ctx, 'FOUND SO FAR', 20, 552, 11, 'rgba(255,255,255,0.55)', '800', 'left');
  if (state.foundNames.length === 0) {
    text(ctx, 'Nothing yet — look closely…', 20, 582, 15, 'rgba(255,255,255,0.5)', '400', 'left');
  } else {
    let x = 20;
    let y = 576;
    for (const name of state.foundNames) {
      ctx.font = '700 13px "Trebuchet MS", "Segoe UI", sans-serif';
      const w = ctx.measureText(name).width + 30;
      if (x + w > 640) {
        x = 20;
        y += 30;
      }
      roundRect(ctx, x, y, w, 24, 12, 'rgba(46, 204, 113, 0.22)');
      ctx.strokeStyle = 'rgba(46, 204, 113, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(x, y, w, 24, 12);
      ctx.stroke();
      text(ctx, `✓ ${name}`, x + w / 2, y + 13, 13, '#b8f5cf', '700');
      x += w + 8;
    }
  }
  // Controls, right side.
  for (const button of playButtons(state)) {
    drawButton(ctx, button, button.label, button.id === 'hint');
  }
  text(ctx, 'Click either picture · H hint (−50) · R restart · M sound · Esc menu', 660, 640, 13, 'rgba(255,255,255,0.5)', '400', 'left');
  text(ctx, `Combo ×${state.combo}  ·  Best ${formatScore(state.best)}`, 1260, 640, 13, 'rgba(255,255,255,0.5)', '400', 'right');
}

function drawPlay(ctx, state, now) {
  const bg = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  bg.addColorStop(0, '#22354f');
  bg.addColorStop(1, '#16233a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  drawTopBar(ctx, state);
  drawPanels(ctx, state, now);
  drawBottomBar(ctx, state);
}

// ---------------------------------------------------------------------------
// Overlays.
// ---------------------------------------------------------------------------

function dim(ctx) {
  ctx.fillStyle = 'rgba(10, 18, 32, 0.72)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function overlayCard(ctx, x, y, w, h) {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 8;
  roundRect(ctx, x, y, w, h, 18, '#ffffff');
  ctx.restore();
}

function drawSceneDone(ctx, state) {
  drawPlay(ctx, state, 0);
  dim(ctx);
  const result = state.sceneResults[state.sceneResults.length - 1];
  overlayCard(ctx, 390, 130, 500, 330);
  text(ctx, 'Scene complete!', 640, 178, 34, '#263238', '900');
  stars(ctx, 640 - 39, 224, result.stars, 30);
  text(ctx, `${result.name} — ${result.found} of ${result.total} differences found`, 640, 268, 17, '#455a64', '600');
  text(ctx, `Time left ${formatTime(result.timeLeft)}  ·  time bonus +${result.timeBonus}`, 640, 300, 16, '#455a64', '400');
  text(ctx, `Accuracy ${Math.round(result.accuracy * 100)}%  ·  Score ${formatScore(state.score)}`, 640, 330, 16, '#455a64', '400');
  const next = SCENES[state.sceneIndex + 1];
  if (next) text(ctx, `Next up: ${next.name} — ${next.subtitle}`, 640, 366, 15, '#7a8a94', '400');
  drawButton(ctx, { ...NEXT_BUTTON, disabled: false }, 'Next scene  →', true);
  text(ctx, 'or press Enter', 640, 556, 13, 'rgba(255,255,255,0.6)', '400');
}

function drawTimeout(ctx, state) {
  drawPlay(ctx, state, 0);
  dim(ctx);
  overlayCard(ctx, 390, 150, 500, 300);
  text(ctx, "Time's up!", 640, 198, 34, '#c0392b', '900');
  text(ctx, `You found ${foundCount(state)} of ${sceneTotal(state)} differences in ${currentScene(state).name}.`, 640, 246, 17, '#455a64', '600');
  text(ctx, 'Retry the scene, or move on — your score so far is kept.', 640, 278, 15, '#7a8a94', '400');
  drawButton(ctx, { ...RETRY_BUTTON, disabled: false }, '↻  Retry scene', true);
  drawButton(ctx, { ...SKIP_BUTTON, disabled: false }, 'Next scene  →', false);
  text(ctx, 'R to retry · N for next scene', 640, 556, 13, 'rgba(255,255,255,0.6)', '400');
}

function drawResults(ctx, state) {
  const bg = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  bg.addColorStop(0, '#1d2b4f');
  bg.addColorStop(1, '#274b63');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  text(ctx, 'Hunt complete!', 640, 76, 44, '#ffffff', '900');
  const totalFound = state.sceneResults.reduce((sum, r) => sum + r.found, 0);
  const total = SCENES.reduce((sum, s) => sum + s.differences.length, 0);
  text(ctx, `You found ${totalFound} of ${total} differences across three scenes`, 640, 122, 18, 'rgba(255,255,255,0.85)', '400');
  text(ctx, `Total score  ${formatScore(state.score)}`, 640, 172, 30, '#ffd166', '900');
  text(ctx, `Accuracy ${Math.round(accuracy(state) * 100)}%  ·  Best ${formatScore(state.best)}`, 640, 208, 16, 'rgba(255,255,255,0.75)', '600');
  // Per-scene rows.
  let y = 258;
  for (const result of state.sceneResults) {
    roundRect(ctx, 340, y, 600, 56, 12, 'rgba(255,255,255,0.1)');
    text(ctx, result.name, 364, y + 29, 18, '#ffffff', '800', 'left');
    text(ctx, `${result.found}/${result.total} found`, 640, y + 29, 15, 'rgba(255,255,255,0.8)', '600');
    if (result.stars > 0) {
      stars(ctx, 760, y + 29, result.stars, 20);
    } else {
      text(ctx, '—', 786, y + 29, 18, 'rgba(255,255,255,0.5)', '700');
    }
    text(ctx, `+${result.timeBonus} time bonus`, 930, y + 29, 13, 'rgba(255,255,255,0.6)', '400', 'right');
    y += 68;
  }
  const minutes = Math.floor(state.elapsed / 60);
  const seconds = Math.floor(state.elapsed % 60);
  text(ctx, `Played in ${minutes}:${String(seconds).padStart(2, '0')}  ·  ${state.hits} good clicks, ${state.misses} misses`, 640, y + 22, 15, 'rgba(255,255,255,0.6)', '400');
  drawButton(ctx, { ...AGAIN_BUTTON, disabled: false }, '↻  Play again', true);
  drawButton(ctx, { ...RESULTS_MENU_BUTTON, disabled: false }, 'Main menu', false);
}

// ---------------------------------------------------------------------------
// Entry point.
// ---------------------------------------------------------------------------

/** Draw the whole game for the current state. `now` is seconds (for pulses). */
export function draw(ctx, state, now) {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  switch (state.screen) {
    case SCREEN_TITLE:
      drawTitle(ctx, state);
      break;
    case SCREEN_PLAY:
      drawPlay(ctx, state, now);
      break;
    case SCREEN_SCENE_DONE:
      drawSceneDone(ctx, state);
      break;
    case SCREEN_TIMEOUT:
      drawTimeout(ctx, state);
      break;
    case SCREEN_RESULTS:
      drawResults(ctx, state);
      break;
    default:
      drawTitle(ctx, state);
  }
}
