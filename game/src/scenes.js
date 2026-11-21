// Twin Scenes — the three scenes. Each scene is one function that draws the
// whole picture in a 600 x 400 panel, plus a list of its 7 differences.
//
// A difference is a small, fair change between the left panel (variant 0)
// and the right panel (variant 1): a colour, a missing object, a count.
// Every difference carries its name (shown when found) and a hotspot
// { x, y, r } in panel coordinates, used for click testing and for the
// marker ring. All art is drawn with canvas paths — no image files, so the
// game loads nothing over the network.

// ---------------------------------------------------------------------------
// Small drawing helpers (local to this file, used by all three scenes).
// ---------------------------------------------------------------------------

function circle(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function roundRect(ctx, x, y, w, h, r, fill) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

function poly(ctx, points, fill) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function line(ctx, x1, y1, x2, y2, color, width) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.stroke();
}

function star(ctx, x, y, r, fill) {
  ctx.beginPath();
  for (let i = 0; i < 4; i += 1) {
    const a = (i * Math.PI) / 2;
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    ctx.lineTo(x + Math.cos(a + Math.PI / 4) * r * 0.28, y + Math.sin(a + Math.PI / 4) * r * 0.28);
    ctx.lineTo(x + Math.cos(a + Math.PI / 2) * r, y + Math.sin(a + Math.PI / 2) * r);
  }
  ctx.fillStyle = fill;
  ctx.fill();
}

function text(ctx, str, x, y, size, fill, weight = '700', align = 'center') {
  ctx.font = `${weight} ${size}px "Trebuchet MS", "Segoe UI", sans-serif`;
  ctx.fillStyle = fill;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

// ---------------------------------------------------------------------------
// Scene 1 — Night Market ("Pasar Malam").
// A dusk street market: two stalls under string lights, a vendor, a cat
// asleep on a roof, the moon rising.
// ---------------------------------------------------------------------------

function drawNightMarket(ctx, v) {
  // Dusk sky.
  const sky = ctx.createLinearGradient(0, 0, 0, 400);
  sky.addColorStop(0, '#2b2350');
  sky.addColorStop(0.55, '#7a4a7e');
  sky.addColorStop(1, '#e08a4c');
  rect(ctx, 0, 0, 600, 400, sky);
  // Stars.
  const stars = [[40, 30], [120, 55], [210, 28], [330, 45], [420, 24], [560, 90], [90, 90], [480, 70]];
  for (const [x, y] of stars) star(ctx, x, y, 4, 'rgba(255, 244, 200, 0.9)');
  // Moon: crescent in the left panel, full in the right one.
  circle(ctx, 522, 52, 26, '#ffe9a8');
  if (v === 0) circle(ctx, 534, 44, 22, '#2b2350');
  // Far rooftops.
  poly(ctx, [[0, 400], [0, 250], [90, 250], [150, 210], [210, 250], [300, 250], [300, 400]], '#3a2d63');
  poly(ctx, [[300, 400], [300, 265], [380, 220], [470, 265], [600, 265], [600, 400]], '#332758');
  // Ground: cobbled street.
  rect(ctx, 0, 330, 600, 70, '#5c4a6e');
  rect(ctx, 0, 330, 600, 6, '#6e5a80');
  for (let i = 0; i < 9; i += 1) {
    ellipse(ctx, 35 + i * 68, 368, 26, 7, 'rgba(0,0,0,0.18)');
  }

  // String lights sagging across the top.
  ctx.beginPath();
  ctx.moveTo(0, 58);
  ctx.quadraticCurveTo(300, 108, 600, 48);
  ctx.strokeStyle = '#2a2140';
  ctx.lineWidth = 3;
  ctx.stroke();
  const bulbs = [45, 105, 165, 225, 285, 345, 405, 465, 525, 575];
  bulbs.forEach((x, i) => {
    const t = i / (bulbs.length - 1);
    // Sagging wire: lowest in the middle, slightly higher on the right.
    const by = 58 + Math.sin(t * Math.PI) * 42 + (t - 0.5) * -8;
    // Difference 2: the bulb above the middle of the street is dark (v1)
    // instead of glowing warm (v0). Skip bulb index 4 in v1.
    if (v === 1 && i === 4) {
      circle(ctx, x, by, 6, '#3a3350');
      return;
    }
    ctx.save();
    ctx.shadowColor = '#ffca6a';
    ctx.shadowBlur = 14;
    circle(ctx, x, by, 7, i % 2 === 0 ? '#ffd166' : '#ff9e6a');
    ctx.restore();
  });

  // Left stall: fruit stall with a red-and-white awning.
  poly(ctx, [[48, 205], [252, 205], [262, 238], [38, 238]], '#c0392b');
  for (let i = 0; i < 5; i += 1) {
    poly(ctx, [[48 + i * 41, 205], [89 + i * 41, 205], [93 + i * 41, 238], [54 + i * 41, 238]], i % 2 === 0 ? '#f5efe0' : '#c0392b');
  }
  rect(ctx, 56, 238, 8, 96, '#7a5230');
  rect(ctx, 238, 238, 8, 96, '#7a5230');
  rect(ctx, 48, 300, 206, 34, '#8a5f3c');
  rect(ctx, 48, 300, 206, 6, '#a87a52');
  // Fruit piles: oranges, then apples.
  const oranges = [[80, 296], [100, 296], [120, 296], [90, 284], [110, 284]];
  oranges.forEach(([x, y], i) => {
    // Difference 6: the orange pile has 5 oranges (v0) or 4 (v1).
    if (v === 1 && i === 4) return;
    circle(ctx, x, y, 9, '#ff8c2e');
    circle(ctx, x - 3, y - 3, 3, '#ffb066');
  });
  const apples = [[168, 296], [188, 296], [208, 296], [178, 284], [198, 284]];
  for (const [x, y] of apples) {
    circle(ctx, x, y, 9, '#d92b3a');
    circle(ctx, x - 3, y - 3, 3, '#ff6b78');
  }
  // Hanging sign: BUAH in v0, SAYUR in v1.
  line(ctx, 150, 238, 150, 252, '#2a2140', 2);
  roundRect(ctx, 118, 252, 64, 26, 6, '#f5efe0');
  ctx.strokeStyle = '#7a5230';
  ctx.lineWidth = 2;
  ctx.strokeRect(118, 252, 64, 26);
  text(ctx, v === 0 ? 'BUAH' : 'SAYUR', 150, 266, 15, '#c0392b', '800');

  // The vendor behind the fruit stall.
  circle(ctx, 150, 178, 17, '#f2c79b'); // head
  poly(ctx, [[128, 196], [172, 196], [182, 238], [118, 238]], '#3e7d5b'); // body
  // Difference 3: straw hat (v0) vs red cap (v1).
  if (v === 0) {
    ellipse(ctx, 150, 164, 26, 7, '#e8c96a');
    poly(ctx, [[136, 164], [164, 164], [158, 148], [142, 148]], '#e8c96a');
  } else {
    poly(ctx, [[132, 166], [168, 166], [166, 152], [150, 146], [134, 152]], '#c0392b');
    circle(ctx, 150, 146, 4, '#c0392b');
  }
  circle(ctx, 143, 178, 2, '#2a2140');
  circle(ctx, 157, 178, 2, '#2a2140');
  ctx.beginPath();
  ctx.arc(150, 184, 6, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.strokeStyle = '#2a2140';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Right stall: lantern stall with a teal awning.
  poly(ctx, [[330, 212], [560, 212], [570, 244], [320, 244]], '#0f766e');
  for (let i = 0; i < 5; i += 1) {
    poly(ctx, [[330 + i * 46, 212], [376 + i * 46, 212], [380 + i * 46, 244], [336 + i * 46, 244]], i % 2 === 0 ? '#f5efe0' : '#0f766e');
  }
  rect(ctx, 338, 244, 8, 96, '#7a5230');
  rect(ctx, 544, 244, 8, 96, '#7a5230');
  rect(ctx, 330, 300, 230, 34, '#8a5f3c');
  rect(ctx, 330, 300, 230, 6, '#a87a52');
  // Three hanging paper lanterns.
  const lanterns = [
    { x: 372, color: '#e2483d' },
    { x: 445, color: '#e2483d' },
    { x: 518, color: '#e2483d' },
  ];
  lanterns.forEach(({ x, color }, i) => {
    line(ctx, x, 244, x, 256, '#2a2140', 2);
    // Difference 4: the middle lantern is red (v0) or green (v1).
    const c = i === 1 && v === 1 ? '#2e9e5b' : color;
    ctx.save();
    ctx.shadowColor = c;
    ctx.shadowBlur = 12;
    ellipse(ctx, x, 272, 17, 20, c);
    ctx.restore();
    ellipse(ctx, x, 272, 17, 20, 'rgba(255,255,255,0.12)');
    line(ctx, x - 17, 266, x + 17, 266, 'rgba(0,0,0,0.25)', 2);
    line(ctx, x - 17, 278, x + 17, 278, 'rgba(0,0,0,0.25)', 2);
    rect(ctx, x - 5, 250, 10, 5, '#d9a441');
    rect(ctx, x - 5, 290, 10, 5, '#d9a441');
  });
  // Jars on the lantern stall counter.
  roundRect(ctx, 352, 278, 22, 22, 5, '#7fb3d5');
  roundRect(ctx, 384, 282, 22, 18, 5, '#a8d8a0');
  roundRect(ctx, 500, 280, 22, 20, 5, '#d8a0c8');

  // Difference 5: the cat asleep on the lantern stall's roof.
  if (v === 0) {
    ellipse(ctx, 452, 206, 20, 9, '#2f2a33');
    circle(ctx, 470, 200, 8, '#2f2a33');
    poly(ctx, [[466, 194], [469, 187], [473, 193]], '#2f2a33');
    poly(ctx, [[473, 193], [477, 187], [479, 194]], '#2f2a33');
    line(ctx, 430, 204, 414, 198, '#2f2a33', 3);
  }
  // A basket of flowers by the right stall.
  ellipse(ctx, 585, 356, 22, 12, '#b07a3e');
  circle(ctx, 578, 342, 6, '#ff6b9d');
  circle(ctx, 590, 338, 6, '#ffd166');
  circle(ctx, 584, 330, 6, '#c084fc');
}

// ---------------------------------------------------------------------------
// Scene 2 — Mountain Lake ("Danau Gunung").
// A quiet morning: sun over the peaks, a cabin with a smoking chimney, a
// little sailboat, pines and ducks on the water.
// ---------------------------------------------------------------------------

function drawMountainLake(ctx, v) {
  // Morning sky.
  const sky = ctx.createLinearGradient(0, 0, 0, 400);
  sky.addColorStop(0, '#7ec8f2');
  sky.addColorStop(0.6, '#cfeefb');
  sky.addColorStop(1, '#fdf3d0');
  rect(ctx, 0, 0, 600, 400, sky);
  // Sun with rays in v0, plain in v1.
  ctx.save();
  ctx.shadowColor = '#ffd94d';
  ctx.shadowBlur = 24;
  circle(ctx, 92, 72, 30, '#ffd94d');
  ctx.restore();
  if (v === 0) {
    for (let i = 0; i < 8; i += 1) {
      const a = (i * Math.PI) / 4;
      line(ctx, 92 + Math.cos(a) * 38, 72 + Math.sin(a) * 38, 92 + Math.cos(a) * 50, 72 + Math.sin(a) * 50, '#ffbf2e', 4);
    }
  }
  // Clouds: three in v0, two in v1 (the middle one is gone).
  const clouds = [[210, 55], [330, 42], [470, 70]];
  clouds.forEach(([x, y], i) => {
    if (v === 1 && i === 1) return;
    ellipse(ctx, x, y, 34, 14, 'rgba(255,255,255,0.92)');
    ellipse(ctx, x - 20, y + 6, 22, 11, 'rgba(255,255,255,0.92)');
    ellipse(ctx, x + 22, y + 6, 24, 11, 'rgba(255,255,255,0.92)');
  });
  // Birds: three in v0, two in v1.
  const birds = [[250, 110], [300, 92], [350, 116]];
  birds.forEach(([x, y], i) => {
    if (v === 1 && i === 2) return;
    ctx.beginPath();
    ctx.moveTo(x - 9, y);
    ctx.quadraticCurveTo(x - 4, y - 7, x, y);
    ctx.quadraticCurveTo(x + 4, y - 7, x + 9, y);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  });
  // Mountain ranges.
  poly(ctx, [[0, 260], [90, 150], [170, 235], [250, 130], [340, 250], [420, 170], [520, 255], [600, 190], [600, 400], [0, 400]], '#7d9bb5');
  poly(ctx, [[90, 150], [120, 190], [60, 190]], '#f4f8fb');
  poly(ctx, [[250, 130], [282, 172], [218, 172]], '#f4f8fb');
  poly(ctx, [[420, 170], [446, 205], [394, 205]], '#eef4f8');
  poly(ctx, [[0, 290], [130, 210], [260, 285], [390, 215], [520, 290], [600, 240], [600, 400], [0, 400]], '#5b7f8f');
  // Lake.
  const lake = ctx.createLinearGradient(0, 260, 0, 400);
  lake.addColorStop(0, '#4aa3d8');
  lake.addColorStop(1, '#2a6ea6');
  rect(ctx, 0, 262, 600, 138, lake);
  // Sun glitter on the water.
  for (let i = 0; i < 6; i += 1) {
    ellipse(ctx, 70 + i * 26, 292 + (i % 2) * 16, 16 - i, 3, 'rgba(255, 240, 170, 0.55)');
  }
  // Ripples.
  for (const [x, y, w] of [[180, 320, 40], [330, 350, 52], [470, 318, 36], [120, 362, 44]]) {
    ctx.beginPath();
    ctx.ellipse(x, y, w, 5, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Shore and grass at the bottom.
  poly(ctx, [[0, 400], [0, 352], [600, 352], [600, 400]], '#6da85c');
  poly(ctx, [[0, 400], [0, 372], [600, 372], [600, 400]], '#5b9a4c');

  // Pines on the left shore.
  const pine = (x, y, s) => {
    rect(ctx, x - 4 * s, y, 8 * s, 16 * s, '#6b4423');
    poly(ctx, [[x, y - 52 * s], [x - 22 * s, y], [x + 22 * s, y]], '#2f6b3a');
    poly(ctx, [[x, y - 72 * s], [x - 17 * s, y - 26 * s], [x + 17 * s, y - 26 * s]], '#357a42');
    poly(ctx, [[x, y - 90 * s], [x - 12 * s, y - 48 * s], [x + 12 * s, y - 48 * s]], '#3f8a4c');
  };
  pine(52, 340, 1);
  pine(108, 348, 0.8);
  pine(575, 344, 0.9);
  // Difference 5: a small pine grows on the far shore in v1.
  if (v === 1) pine(330, 268, 0.55);

  // The cabin on the right shore.
  rect(ctx, 436, 232, 118, 66, '#a4713e');
  rect(ctx, 436, 232, 118, 8, '#8a5f33');
  poly(ctx, [[424, 234], [554, 234], [495, 190]], '#7a3b2e');
  poly(ctx, [[424, 234], [554, 234], [495, 190]], 'rgba(0,0,0,0.12)');
  rect(ctx, 486, 262, 20, 36, '#5b3a1e');
  circle(ctx, 502, 280, 2.5, '#d9a441');
  // Window: warm and lit in v0, dark in v1.
  rect(ctx, 452, 250, 22, 20, v === 0 ? '#ffd166' : '#3a2f45');
  ctx.strokeStyle = '#5b3a1e';
  ctx.lineWidth = 2;
  ctx.strokeRect(452, 250, 22, 20);
  line(ctx, 463, 250, 463, 270, '#5b3a1e', 2);
  line(ctx, 452, 260, 474, 260, '#5b3a1e', 2);
  rect(ctx, 524, 250, 22, 20, '#9fc7e8');
  ctx.strokeRect(524, 250, 22, 20);
  // Chimney with smoke in v0, none in v1.
  rect(ctx, 522, 196, 14, 26, '#8a5f52');
  if (v === 0) {
    circle(ctx, 530, 184, 8, 'rgba(255,255,255,0.85)');
    circle(ctx, 538, 170, 10, 'rgba(255,255,255,0.7)');
    circle(ctx, 548, 154, 12, 'rgba(255,255,255,0.5)');
  }

  // The sailboat.
  poly(ctx, [[150, 306], [238, 306], [222, 322], [166, 322]], '#8a5f3c');
  rect(ctx, 192, 306, 4, 6, '#8a5f3c');
  line(ctx, 194, 306, 194, 252, '#5b3a1e', 4);
  poly(ctx, [[198, 258], [198, 302], [232, 302]], '#f5efe0');
  poly(ctx, [[190, 262], [190, 302], [162, 302]], '#ffd166');
  // Flag: red in v0, blue in v1.
  poly(ctx, [[194, 252], [214, 257], [194, 262]], v === 0 ? '#d92b3a' : '#2563eb');

  // Ducks: two in v0, one in v1.
  const duck = (x, y) => {
    ellipse(ctx, x, y, 12, 8, '#f5efe0');
    circle(ctx, x + 10, y - 6, 6, '#f5efe0');
    poly(ctx, [[x + 15, y - 6], [x + 21, y - 4], [x + 15, y - 3]], '#ff8c2e');
    circle(ctx, x + 11, y - 8, 1.5, '#2a2140');
  };
  duck(286, 330);
  if (v === 0) duck(336, 344);
  // Wildflowers on the near shore.
  for (const [x, y, c] of [[30, 384, '#ff6b9d'], [52, 390, '#ffd166'], [74, 384, '#ff6b9d'], [560, 388, '#ffd166'], [540, 382, '#ff6b9d']]) {
    line(ctx, x, y, x, y - 12, '#3f7d3a', 2);
    circle(ctx, x, y - 14, 5, c);
  }
}

// ---------------------------------------------------------------------------
// Scene 3 — Botanical Garden ("Kebun Raya").
// A sunny garden: a three-jet fountain, tulip beds, a bench, a vine arch
// and a birdhouse on a pole.
// ---------------------------------------------------------------------------

function drawGarden(ctx, v) {
  // Sunny sky.
  const sky = ctx.createLinearGradient(0, 0, 0, 400);
  sky.addColorStop(0, '#8fd0f5');
  sky.addColorStop(1, '#dff3fd');
  rect(ctx, 0, 0, 600, 400, sky);
  circle(ctx, 520, 58, 26, '#ffd94d');
  // Clouds: three in v0, two in v1.
  const clouds = [[120, 58], [270, 40], [420, 88]];
  clouds.forEach(([x, y], i) => {
    if (v === 1 && i === 0) return;
    ellipse(ctx, x, y, 32, 13, 'rgba(255,255,255,0.95)');
    ellipse(ctx, x - 20, y + 5, 20, 10, 'rgba(255,255,255,0.95)');
    ellipse(ctx, x + 20, y + 5, 22, 10, 'rgba(255,255,255,0.95)');
  });
  // Background trees.
  for (const [x, y, s] of [[40, 210, 1.1], [120, 200, 0.9], [560, 205, 1], [480, 215, 0.8]]) {
    rect(ctx, x - 5, y, 10, 34, '#6b4423');
    circle(ctx, x, y - 12, 30 * s, '#4e9a51');
    circle(ctx, x - 20, y + 2, 20 * s, '#5cb85f');
    circle(ctx, x + 20, y + 2, 20 * s, '#57ab5a');
  }
  // Hedge along the back.
  roundRect(ctx, 0, 226, 600, 26, 12, '#3f8a4c');
  for (let i = 0; i < 24; i += 1) circle(ctx, 14 + i * 26, 228, 12, '#4b9a55');
  // Lawn.
  rect(ctx, 0, 252, 600, 148, '#79c267');
  rect(ctx, 0, 252, 600, 148, 'rgba(255,255,255,0.06)');
  // Stepping-stone path up the middle.
  const stones = [[300, 392], [286, 366], [314, 340], [296, 314], [306, 288]];
  stones.forEach(([x, y], i) => {
    // Difference 7: the second stone from the bottom is missing in v1.
    if (v === 1 && i === 1) return;
    ellipse(ctx, x, y, 26, 10, '#d8d2c4');
    ellipse(ctx, x, y, 20, 7, '#c9c2b2');
  });

  // Tulip beds left and right.
  const tulip = (x, y, color) => {
    line(ctx, x, y, x, y - 18, '#3f7d3a', 2.5);
    poly(ctx, [[x - 7, y - 18], [x + 7, y - 18], [x, y - 32]], color);
    circle(ctx, x - 4, y - 20, 4, color);
    circle(ctx, x + 4, y - 20, 4, color);
  };
  tulip(64, 330, '#e2483d');
  tulip(92, 338, '#ffd166');
  tulip(120, 330, '#e2483d');
  tulip(148, 338, '#ff8fb3');
  tulip(452, 336, '#ffd166');
  tulip(480, 330, '#ff8fb3');
  tulip(508, 338, '#e2483d');
  // Difference 4: the tulip at the left bed's edge is red (v0) or pink (v1).
  tulip(36, 338, v === 0 ? '#e2483d' : '#ff8fb3');
  tulip(536, 330, '#ffd166');

  // The bench on the left.
  rect(ctx, 84, 296, 10, 52, '#6b4423');
  rect(ctx, 176, 296, 10, 52, '#6b4423');
  // Bench slats: three in v0, two in v1.
  const slats = [292, 306, 320];
  slats.forEach((y, i) => {
    if (v === 1 && i === 1) return;
    roundRect(ctx, 78, y, 114, 9, 4, '#a4713e');
  });
  roundRect(ctx, 78, 330, 114, 9, 4, '#a4713e');

  // The vine arch on the right.
  line(ctx, 452, 252, 452, 150, '#6b4423', 8);
  line(ctx, 552, 252, 552, 150, '#6b4423', 8);
  ctx.beginPath();
  ctx.arc(502, 150, 50, Math.PI, 0);
  ctx.strokeStyle = '#6b4423';
  ctx.lineWidth = 8;
  ctx.stroke();
  for (let i = 0; i <= 8; i += 1) {
    const a = Math.PI + (i / 8) * Math.PI;
    const x = 502 + Math.cos(a) * 50;
    const y = 150 + Math.sin(a) * 50;
    ellipse(ctx, x, y, 12, 7, i % 2 === 0 ? '#4e9a51' : '#5cb85f');
  }
  circle(ctx, 470, 168, 6, '#ff8fb3');
  circle(ctx, 534, 162, 6, '#ff8fb3');
  circle(ctx, 502, 108, 6, '#ff8fb3');

  // Birdhouse on a pole, present in v0, gone in v1.
  if (v === 0) {
    rect(ctx, 516, 210, 8, 42, '#6b4423');
    poly(ctx, [[500, 212], [540, 212], [520, 192]], '#c0392b');
    rect(ctx, 504, 212, 32, 26, '#e8b04b');
    circle(ctx, 520, 224, 6, '#2a2140');
    line(ctx, 514, 236, 526, 236, '#8a5f3c', 3);
  }

  // The fountain in the middle.
  ellipse(ctx, 300, 330, 92, 24, '#b9d9e8');
  ellipse(ctx, 300, 330, 92, 24, 'rgba(255,255,255,0.25)');
  ctx.beginPath();
  ctx.ellipse(300, 330, 92, 24, 0, 0, Math.PI * 2);
  ctx.strokeStyle = '#8fb8cc';
  ctx.lineWidth = 3;
  ctx.stroke();
  ellipse(ctx, 300, 330, 74, 17, '#5fb2e0');
  rect(ctx, 292, 268, 16, 56, '#d8d2c4');
  ellipse(ctx, 300, 268, 26, 8, '#cfc8b8');
  ellipse(ctx, 300, 258, 12, 6, '#5fb2e0');
  // Water jets: three in v0, two in v1 (the left one is off).
  const jets = [
    { x0: 292, x1: 244, top: 218 },
    { x0: 300, x1: 300, top: 196 },
    { x0: 308, x1: 356, top: 218 },
  ];
  jets.forEach((jet, i) => {
    if (v === 1 && i === 0) return;
    ctx.beginPath();
    ctx.moveTo(jet.x0, 258);
    ctx.quadraticCurveTo((jet.x0 + jet.x1) / 2, jet.top, jet.x1, 252);
    ctx.strokeStyle = 'rgba(120, 200, 245, 0.9)';
    ctx.lineWidth = 4;
    ctx.stroke();
    circle(ctx, jet.x1, 252, 4, 'rgba(160, 220, 250, 0.9)');
  });
  circle(ctx, 300, 196, 5, 'rgba(160, 220, 250, 0.9)');
  circle(ctx, 296, 210, 3, 'rgba(160, 220, 250, 0.8)');
  circle(ctx, 306, 214, 3, 'rgba(160, 220, 250, 0.8)');

  // The butterfly near the right tulips.
  // Difference 2: orange wings (v0) vs blue wings (v1).
  const wing = v === 0 ? '#ff8c2e' : '#4d8ef7';
  ctx.save();
  ctx.translate(386, 282);
  ctx.rotate(-0.3);
  ellipse(ctx, -9, -6, 11, 8, wing);
  ellipse(ctx, -8, 6, 9, 6, wing);
  ellipse(ctx, 9, -6, 11, 8, wing);
  ellipse(ctx, 8, 6, 9, 6, wing);
  circle(ctx, -12, -8, 3, 'rgba(255,255,255,0.7)');
  circle(ctx, 12, -8, 3, 'rgba(255,255,255,0.7)');
  ctx.restore();
  line(ctx, 386, 276, 386, 288, '#2a2140', 3);
  ctx.beginPath();
  ctx.moveTo(386, 276);
  ctx.quadraticCurveTo(380, 268, 376, 270);
  ctx.moveTo(386, 276);
  ctx.quadraticCurveTo(392, 268, 396, 270);
  ctx.strokeStyle = '#2a2140';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

// ---------------------------------------------------------------------------
// Scene catalogue: name, subtitle, difficulty and the differences.
// Hotspots are in panel coordinates (600 x 400).
// ---------------------------------------------------------------------------

export const SCENES = [
  {
    id: 'night-market',
    name: 'Night Market',
    subtitle: 'Pasar Malam — lanterns, fruit and one sleepy cat',
    difficulty: 1,
    draw: drawNightMarket,
    differences: [
      { name: 'The moon turned full', x: 522, y: 52, r: 30 },
      { name: 'A string-light bulb went dark', x: 285, y: 100, r: 16 },
      { name: 'The vendor changed hats', x: 150, y: 162, r: 26 },
      { name: 'The middle lantern changed colour', x: 445, y: 272, r: 24 },
      { name: 'The cat vanished from the roof', x: 452, y: 202, r: 24 },
      { name: 'An orange went missing', x: 110, y: 284, r: 20 },
      { name: 'The stall sign changed words', x: 150, y: 265, r: 24 },
    ],
  },
  {
    id: 'mountain-lake',
    name: 'Mountain Lake',
    subtitle: 'Danau Gunung — a quiet morning on the water',
    difficulty: 2,
    draw: drawMountainLake,
    differences: [
      { name: 'The sun lost its rays', x: 92, y: 72, r: 34 },
      { name: 'A bird flew away', x: 350, y: 116, r: 18 },
      { name: 'The boat flag changed colour', x: 202, y: 257, r: 18 },
      { name: 'The cabin window went dark', x: 463, y: 260, r: 20 },
      { name: 'A pine sprouted on the far shore', x: 330, y: 248, r: 22 },
      { name: 'A duck swam off', x: 336, y: 344, r: 20 },
      { name: 'The chimney stopped smoking', x: 538, y: 170, r: 22 },
    ],
  },
  {
    id: 'garden',
    name: 'Botanical Garden',
    subtitle: 'Kebun Raya — fountains, tulips and a butterfly',
    difficulty: 3,
    draw: drawGarden,
    differences: [
      { name: 'A fountain jet turned off', x: 258, y: 234, r: 24 },
      { name: 'The butterfly changed colour', x: 386, y: 282, r: 20 },
      { name: 'A bench slat went missing', x: 135, y: 306, r: 20 },
      { name: 'A tulip changed colour', x: 36, y: 330, r: 18 },
      { name: 'The birdhouse disappeared', x: 520, y: 212, r: 24 },
      { name: 'A cloud drifted away', x: 120, y: 58, r: 26 },
      { name: 'A stepping stone went missing', x: 286, y: 366, r: 18 },
    ],
  },
];
