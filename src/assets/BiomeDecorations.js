function shadow(ctx, y = 12, rx = 12, ry = 4) {
  ctx.fillStyle = "rgba(10, 12, 16, 0.22)";
  ctx.beginPath();
  ctx.ellipse(0, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawBanner(ctx, variant) {
  ctx.fillRect(-2, 10, 4, 18);
  const colors = ["#8a2838", "#284878", "#786028"];
  ctx.fillStyle = colors[variant % colors.length];
  ctx.beginPath();
  ctx.moveTo(0, -16);
  ctx.lineTo(18, -8 + (variant % 2));
  ctx.lineTo(0, 4);
  ctx.lineTo(-18, -8 - (variant % 2));
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#ffd27e";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawBrokenShield(ctx, variant) {
  shadow(ctx);
  ctx.fillStyle = variant % 2 === 0 ? "#686e78" : "#5a6068";
  ctx.beginPath();
  ctx.moveTo(0, -16);
  ctx.lineTo(14, -4);
  ctx.lineTo(8, 14);
  ctx.lineTo(-8, 10);
  ctx.lineTo(-12, -6);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#ffd27e";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-4, -8);
  ctx.lineTo(6, 4);
  ctx.stroke();
}

function drawStoneColumn(ctx, variant) {
  shadow(ctx, 16, 10, 4);
  ctx.fillStyle = variant % 2 === 0 ? "#8a9098" : "#767c84";
  ctx.fillRect(-8, -18, 16, 34);
  ctx.fillRect(-12, -20, 24, 6);
  ctx.fillRect(-10, 12, 20, 6);
}

function drawStatue(ctx, variant) {
  shadow(ctx, 14);
  ctx.fillStyle = variant % 2 === 0 ? "#8a9098" : "#7a8088";
  ctx.fillRect(-8, -2, 16, 16);
  ctx.beginPath();
  ctx.arc(0, -10, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-12, 14, 24, 4);
}

function drawCrackedStone(ctx, variant) {
  shadow(ctx);
  ctx.fillStyle = "#686e78";
  ctx.beginPath();
  ctx.moveTo(-14, 8);
  ctx.lineTo(-8, -10);
  ctx.lineTo(10, -8);
  ctx.lineTo(14, 6);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#3a4048";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-4, -6);
  ctx.lineTo(2, 4);
  ctx.lineTo(8, -2);
  ctx.stroke();
}

function drawMushroom(ctx, variant) {
  shadow(ctx, 10, 10, 3);
  ctx.fillStyle = "#d8cbb0";
  ctx.fillRect(-3, 0, 6, 12);
  ctx.fillStyle = variant % 2 === 0 ? "#6a9848" : "#8a5848";
  ctx.beginPath();
  ctx.arc(0, -2, 12 + (variant % 3), Math.PI, 0);
  ctx.fill();
}

function drawStump(ctx, variant) {
  shadow(ctx, 12, 14, 5);
  ctx.fillStyle = "#5a4030";
  ctx.fillRect(-12, -2, 24, 14);
  ctx.fillStyle = "#6a5040";
  ctx.beginPath();
  ctx.ellipse(0, -2, 12, 5, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawFlowers(ctx, variant) {
  shadow(ctx, 10, 12, 3);
  const colors = ["#ff88aa", "#ffd27e", "#88ddff", "#c8ff88"];
  for (let i = 0; i < 4; i += 1) {
    ctx.fillStyle = colors[(variant + i) % colors.length];
    ctx.beginPath();
    ctx.arc(-9 + i * 6, -2 + (i % 2) * 3, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = "#4a6838";
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.moveTo(-6 + i * 6, 6);
    ctx.lineTo(-6 + i * 6, -6);
    ctx.stroke();
  }
}

function drawBush(ctx, variant) {
  shadow(ctx, 12, 16, 6);
  ctx.fillStyle = variant % 2 === 0 ? "#4a7838" : "#3a6830";
  ctx.beginPath();
  ctx.arc(-8, 0, 10, 0, Math.PI * 2);
  ctx.arc(8, 0, 10, 0, Math.PI * 2);
  ctx.arc(0, -6, 12, 0, Math.PI * 2);
  ctx.fill();
}

function drawRoots(ctx, variant) {
  shadow(ctx, 10, 14, 4);
  ctx.strokeStyle = "#5a4030";
  ctx.lineWidth = 3;
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.moveTo(-8 + i * 8, 8);
    ctx.quadraticCurveTo(-12 + i * 10, -4, -4 + i * 6, -10 - (variant % 2));
    ctx.stroke();
  }
}

function drawDarkTree(ctx, variant) {
  shadow(ctx, 14, 12, 5);
  ctx.fillStyle = "#3a2818";
  ctx.fillRect(-4, -4, 8, 22);
  ctx.fillStyle = variant % 2 === 0 ? "#1a2830" : "#142028";
  ctx.beginPath();
  ctx.moveTo(0, -28);
  ctx.lineTo(18, 4);
  ctx.lineTo(-18, 4);
  ctx.closePath();
  ctx.fill();
}

function drawBlueMushroom(ctx, variant) {
  shadow(ctx, 10, 10, 3);
  ctx.fillStyle = "#c8d8e8";
  ctx.fillRect(-2, 0, 4, 10);
  ctx.fillStyle = variant % 2 === 0 ? "#4888c8" : "#68a8e8";
  ctx.beginPath();
  ctx.arc(0, -2, 10, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = "rgba(180,220,255,0.5)";
  ctx.beginPath();
  ctx.arc(-3, -6, 2, 0, Math.PI * 2);
  ctx.fill();
}

function drawFireflies(ctx, variant) {
  shadow(ctx, 10, 14, 3);
  for (let i = 0; i < 5; i += 1) {
    const x = -12 + ((variant + i * 7) % 24);
    const y = -8 + ((variant + i * 5) % 16);
    ctx.fillStyle = "rgba(255,240,120,0.85)";
    ctx.beginPath();
    ctx.arc(x, y, 2 + (i % 2), 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawGlowingPlant(ctx, variant) {
  shadow(ctx, 10, 10, 3);
  ctx.strokeStyle = "#68c888";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 8);
  ctx.quadraticCurveTo(8, -8, 0, -18);
  ctx.quadraticCurveTo(-8, -8, 0, 8);
  ctx.stroke();
  ctx.fillStyle = "rgba(120,255,180,0.45)";
  ctx.beginPath();
  ctx.arc(0, -10, 8, 0, Math.PI * 2);
  ctx.fill();
}

function drawOldLantern(ctx, variant) {
  shadow(ctx, 12, 8, 3);
  ctx.fillStyle = "#5a4030";
  ctx.fillRect(-1, -14, 2, 8);
  ctx.fillStyle = variant % 2 === 0 ? "#486878" : "#3a5058";
  ctx.fillRect(-8, -6, 16, 18);
  ctx.fillStyle = "rgba(255,220,120,0.75)";
  ctx.fillRect(-6, -4, 12, 12);
}

function drawCoffin(ctx, variant) {
  shadow(ctx, 14, 16, 5);
  ctx.fillStyle = variant % 2 === 0 ? "#4a3428" : "#3a281c";
  ctx.beginPath();
  ctx.moveTo(-16, 10);
  ctx.lineTo(-10, -6);
  ctx.lineTo(10, -6);
  ctx.lineTo(16, 10);
  ctx.closePath();
  ctx.fill();
}

function drawSkullPile(ctx, variant) {
  shadow(ctx, 12, 14, 4);
  ctx.fillStyle = "#d8d0c8";
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.arc(-8 + i * 8, -2 + (i % 2), 6, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCandle(ctx, variant) {
  shadow(ctx, 12, 8, 3);
  ctx.fillStyle = "#c8b090";
  ctx.fillRect(-3, -2, 6, 14);
  ctx.fillStyle = variant % 2 === 0 ? "#ffd27e" : "#ffb86a";
  ctx.beginPath();
  ctx.moveTo(0, -8);
  ctx.quadraticCurveTo(4, -14, 0, -18);
  ctx.quadraticCurveTo(-4, -14, 0, -8);
  ctx.fill();
}

function drawChain(ctx, variant) {
  shadow(ctx, 12, 8, 3);
  ctx.strokeStyle = "#686e78";
  ctx.lineWidth = 3;
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.arc(0, -14 + i * 7 + (variant % 2), 4, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawCrackedGrave(ctx, variant) {
  drawGrave(ctx, variant);
  ctx.strokeStyle = "#3a4048";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-6, -4);
  ctx.lineTo(0, 6);
  ctx.lineTo(8, -2);
  ctx.stroke();
}

function drawGrave(ctx, variant) {
  shadow(ctx, 14, 14, 4);
  ctx.fillStyle = variant % 2 === 0 ? "#686e78" : "#5a6068";
  ctx.fillRect(-12, 0, 24, 14);
  ctx.beginPath();
  ctx.arc(0, 0, 12, Math.PI, 0);
  ctx.fill();
}

function drawDeadTree(ctx, variant) {
  shadow(ctx, 14, 10, 4);
  ctx.strokeStyle = "#3a3028";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 12);
  ctx.lineTo(0, -16);
  ctx.moveTo(0, -8);
  ctx.lineTo(-12, -18 + (variant % 3));
  ctx.moveTo(0, -4);
  ctx.lineTo(12, -14);
  ctx.stroke();
}

function drawBonePile(ctx, variant) {
  shadow(ctx, 12, 12, 4);
  ctx.strokeStyle = "#d8cbb8";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-10, 4);
  ctx.lineTo(10, -2);
  ctx.moveTo(-6, -4);
  ctx.lineTo(8, 6);
  ctx.stroke();
}

function drawMoonStone(ctx, variant) {
  shadow(ctx, 12, 12, 4);
  ctx.fillStyle = "#8898b8";
  ctx.beginPath();
  ctx.arc(0, 0, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(200,220,255,0.45)";
  ctx.beginPath();
  ctx.arc(-4, -4, 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawCursedFlower(ctx, variant) {
  shadow(ctx, 10, 10, 3);
  ctx.strokeStyle = "#4a3848";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 8);
  ctx.lineTo(0, -6);
  ctx.stroke();
  ctx.fillStyle = variant % 2 === 0 ? "#8848a8" : "#683878";
  for (let i = 0; i < 5; i += 1) {
    const angle = (i / 5) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(Math.cos(angle) * 6, -8 + Math.sin(angle) * 6, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawRedCrystal(ctx, variant) {
  shadow(ctx, 10, 10, 3);
  ctx.fillStyle = variant % 2 === 0 ? "#c83848" : "#a82838";
  ctx.beginPath();
  ctx.moveTo(0, -16);
  ctx.lineTo(10, 8);
  ctx.lineTo(0, 2);
  ctx.lineTo(-10, 8);
  ctx.closePath();
  ctx.fill();
}

function drawBrokenRune(ctx, variant) {
  shadow(ctx, 12, 12, 4);
  ctx.fillStyle = "#484058";
  ctx.fillRect(-10, -10, 20, 20);
  ctx.strokeStyle = "#ff7868";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-6, -6);
  ctx.lineTo(6, 6);
  ctx.moveTo(6, -6);
  ctx.lineTo(-6, 6);
  ctx.stroke();
}

function drawAshPile(ctx, variant) {
  shadow(ctx, 10, 14, 5);
  ctx.fillStyle = "#3a3838";
  ctx.beginPath();
  ctx.ellipse(0, 2, 14, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(120,120,120,0.35)";
  for (let i = 0; i < 4; i += 1) {
    ctx.fillRect(-10 + i * 5, -4 + (variant + i) % 3, 2, 2);
  }
}

function drawCursedCandle(ctx, variant) {
  drawCandle(ctx, variant);
  ctx.fillStyle = "rgba(180, 64, 255, 0.35)";
  ctx.beginPath();
  ctx.arc(0, -12, 10, 0, Math.PI * 2);
  ctx.fill();
}

function drawRuinWall(ctx, variant) {
  shadow(ctx, 14, 16, 5);
  ctx.fillStyle = "#4f555e";
  ctx.fillRect(-16, -8, 10, 20);
  ctx.fillRect(-2, -12, 14, 24);
  ctx.fillStyle = "#686f78";
  ctx.fillRect(10, 0, 8, 12);
}

function drawBookshelf(ctx, variant) {
  shadow(ctx, 16, 16, 4);
  ctx.fillStyle = "#5a4030";
  ctx.fillRect(-16, -12, 32, 28);
  const bookColors = ["#8a2838", "#284878", "#487838", "#786028"];
  for (let i = 0; i < 4; i += 1) {
    ctx.fillStyle = bookColors[(variant + i) % bookColors.length];
    ctx.fillRect(-12 + i * 7, -6 + (i % 2) * 10, 5, 8);
  }
}

function drawScrollPile(ctx, variant) {
  shadow(ctx, 12, 14, 4);
  for (let i = 0; i < 3; i += 1) {
    ctx.fillStyle = i === 0 ? "#d8c8a0" : "#c0b088";
    ctx.beginPath();
    ctx.ellipse(-8 + i * 8, 4 - i * 2, 8, 4, (variant + i) * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawInkPot(ctx, variant) {
  shadow(ctx, 12, 10, 4);
  ctx.fillStyle = variant % 2 === 0 ? "#283048" : "#202838";
  ctx.beginPath();
  ctx.moveTo(-10, 8);
  ctx.lineTo(-6, -6);
  ctx.lineTo(6, -6);
  ctx.lineTo(10, 8);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#101820";
  ctx.fillRect(-4, -2, 8, 6);
}

function drawGlowingBook(ctx, variant) {
  shadow(ctx, 12, 12, 4);
  ctx.fillStyle = "#8a2838";
  ctx.fillRect(-10, -8, 20, 16);
  ctx.fillStyle = "rgba(255,220,120,0.45)";
  ctx.fillRect(-8, -6, 16, 12);
}

function drawDeskDebris(ctx, variant) {
  shadow(ctx, 12, 16, 5);
  ctx.fillStyle = "#5a4030";
  ctx.fillRect(-14, 0, 28, 8);
  ctx.fillStyle = "#786048";
  ctx.fillRect(-8 + (variant % 3), -8, 6, 8);
  ctx.fillRect(4, -6, 8, 4);
}

function drawRock(ctx, variant) {
  drawCrackedStone(ctx, variant);
}

function drawBone(ctx, variant) {
  drawBonePile(ctx, variant);
}

function drawGrassPatch(ctx, variant) {
  drawFlowers(ctx, variant);
}

function drawRuin(ctx, variant) {
  drawRuinWall(ctx, variant);
}

function drawIceCrystal(ctx, variant) {
  ctx.fillStyle = variant % 2 === 0 ? "#b8e4ff" : "#d8f0ff";
  ctx.beginPath();
  ctx.moveTo(0, -18);
  ctx.lineTo(8, 8);
  ctx.lineTo(0, 2);
  ctx.lineTo(-8, 8);
  ctx.closePath();
  ctx.fill();
}

function drawLavaCrack(ctx, variant) {
  drawAshPile(ctx, variant);
  ctx.strokeStyle = "rgba(255,120,40,0.8)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-10, 0);
  ctx.lineTo(0, -4);
  ctx.lineTo(10, 2);
  ctx.stroke();
}

const DECORATION_DRAWERS = {
  banner: drawBanner,
  brokenShield: drawBrokenShield,
  stoneColumn: drawStoneColumn,
  statue: drawStatue,
  crackedStone: drawCrackedStone,
  mushroom: drawMushroom,
  stump: drawStump,
  flowers: drawFlowers,
  bush: drawBush,
  roots: drawRoots,
  darkTree: drawDarkTree,
  blueMushroom: drawBlueMushroom,
  fireflies: drawFireflies,
  glowingPlant: drawGlowingPlant,
  oldLantern: drawOldLantern,
  coffin: drawCoffin,
  skullPile: drawSkullPile,
  candle: drawCandle,
  chain: drawChain,
  crackedGrave: drawCrackedGrave,
  grave: drawGrave,
  deadTree: drawDeadTree,
  bonePile: drawBonePile,
  moonStone: drawMoonStone,
  cursedFlower: drawCursedFlower,
  redCrystal: drawRedCrystal,
  brokenRune: drawBrokenRune,
  ashPile: drawAshPile,
  cursedCandle: drawCursedCandle,
  ruinWall: drawRuinWall,
  bookshelf: drawBookshelf,
  scrollPile: drawScrollPile,
  inkPot: drawInkPot,
  glowingBook: drawGlowingBook,
  deskDebris: drawDeskDebris,
  rock: drawRock,
  bone: drawBone,
  grassPatch: drawGrassPatch,
  ruin: drawRuin,
  iceCrystal: drawIceCrystal,
  lavaCrack: drawLavaCrack,
};

export function drawBiomeDecoration(ctx, type, variant) {
  const draw = DECORATION_DRAWERS[type];

  if (!draw) {
    drawCrackedStone(ctx, variant);
    return;
  }

  draw(ctx, variant);
}

export function isKnownDecoration(type) {
  return Boolean(DECORATION_DRAWERS[type]);
}
