import { ENEMY_TYPES } from "../config/EnemyArtDefinitions.js";
import { GameConfig } from "../config/GameConfig.js";

const SIZE = GameConfig.sprites.sourceSize;
const C = SIZE / 2;

function makeCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  return canvas;
}

function flipCanvas(source) {
  const canvas = makeCanvas();
  const ctx = canvas.getContext("2d");
  ctx.translate(SIZE, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(source, 0, 0);
  return canvas;
}

function shadow(ctx, cx, cy, rx = 44, ry = 12) {
  ctx.fillStyle = "rgba(10, 14, 18, 0.28)";
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function heroAura(ctx, cx, cy, radius = 78) {
  const glow = ctx.createRadialGradient(cx, cy - 8, 8, cx, cy, radius);
  glow.addColorStop(0, "rgba(255, 200, 106, 0.48)");
  glow.addColorStop(0.45, "rgba(140, 96, 220, 0.24)");
  glow.addColorStop(1, "rgba(140, 96, 220, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
}

const WALK = [
  { bob: 0, lLeg: 0, rLeg: 0, arm: 0, cape: 0 },
  { bob: -4, lLeg: 10, rLeg: -6, arm: 8, cape: 0.12 },
  { bob: 0, lLeg: 0, rLeg: 0, arm: 0, cape: 0 },
  { bob: -4, lLeg: -6, rLeg: 10, arm: -8, cape: -0.12 },
];

function drawPlayerFrame(ctx, cx, cy, facing, frame) {
  const walk = WALK[frame % WALK.length];
  const y = cy + walk.bob;
  const flip = facing === "left" ? -1 : 1;

  ctx.save();
  if (facing === "left" || facing === "right") {
    ctx.translate(cx, 0);
    ctx.scale(flip, 1);
    cx = 0;
  }

  shadow(ctx, cx, y + 52, 36, 10);
  heroAura(ctx, cx, y - 4);

  if (facing === "up") {
    drawPlayerBack(ctx, cx, y, walk);
  } else {
    drawPlayerFront(ctx, cx, y, walk, facing === "down");
  }

  ctx.restore();
}

function drawPlayerFront(ctx, cx, y, walk, showFace) {
  ctx.save();
  ctx.translate(cx + walk.cape * 8, y);
  ctx.rotate(walk.cape);
  ctx.fillStyle = "#3d2a6e";
  ctx.beginPath();
  ctx.moveTo(-22, 8);
  ctx.lineTo(0, 44);
  ctx.lineTo(22, 8);
  ctx.lineTo(14, -8);
  ctx.lineTo(-14, -8);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#c8b8ff";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = "#5a6878";
  ctx.fillRect(cx - 16 + walk.lLeg * 0.3, y + 28 + walk.lLeg, 12, 22 - walk.lLeg * 0.4);
  ctx.fillRect(cx + 4 - walk.rLeg * 0.3, y + 28 + walk.rLeg, 12, 22 - walk.rLeg * 0.4);

  ctx.fillStyle = "#5a4a78";
  ctx.beginPath();
  ctx.moveTo(cx - 24, y - 4);
  ctx.lineTo(cx + 24, y - 4);
  ctx.lineTo(cx + 20, y + 34);
  ctx.lineTo(cx - 20, y + 34);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#ffc86a";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = "#6a7a8a";
  ctx.fillRect(cx - 28, y + 18, 56, 18);

  if (showFace) {
    ctx.fillStyle = "#f1c78f";
    ctx.beginPath();
    ctx.arc(cx, y - 18, 22, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#4a5868";
    ctx.beginPath();
    ctx.moveTo(cx - 26, y - 24);
    ctx.quadraticCurveTo(cx, y - 52, cx + 26, y - 24);
    ctx.lineTo(cx + 16, y - 16);
    ctx.lineTo(cx - 16, y - 16);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#ffc86a";
    ctx.fillRect(cx - 24, y - 22, 48, 6);

    ctx.fillStyle = "#1a2530";
    ctx.beginPath();
    ctx.arc(cx - 9, y - 18, 4.5, 0, Math.PI * 2);
    ctx.arc(cx + 9, y - 18, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#7cf0a0";
    ctx.beginPath();
    ctx.arc(cx - 9, y - 19, 2, 0, Math.PI * 2);
    ctx.arc(cx + 9, y - 19, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffb070";
    ctx.beginPath();
    ctx.moveTo(cx, y - 10);
    ctx.lineTo(cx - 3, y - 6);
    ctx.lineTo(cx + 3, y - 6);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.fillStyle = "#4a5868";
    ctx.beginPath();
    ctx.arc(cx, y - 18, 20, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.save();
  ctx.translate(cx + 20, y + 4);
  ctx.rotate(0.4 + walk.arm * 0.02);
  ctx.fillStyle = "#d4dde8";
  ctx.fillRect(-4, -6, 8, 34);
  ctx.fillStyle = "#fff4dc";
  ctx.beginPath();
  ctx.moveTo(0, 28);
  ctx.lineTo(8, 36);
  ctx.lineTo(-8, 36);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(cx - 24, y + 2);
  ctx.rotate(-0.5 + walk.arm * 0.015);
    ctx.fillStyle = "#b090ff";
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff4dc";
  ctx.beginPath();
  ctx.arc(0, 0, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPlayerBack(ctx, cx, y, walk) {
  ctx.fillStyle = "#3d2a6e";
  ctx.beginPath();
  ctx.moveTo(cx - 24, y + 4);
  ctx.lineTo(cx, y + 48);
  ctx.lineTo(cx + 24, y + 4);
  ctx.lineTo(cx + 16, y - 12);
  ctx.lineTo(cx - 16, y - 12);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#5a4a78";
  ctx.beginPath();
  ctx.moveTo(cx - 24, y - 6);
  ctx.lineTo(cx + 24, y - 6);
  ctx.lineTo(cx + 20, y + 34);
  ctx.lineTo(cx - 20, y + 34);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#ffc86a";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = "#4a5868";
  ctx.beginPath();
  ctx.arc(cx, y - 20, 20, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#5a6878";
  ctx.fillRect(cx - 14 + walk.lLeg * 0.3, y + 28 + walk.lLeg, 12, 22);
  ctx.fillRect(cx + 2 - walk.rLeg * 0.3, y + 28 + walk.rLeg, 12, 22);
}

function buildPlayerFrames() {
  const right = [];

  for (let frame = 0; frame < 4; frame += 1) {
    const canvas = makeCanvas();
    const ctx = canvas.getContext("2d");
    drawPlayerFrame(ctx, C, C, "right", frame);
    right.push(canvas);
  }

  const down = [];
  const up = [];

  for (let frame = 0; frame < 4; frame += 1) {
    const canvasDown = makeCanvas();
    drawPlayerFrame(canvasDown.getContext("2d"), C, C, "down", frame);
    down.push(canvasDown);

    const canvasUp = makeCanvas();
    drawPlayerFrame(canvasUp.getContext("2d"), C, C, "up", frame);
    up.push(canvasUp);
  }

  const left = right.map(flipCanvas);

  return { up, down, left, right, frameCount: 4 };
}

function drawSlime(ctx, cx, cy, frame) {
  const hop = frame === 0 ? 0 : -4;
  shadow(ctx, cx, cy + 54, 40, 10);

  ctx.fillStyle = "#4a7838";
  ctx.fillRect(cx - 22, cy + 4 + hop, 44, 28);
  ctx.fillRect(cx - 18, cy - 8 + hop, 36, 16);
  ctx.fillStyle = "#68a850";
  ctx.fillRect(cx - 14, cy - 16 + hop, 28, 12);
  ctx.fillStyle = "#88c868";
  ctx.fillRect(cx - 8, cy - 20 + hop, 16, 6);
  ctx.fillStyle = "#1a2818";
  ctx.fillRect(cx - 10, cy - 4 + hop, 6, 6);
  ctx.fillRect(cx + 4, cy - 4 + hop, 6, 6);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(cx - 8, cy - 6 + hop, 2, 2);
  ctx.fillRect(cx + 6, cy - 6 + hop, 2, 2);
}

function drawBat(ctx, cx, cy, frame) {
  const wing = frame === 0 ? 0 : 1;
  shadow(ctx, cx, cy + 54, 56, 10);

  ctx.fillStyle = wing === 0 ? "#6a5098" : "#4a3878";
  ctx.beginPath();
  ctx.moveTo(cx - 10, cy + 4);
  ctx.quadraticCurveTo(cx - 78, cy - 34 + wing * 18, cx - 84, cy + 18);
  ctx.quadraticCurveTo(cx - 44, cy + 8, cx - 22, cy + 28);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + 10, cy + 4);
  ctx.quadraticCurveTo(cx + 78, cy - 34 + wing * 18, cx + 84, cy + 18);
  ctx.quadraticCurveTo(cx + 44, cy + 8, cx + 22, cy + 28);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#3a2850";
  ctx.beginPath();
  ctx.ellipse(cx, cy + 8, 24, 30, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffcf73";
  ctx.beginPath();
  ctx.arc(cx - 8, cy + 2, 5, 0, Math.PI * 2);
  ctx.arc(cx + 8, cy + 2, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#180810";
  ctx.beginPath();
  ctx.arc(cx - 8, cy + 3, 2.5, 0, Math.PI * 2);
  ctx.arc(cx + 8, cy + 3, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#2a1838";
  ctx.beginPath();
  ctx.moveTo(cx - 14, cy - 18);
  ctx.lineTo(cx - 4, cy - 38);
  ctx.lineTo(cx + 2, cy - 16);
  ctx.closePath();
  ctx.moveTo(cx + 14, cy - 18);
  ctx.lineTo(cx + 4, cy - 38);
  ctx.lineTo(cx - 2, cy - 16);
  ctx.closePath();
  ctx.fill();
}

function drawBrute(ctx, cx, cy, frame) {
  const stomp = frame === 1 ? 4 : 0;
  shadow(ctx, cx, cy + 56 + stomp, 58, 14);

  const body = ctx.createRadialGradient(cx - 8, cy - 16, 10, cx, cy + 8, 72);
  body.addColorStop(0, "#d4a888");
  body.addColorStop(0.55, "#8a5840");
  body.addColorStop(1, "#4a3020");

  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 6 + stomp * 0.5, 64, 54, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#5c4030";
  ctx.fillRect(cx - 48, cy - 8, 96, 22);
  ctx.fillRect(cx - 38, cy + 10, 76, 28);

  ctx.fillStyle = "#ead0b8";
  ctx.beginPath();
  ctx.arc(cx - 20, cy - 2, 8, 0, Math.PI * 2);
  ctx.arc(cx + 20, cy - 2, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#241812";
  ctx.beginPath();
  ctx.arc(cx - 20, cy, 3.5, 0, Math.PI * 2);
  ctx.arc(cx + 20, cy, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#3a2418";
  ctx.fillRect(cx - 52, cy + 18 + stomp, 18, 28);
  ctx.fillRect(cx + 34, cy + 18 - stomp * 0.5, 18, 28);

  ctx.strokeStyle = "#fff4dc";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx - 30, cy + 34);
  ctx.lineTo(cx - 18, cy + 42);
  ctx.moveTo(cx + 30, cy + 34);
  ctx.lineTo(cx + 18, cy + 42);
  ctx.stroke();
}

function drawCrawler(ctx, cx, cy, frame) {
  const scuttle = frame === 0 ? 0 : 6;
  shadow(ctx, cx, cy + 52, 40, 10);

  ctx.fillStyle = "#5a9868";
  ctx.beginPath();
  ctx.ellipse(cx, cy + 8, 36, 28, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#3a6848";
  for (let i = 0; i < 4; i += 1) {
    const side = i % 2 === 0 ? -1 : 1;
    const offset = i < 2 ? -10 : 10;
    ctx.beginPath();
    ctx.ellipse(cx + side * (30 + scuttle * 0.3), cy + offset + (frame === 1 ? side * 4 : 0), 10, 7, side * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#dfffe8";
  ctx.beginPath();
  ctx.arc(cx - 12, cy - 2, 7, 0, Math.PI * 2);
  ctx.arc(cx + 12, cy - 2, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#203428";
  ctx.beginPath();
  ctx.arc(cx - 12, cy, 3, 0, Math.PI * 2);
  ctx.arc(cx + 12, cy, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#2a4838";
  ctx.lineWidth = 3;
  for (let i = -1; i <= 1; i += 1) {
    ctx.beginPath();
    ctx.moveTo(cx + i * 8, cy - 14);
    ctx.lineTo(cx + i * 14, cy - 28);
    ctx.stroke();
  }
}

function drawElite(ctx, cx, cy, frame) {
  const pulse = frame === 1 ? 6 : 0;
  ctx.fillStyle = `rgba(255, 207, 115, ${0.12 + pulse * 0.01})`;
  ctx.beginPath();
  ctx.arc(cx, cy, 74 + pulse, 0, Math.PI * 2);
  ctx.fill();
  shadow(ctx, cx, cy + 54, 54, 12);

  const body = ctx.createRadialGradient(cx - 10, cy - 18, 10, cx, cy + 6, 70);
  body.addColorStop(0, "#ffd27e");
  body.addColorStop(0.5, "#c44a42");
  body.addColorStop(1, "#5a2028");

  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 6, 58, 50, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffe09a";
  ctx.beginPath();
  ctx.moveTo(cx - 28, cy - 28);
  ctx.lineTo(cx, cy - 52);
  ctx.lineTo(cx + 28, cy - 28);
  ctx.lineTo(cx + 18, cy - 18);
  ctx.lineTo(cx - 18, cy - 18);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#fff4dc";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = "#fff4dc";
  ctx.beginPath();
  ctx.arc(cx - 18, cy - 2, 9, 0, Math.PI * 2);
  ctx.arc(cx + 18, cy - 2, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#241018";
  ctx.beginPath();
  ctx.arc(cx - 18, cy, 4, 0, Math.PI * 2);
  ctx.arc(cx + 18, cy, 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawBoss(ctx, cx, cy, frame) {
  const breath = frame === 1 ? 1 : 0;
  ctx.fillStyle = "rgba(255, 70, 58, 0.14)";
  ctx.beginPath();
  ctx.arc(cx, cy, 84 + breath * 4, 0, Math.PI * 2);
  ctx.fill();
  shadow(ctx, cx, cy + 58, 62, 16);

  const body = ctx.createRadialGradient(cx - 14, cy - 22, 12, cx, cy + 8, 82);
  body.addColorStop(0, "#ff9478");
  body.addColorStop(0.45, "#9a2838");
  body.addColorStop(1, "#2a1018");

  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 4, 70 + breath * 2, 60, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffd27e";
  ctx.beginPath();
  ctx.moveTo(cx - 38, cy - 32);
  ctx.lineTo(cx - 20, cy - 62);
  ctx.lineTo(cx - 4, cy - 28);
  ctx.closePath();
  ctx.moveTo(cx + 38, cy - 32);
  ctx.lineTo(cx + 20, cy - 62);
  ctx.lineTo(cx + 4, cy - 28);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#fff4dc";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(cx - 54, cy + 4);
  ctx.lineTo(cx - 76, cy + 38);
  ctx.moveTo(cx + 54, cy + 4);
  ctx.lineTo(cx + 76, cy + 38);
  ctx.stroke();

  ctx.fillStyle = "#fff4dc";
  ctx.beginPath();
  ctx.arc(cx - 24, cy - 6, 13, 0, Math.PI * 2);
  ctx.arc(cx + 24, cy - 6, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#180810";
  ctx.beginPath();
  ctx.arc(cx - 24, cy - 4, 5, 0, Math.PI * 2);
  ctx.arc(cx + 24, cy - 4, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ff4a3a";
  ctx.beginPath();
  ctx.moveTo(cx - 10, cy + 18);
  ctx.lineTo(cx, cy + 36 + breath * 6);
  ctx.lineTo(cx + 10, cy + 18);
  ctx.closePath();
  ctx.fill();
}

function drawWolfPouncer(ctx, cx, cy, frame) {
  const lunge = frame === 1 ? 8 : 0;
  shadow(ctx, cx - lunge * 0.4, cy + 54, 58, 11);
  ctx.fillStyle = "#6888a8";
  ctx.beginPath();
  ctx.ellipse(cx - 8 - lunge, cy + 10, 42, 24, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#486880";
  ctx.beginPath();
  ctx.moveTo(cx + 18 - lunge, cy - 6);
  ctx.lineTo(cx + 46 - lunge, cy + 2);
  ctx.lineTo(cx + 18 - lunge, cy + 10);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#9ec4e8";
  ctx.beginPath();
  ctx.arc(cx - 18 - lunge, cy - 8, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffd27e";
  ctx.beginPath();
  ctx.arc(cx - 24 - lunge, cy - 10, 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawSkeletonArcher(ctx, cx, cy, frame) {
  const aim = frame === 1 ? 4 : 0;
  shadow(ctx, cx, cy + 54, 46, 10);
  ctx.strokeStyle = "#d8e0e8";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 18);
  ctx.lineTo(cx, cy + 28);
  ctx.moveTo(cx - 18, cy - 2);
  ctx.lineTo(cx + 18 + aim, cy - 2);
  ctx.moveTo(cx, cy + 8);
  ctx.lineTo(cx - 12, cy + 34);
  ctx.moveTo(cx, cy + 8);
  ctx.lineTo(cx + 12, cy + 34);
  ctx.stroke();
  ctx.fillStyle = "#eef4f8";
  ctx.beginPath();
  ctx.arc(cx, cy - 22, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#8a98a8";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx + 10 + aim, cy - 2);
  ctx.lineTo(cx + 34 + aim, cy - 8);
  ctx.stroke();
}

function drawShieldBrute(ctx, cx, cy, frame) {
  drawBrute(ctx, cx, cy, frame);
  ctx.fillStyle = "#788898";
  ctx.fillRect(cx - 42, cy - 8, 18, 34);
  ctx.strokeStyle = "#ffd27e";
  ctx.lineWidth = 3;
  ctx.strokeRect(cx - 42, cy - 8, 18, 34);
}

function drawGoblinRunner(ctx, cx, cy, frame) {
  const run = frame === 1 ? 6 : 0;
  shadow(ctx, cx, cy + 50, 34, 9);
  ctx.fillStyle = "#68a848";
  ctx.beginPath();
  ctx.ellipse(cx, cy + 6, 28, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#88c868";
  ctx.beginPath();
  ctx.arc(cx, cy - 12, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffd27e";
  ctx.beginPath();
  ctx.arc(cx - 6, cy - 14, 4, 0, Math.PI * 2);
  ctx.arc(cx + 6, cy - 14, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(cx - 10 + run, cy + 18, 8, 14);
  ctx.fillRect(cx + 2 - run, cy + 18, 8, 14);
}

function drawNecromancer(ctx, cx, cy, frame) {
  const pulse = frame === 1 ? 4 : 0;
  ctx.fillStyle = "rgba(120, 72, 180, 0.12)";
  ctx.beginPath();
  ctx.arc(cx, cy, 70 + pulse, 0, Math.PI * 2);
  ctx.fill();
  shadow(ctx, cx, cy + 54, 48, 11);
  ctx.fillStyle = "#3a2850";
  ctx.beginPath();
  ctx.moveTo(cx, cy - 34);
  ctx.lineTo(cx + 24, cy + 28);
  ctx.lineTo(cx - 24, cy + 28);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#a868c8";
  ctx.beginPath();
  ctx.arc(cx, cy - 18, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#88ff88";
  ctx.beginPath();
  ctx.arc(cx - 5, cy - 18, 3, 0, Math.PI * 2);
  ctx.arc(cx + 7, cy - 18, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawFireImp(ctx, cx, cy, frame) {
  const flicker = frame === 1 ? 1 : 0;
  shadow(ctx, cx, cy + 50, 36, 9);
  ctx.fillStyle = "#ff7848";
  ctx.beginPath();
  ctx.moveTo(cx - 16, cy + 16);
  ctx.quadraticCurveTo(cx, cy - 28 - flicker * 8, cx + 16, cy + 16);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ffd27e";
  ctx.beginPath();
  ctx.arc(cx, cy + 4, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#241018";
  ctx.beginPath();
  ctx.arc(cx - 5, cy + 2, 3, 0, Math.PI * 2);
  ctx.arc(cx + 5, cy + 2, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawIceWraith(ctx, cx, cy, frame) {
  const drift = frame === 1 ? 5 : 0;
  ctx.fillStyle = "rgba(136, 216, 255, 0.12)";
  ctx.beginPath();
  ctx.ellipse(cx, cy, 52 + drift, 44, 0, 0, Math.PI * 2);
  ctx.fill();
  shadow(ctx, cx, cy + 52, 40, 8);
  ctx.fillStyle = "rgba(184, 228, 255, 0.82)";
  ctx.beginPath();
  ctx.moveTo(cx, cy - 28);
  ctx.quadraticCurveTo(cx + 28, cy + 8, cx, cy + 24);
  ctx.quadraticCurveTo(cx - 28, cy + 8, cx, cy - 28);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(cx - 8, cy - 4, 5, 0, Math.PI * 2);
  ctx.arc(cx + 8, cy - 4, 5, 0, Math.PI * 2);
  ctx.fill();
}

function drawCastleKnight(ctx, cx, cy, frame) {
  const march = frame === 1 ? 3 : 0;
  shadow(ctx, cx, cy + 56, 52, 12);
  ctx.fillStyle = "#788898";
  ctx.fillRect(cx - 18, cy - 8, 36, 34);
  ctx.fillStyle = "#b8a878";
  ctx.beginPath();
  ctx.arc(cx, cy - 18, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#486878";
  ctx.fillRect(cx - 22, cy - 24, 44, 10);
  ctx.fillStyle = "#d8d0b8";
  ctx.fillRect(cx + 18, cy - 6 + march, 6, 38);
  ctx.fillStyle = "#686e78";
  ctx.fillRect(cx - 14 + march, cy + 24, 10, 18);
  ctx.fillRect(cx + 4 - march, cy + 24, 10, 18);
}

function drawZombie(ctx, cx, cy, frame) {
  const march = frame % 2 === 0 ? 0 : 3;
  shadow(ctx, cx, cy + 54, 46, 12);

  ctx.fillStyle = "#6a8860";
  ctx.fillRect(cx - 18, cy - 8 + march, 36, 44);
  ctx.fillStyle = "#8aa878";
  ctx.beginPath();
  ctx.arc(cx, cy - 22, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#3a3028";
  ctx.fillRect(cx - 10, cy - 26, 8, 8);
  ctx.fillRect(cx + 2, cy - 26, 8, 8);
  ctx.fillStyle = "#586850";
  ctx.fillRect(cx - 22 + march, cy + 10, 12, 28);
  ctx.fillRect(cx + 10 - march, cy + 10, 12, 28);
}

function drawBrainZombie(ctx, cx, cy, frame) {
  const march = frame % 2 === 0 ? 0 : 3;
  shadow(ctx, cx, cy + 54, 46, 12);

  ctx.fillStyle = "#8a8878";
  ctx.fillRect(cx - 18, cy - 8 + march, 36, 44);
  ctx.fillStyle = "#a8a090";
  ctx.beginPath();
  ctx.arc(cx, cy - 22, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#c84848";
  ctx.beginPath();
  ctx.ellipse(cx, cy - 34, 14, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#3a3028";
  ctx.fillRect(cx - 10, cy - 26, 8, 8);
  ctx.fillRect(cx + 2, cy - 26, 8, 8);
  ctx.fillStyle = "#686858";
  ctx.fillRect(cx - 22 + march, cy + 10, 12, 28);
  ctx.fillRect(cx + 10 - march, cy + 10, 12, 28);
}

function drawVikingUndead(ctx, cx, cy, frame) {
  const march = frame % 2 === 0 ? 0 : 3;
  shadow(ctx, cx, cy + 54, 46, 12);

  ctx.fillStyle = "#5a4030";
  ctx.fillRect(cx - 18, cy - 4 + march, 36, 40);
  ctx.fillStyle = "#686868";
  ctx.fillRect(cx - 20, cy - 28 + march, 40, 16);
  ctx.fillStyle = "#d8d8d8";
  ctx.fillRect(cx - 24, cy - 34 + march, 10, 14);
  ctx.fillRect(cx + 14, cy - 34 + march, 10, 14);
  ctx.fillStyle = "#3a3028";
  ctx.fillRect(cx - 8, cy - 20 + march, 6, 6);
  ctx.fillRect(cx + 2, cy - 20 + march, 6, 6);
  ctx.fillStyle = "#4a3828";
  ctx.fillRect(cx - 22 + march, cy + 12, 12, 26);
  ctx.fillRect(cx + 10 - march, cy + 12, 12, 26);
}

function drawSkeletonUndead(ctx, cx, cy, frame) {
  const march = frame % 2 === 0 ? 0 : 3;
  shadow(ctx, cx, cy + 54, 40, 10);

  ctx.fillStyle = "#d8dce8";
  ctx.fillRect(cx - 4, cy - 24 + march, 8, 14);
  ctx.fillRect(cx - 14, cy - 12 + march, 28, 22);
  ctx.fillRect(cx - 18 + march, cy + 4, 8, 24);
  ctx.fillRect(cx + 10 - march, cy + 4, 8, 24);
  ctx.fillRect(cx - 16, cy + 24 + march, 10, 14);
  ctx.fillRect(cx + 6, cy + 24 + march, 10, 14);
  ctx.fillStyle = "#1a1820";
  ctx.fillRect(cx - 6, cy - 20 + march, 4, 4);
  ctx.fillRect(cx + 2, cy - 20 + march, 4, 4);
}

function drawPopstarUndead(ctx, cx, cy, frame) {
  const march = frame % 2 === 0 ? 0 : 3;
  shadow(ctx, cx, cy + 54, 40, 10);

  ctx.fillStyle = "#d84898";
  ctx.fillRect(cx - 18, cy - 4 + march, 36, 40);
  ctx.fillStyle = "#f0d848";
  ctx.fillRect(cx - 14, cy - 22 + march, 28, 14);
  ctx.fillStyle = "#e8e8f0";
  ctx.fillRect(cx - 10, cy - 16 + march, 20, 12);
  ctx.fillStyle = "#282028";
  ctx.fillRect(cx - 8, cy - 12 + march, 5, 5);
  ctx.fillRect(cx + 3, cy - 12 + march, 5, 5);
  ctx.fillStyle = "#282028";
  ctx.fillRect(cx - 4, cy - 2 + march, 8, 10);
  ctx.fillStyle = "#d84898";
  ctx.fillRect(cx - 20 + march, cy + 10, 10, 24);
  ctx.fillRect(cx + 10 - march, cy + 10, 10, 24);
}

function drawKnightUndead(ctx, cx, cy, frame) {
  const march = frame % 2 === 0 ? 0 : 3;
  shadow(ctx, cx, cy + 54, 44, 10);

  ctx.fillStyle = "#484858";
  ctx.fillRect(cx - 18, cy - 6 + march, 36, 38);
  ctx.fillStyle = "#d8dce8";
  ctx.fillRect(cx - 10, cy - 24 + march, 20, 16);
  ctx.fillStyle = "#686878";
  ctx.fillRect(cx - 14, cy - 28 + march, 28, 8);
  ctx.fillStyle = "#1a1820";
  ctx.fillRect(cx - 6, cy - 18 + march, 4, 4);
  ctx.fillRect(cx + 2, cy - 18 + march, 4, 4);
  ctx.fillStyle = "#383848";
  ctx.fillRect(cx - 22 + march, cy + 8, 12, 26);
  ctx.fillRect(cx + 10 - march, cy + 8, 12, 26);
}

function drawGreenDragon(ctx, cx, cy, frame) {
  const march = frame % 2 === 0 ? 0 : 2;
  shadow(ctx, cx, cy + 54, 40, 10);

  ctx.fillStyle = "#488838";
  ctx.fillRect(cx - 16 + march, cy - 4, 28, 22);
  ctx.fillRect(cx - 10, cy - 16 + march, 18, 14);
  ctx.fillStyle = "#68b848";
  ctx.fillRect(cx - 6, cy + 2 + march, 10, 8);
  ctx.fillStyle = "#f0a828";
  ctx.beginPath();
  ctx.arc(cx - 2, cy + 6 + march, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e8f0e8";
  ctx.fillRect(cx + 6, cy - 18 + march, 4, 4);
  ctx.fillRect(cx + 12, cy - 14 + march, 4, 4);
}

function drawPolarDogBoss(ctx, cx, cy, frame) {
  const march = frame % 2 === 0 ? 0 : 2;
  shadow(ctx, cx, cy + 54, 44, 10);

  ctx.fillStyle = "#e8eef4";
  ctx.fillRect(cx - 20 + march, cy + 8, 14, 10);
  ctx.fillRect(cx + 6 - march, cy + 8, 14, 10);
  ctx.fillRect(cx - 8, cy - 6 + march, 28, 18);
  ctx.fillRect(cx + 12, cy - 2 + march, 10, 8);
  ctx.fillStyle = "#c8d0d8";
  ctx.fillRect(cx - 4, cy + 2 + march, 10, 8);
  ctx.fillStyle = "#181820";
  ctx.fillRect(cx + 14, cy - 4 + march, 3, 3);
}

function drawSpottedDogBoss(ctx, cx, cy, frame) {
  const march = frame % 2 === 0 ? 0 : 2;
  shadow(ctx, cx, cy + 54, 44, 10);

  ctx.fillStyle = "#d0a058";
  ctx.fillRect(cx - 20 + march, cy + 8, 14, 10);
  ctx.fillRect(cx + 6 - march, cy + 8, 14, 10);
  ctx.fillRect(cx - 8, cy - 6 + march, 28, 18);
  ctx.fillRect(cx + 12, cy - 2 + march, 10, 8);
  ctx.fillStyle = "#684828";
  ctx.fillRect(cx - 2, cy + march, 4, 4);
  ctx.fillRect(cx + 6, cy + 4 + march, 4, 4);
  ctx.fillStyle = "#181820";
  ctx.fillRect(cx + 14, cy - 4 + march, 3, 3);
}

function drawReaperBoss(ctx, cx, cy, frame) {
  const march = frame % 2 === 0 ? 0 : 3;
  shadow(ctx, cx, cy + 54, 46, 12);

  ctx.fillStyle = "#181820";
  ctx.fillRect(cx - 16, cy - 20 + march, 32, 48);
  ctx.fillRect(cx - 20, cy - 28 + march, 40, 14);
  ctx.fillStyle = "#e8e8f0";
  ctx.fillRect(cx - 8, cy - 18 + march, 16, 14);
  ctx.fillStyle = "#181820";
  ctx.fillRect(cx - 4, cy - 14 + march, 3, 3);
  ctx.fillRect(cx + 1, cy - 14 + march, 3, 3);
  ctx.fillStyle = "#686868";
  ctx.fillRect(cx + 14, cy - 8 + march, 24, 4);
  ctx.fillRect(cx + 34, cy - 16 + march, 8, 20);
}

const ENEMY_DRAWERS = {
  slime: drawSlime,
  zombie: drawZombie,
  brainZombie: drawBrainZombie,
  vikingUndead: drawVikingUndead,
  skeletonUndead: drawSkeletonUndead,
  popstarUndead: drawPopstarUndead,
  knightUndead: drawKnightUndead,
  greenDragon: drawGreenDragon,
  polarDogBoss: drawPolarDogBoss,
  spottedDogBoss: drawSpottedDogBoss,
  reaperBoss: drawReaperBoss,
  bat: drawBat,
  brute: drawBrute,
  crawler: drawCrawler,
  elite: drawElite,
  boss: drawBoss,
  wolfPouncer: drawWolfPouncer,
  skeletonArcher: drawSkeletonArcher,
  shieldBrute: drawShieldBrute,
  goblinRunner: drawGoblinRunner,
  necromancer: drawNecromancer,
  fireImp: drawFireImp,
  iceWraith: drawIceWraith,
  castleKnight: drawCastleKnight,
};

function buildEnemyFrames(type) {
  const draw = ENEMY_DRAWERS[type] ?? drawSlime;
  const frames = [];

  for (let frame = 0; frame < 2; frame += 1) {
    const canvas = makeCanvas();
    draw(canvas.getContext("2d"), C, C, frame);
    frames.push(canvas);
  }

  return { frames, frameCount: 2 };
}

function drawXPGem(ctx, cx, cy, colors, frame) {
  const spin = frame === 0 ? 0 : 0.18;
  shadow(ctx, cx, cy + 48, 22, 8);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(spin);

  const glow = ctx.createRadialGradient(0, 0, 4, 0, 0, 52);
  glow.addColorStop(0, colors.glow);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, 52, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = colors.base;
  ctx.beginPath();
  ctx.moveTo(0, -34);
  ctx.lineTo(28, 0);
  ctx.lineTo(0, 34);
  ctx.lineTo(-28, 0);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = colors.shine;
  ctx.beginPath();
  ctx.moveTo(0, -34);
  ctx.lineTo(12, -8);
  ctx.lineTo(0, 8);
  ctx.lineTo(-12, -8);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.fillRect(-6, -18, 10, 10);
  ctx.restore();
}

function buildXPGemFrames(tier) {
  const palette = {
    small: { base: "#ffc86a", shine: "#fff0c8", glow: "rgba(255, 200, 106, 0.55)" },
    green: { base: "#9b7dff", shine: "#d4c0ff", glow: "rgba(155, 125, 255, 0.55)" },
    red: { base: "#ff9a58", shine: "#ffd4a8", glow: "rgba(255, 154, 88, 0.58)" },
  };
  const colors = palette[tier] ?? palette.small;
  const frames = [];

  for (let frame = 0; frame < 2; frame += 1) {
    const canvas = makeCanvas();
    drawXPGem(canvas.getContext("2d"), C, C, colors, frame);
    frames.push(canvas);
  }

  return frames;
}

function drawCoin(ctx, cx, cy, frame) {
  shadow(ctx, cx, cy + 48, 20, 8);
  const squash = frame === 0 ? 1 : 0.55;

  const glow = ctx.createRadialGradient(cx, cy, 2, cx, cy, 48);
  glow.addColorStop(0, "rgba(255,244,220,0.75)");
  glow.addColorStop(0.5, "rgba(255,224,154,0.35)");
  glow.addColorStop(1, "rgba(255,176,72,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, 48, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffd27e";
  ctx.beginPath();
  ctx.ellipse(cx, cy, 28 * squash, 28, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#fff4dc";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 22 * squash, 22, 0, 0.35, Math.PI * 0.85);
  ctx.stroke();

  if (frame === 0) {
    ctx.fillStyle = "#fff4dc";
    ctx.font = "900 28px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("G", cx, cy + 2);
  } else {
    ctx.fillStyle = "#c8914d";
    ctx.fillRect(cx - 3, cy - 22, 6, 44);
  }
}

function drawChest(ctx, cx, cy, frame) {
  const glow = frame === 1 ? 0.28 : 0.16;
  ctx.fillStyle = `rgba(255, 207, 115, ${glow})`;
  ctx.beginPath();
  ctx.arc(cx, cy, 62, 0, Math.PI * 2);
  ctx.fill();
  shadow(ctx, cx, cy + 52, 38, 10);

  ctx.fillStyle = "#6b3f22";
  ctx.fillRect(cx - 44, cy + 10, 88, 44);
  ctx.fillStyle = "#8f5528";
  ctx.fillRect(cx - 44, cy + 10, 88, 14);

  ctx.fillStyle = "#ffd27e";
  ctx.fillRect(cx - 46, cy - 16, 92, 30);
  ctx.fillStyle = "#c8914d";
  ctx.fillRect(cx - 46, cy - 16, 92, 10);
  ctx.strokeStyle = "#fff4dc";
  ctx.lineWidth = 4;
  ctx.strokeRect(cx - 46, cy - 16, 92, 30);

  ctx.fillStyle = "#ffe09a";
  ctx.beginPath();
  ctx.arc(cx, cy - 2, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff4dc";
  ctx.fillRect(cx - 4, cy - 14, 8, 20);

  ctx.strokeStyle = "#3a2418";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - 28, cy + 10);
  ctx.lineTo(cx - 28, cy + 54);
  ctx.moveTo(cx + 28, cy + 10);
  ctx.lineTo(cx + 28, cy + 54);
  ctx.stroke();

  if (frame === 1) {
    ctx.fillStyle = "rgba(255,244,220,0.55)";
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy - 28);
    ctx.lineTo(cx, cy - 44);
    ctx.lineTo(cx + 8, cy - 28);
    ctx.closePath();
    ctx.fill();
  }
}

function drawArcaneBolt(ctx, cx, cy, storm = false) {
  const glow = ctx.createRadialGradient(cx, cy, 4, cx, cy, 68);
  glow.addColorStop(0, storm ? "#fff4dc" : "#fff4dc");
  glow.addColorStop(0.35, storm ? "#c8a0ff" : "#b090ff");
  glow.addColorStop(1, storm ? "rgba(120,72,255,0)" : "rgba(90,60,180,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, 68, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = storm ? "#e8d4ff" : "#fff4dc";
  ctx.beginPath();
  ctx.moveTo(cx, cy - 28);
  ctx.lineTo(cx + 16, cy + 4);
  ctx.lineTo(cx + 4, cy + 4);
  ctx.lineTo(cx + 10, cy + 28);
  ctx.lineTo(cx - 10, cy + 28);
  ctx.lineTo(cx - 4, cy + 4);
  ctx.lineTo(cx - 16, cy + 4);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = storm ? "rgba(255,244,220,0.8)" : "#ffe09a";
  ctx.lineWidth = 3;
  ctx.stroke();
}

function drawLightningMarker(ctx, cx, cy) {
  const glow = ctx.createRadialGradient(cx, cy, 4, cx, cy, 72);
  glow.addColorStop(0, "rgba(255,244,220,0.8)");
  glow.addColorStop(0.45, "rgba(110,203,255,0.45)");
  glow.addColorStop(1, "rgba(67,169,255,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, 72, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#fff4dc";
  ctx.lineWidth = 6;
  ctx.shadowColor = "#43a9ff";
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy - 34);
  ctx.lineTo(cx + 10, cy - 4);
  ctx.lineTo(cx - 2, cy - 4);
  ctx.lineTo(cx + 12, cy + 34);
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawHolyPulse(ctx, cx, cy, divine = false) {
  const glow = ctx.createRadialGradient(cx, cy, 8, cx, cy, 78);
  glow.addColorStop(0, divine ? "rgba(255,244,220,0.85)" : "rgba(255,224,154,0.65)");
  glow.addColorStop(0.5, divine ? "rgba(255,210,126,0.35)" : "rgba(255,207,115,0.25)");
  glow.addColorStop(1, "rgba(255,207,115,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, 78, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = divine ? "#fff4dc" : "#ffe09a";
  ctx.lineWidth = divine ? 10 : 7;
  ctx.beginPath();
  ctx.arc(cx, cy, 42, 0, Math.PI * 2);
  ctx.stroke();

  if (divine) {
    ctx.strokeStyle = "rgba(255,244,220,0.55)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, 28, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(255,255,255,0.45)";
  ctx.lineWidth = 3;
  for (let i = 0; i < 4; i += 1) {
    const angle = (Math.PI / 2) * i + 0.2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * 18, cy + Math.sin(angle) * 18);
    ctx.lineTo(cx + Math.cos(angle) * 56, cy + Math.sin(angle) * 56);
    ctx.stroke();
  }
}

function drawOrbitingBlade(ctx, cx, cy, celestial = false) {
  const glow = ctx.createRadialGradient(cx, cy, 4, cx, cy, 58);
  glow.addColorStop(0, celestial ? "rgba(255,244,220,0.55)" : "rgba(255,244,220,0.35)");
  glow.addColorStop(1, "rgba(255,244,220,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, 58, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = celestial ? "#fff4dc" : "#d4dde8";
  ctx.beginPath();
  ctx.moveTo(cx, cy - 38);
  ctx.lineTo(cx + 18, cy + 6);
  ctx.lineTo(cx + 4, cy + 10);
  ctx.lineTo(cx, cy + 38);
  ctx.lineTo(cx - 4, cy + 10);
  ctx.lineTo(cx - 18, cy + 6);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = celestial ? "#ffe09a" : "#fff4dc";
  ctx.lineWidth = celestial ? 5 : 4;
  ctx.stroke();

  ctx.fillStyle = celestial ? "#ffe09a" : "#fff4dc";
  ctx.fillRect(cx - 8, cy - 6, 16, 10);
}

function buildSingleSprite(drawFn) {
  const canvas = makeCanvas();
  drawFn(canvas.getContext("2d"), C, C);
  return canvas;
}

export function buildAllSprites() {
  const player = buildPlayerFrames();
  const enemies = {};

  for (const type of ENEMY_TYPES) {
    enemies[type] = buildEnemyFrames(type);
  }

  const pickups = {
    xpGem: {
      small: buildXPGemFrames("small"),
      green: buildXPGemFrames("green"),
      red: buildXPGemFrames("red"),
    },
    coin: [0, 1].map((frame) => {
      const canvas = makeCanvas();
      drawCoin(canvas.getContext("2d"), C, C, frame);
      return canvas;
    }),
    chest: [0, 1].map((frame) => {
      const canvas = makeCanvas();
      drawChest(canvas.getContext("2d"), C, C, frame);
      return canvas;
    }),
  };

  const projectiles = {
    arcane: buildSingleSprite((ctx, cx, cy) => drawArcaneBolt(ctx, cx, cy, false)),
    storm: buildSingleSprite((ctx, cx, cy) => drawArcaneBolt(ctx, cx, cy, true)),
  };

  const effects = {
    blade: buildSingleSprite((ctx, cx, cy) => drawOrbitingBlade(ctx, cx, cy, false)),
    celestial: buildSingleSprite((ctx, cx, cy) => drawOrbitingBlade(ctx, cx, cy, true)),
    holy: buildSingleSprite((ctx, cx, cy) => drawHolyPulse(ctx, cx, cy, false)),
    divine: buildSingleSprite((ctx, cx, cy) => drawHolyPulse(ctx, cx, cy, true)),
    lightning: buildSingleSprite(drawLightningMarker),
    thunder: buildSingleSprite(drawLightningMarker),
  };

  return { player, enemies, pickups, projectiles, effects };
}

export function createPlayerSprite() {
  return buildPlayerFrames().down[0];
}

export function createEnemySprite(type) {
  return buildEnemyFrames(type).frames[0];
}

export function createChestSprite() {
  const canvas = makeCanvas();
  drawChest(canvas.getContext("2d"), C, C, 0);
  return canvas;
}

export function createMenuHeroSprite() {
  const canvas = document.createElement("canvas");
  canvas.width = 420;
  canvas.height = 420;
  const ctx = canvas.getContext("2d");
  const playerSprite = createPlayerSprite();

  ctx.save();
  ctx.translate(210, 210);
  ctx.scale(2.1, 2.1);
  ctx.drawImage(playerSprite, -91, -91, 182, 182);
  ctx.restore();

  return canvas;
}

export function createPlayerAnimationSet() {
  return buildPlayerFrames();
}

let spriteCache = null;

export function getSpriteCache() {
  if (!spriteCache) {
    spriteCache = buildAllSprites();
  }

  return spriteCache;
}

export function getEnemyFrames(type) {
  return getSpriteCache().enemies[type] ?? getSpriteCache().enemies.slime;
}

export function getPickupSprite(kind, variant, frameIndex = 0) {
  const group = getSpriteCache().pickups[kind];

  if (Array.isArray(group)) {
    return group[frameIndex % group.length];
  }

  const tierSet = group[variant] ?? group.small;
  return tierSet[frameIndex % tierSet.length];
}

export function getProjectileSprite(style) {
  return getSpriteCache().projectiles[style] ?? getSpriteCache().projectiles.arcane;
}

export function getEffectSprite(style) {
  return getSpriteCache().effects[style] ?? getSpriteCache().effects.blade;
}
