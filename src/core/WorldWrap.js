import { GameConfig } from "../config/GameConfig.js";
import { normalizeVector } from "./MathUtils.js";

export function getWorldBounds() {
  return GameConfig.world.bounds;
}

export function wrapAxis(value, min, max) {
  const span = max - min;

  if (span <= 0) {
    return { value, didWrap: false };
  }

  let wrapped = value;
  let didWrap = false;

  while (wrapped > max) {
    wrapped -= span;
    didWrap = true;
  }

  while (wrapped < min) {
    wrapped += span;
    didWrap = true;
  }

  return { value: wrapped, didWrap };
}

/** Pac-Man style wrap inside the configured world box. Returns true if position changed sides. */
export function wrapWorldPosition(position, bounds = getWorldBounds()) {
  const xWrap = wrapAxis(position.x, bounds.minX, bounds.maxX);
  const yWrap = wrapAxis(position.y, bounds.minY, bounds.maxY);
  position.x = xWrap.value;
  position.y = yWrap.value;
  return xWrap.didWrap || yWrap.didWrap;
}

function wrapDelta(delta, span) {
  if (span <= 0) {
    return delta;
  }

  if (delta > span * 0.5) {
    return delta - span;
  }

  if (delta < -span * 0.5) {
    return delta + span;
  }

  return delta;
}

export function wrappedDistanceBetween(a, b, bounds = getWorldBounds()) {
  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;
  const dx = wrapDelta(b.x - a.x, width);
  const dy = wrapDelta(b.y - a.y, height);
  return Math.hypot(dx, dy);
}

export function wrappedDirectionBetween(from, to, bounds = getWorldBounds()) {
  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;

  return normalizeVector({
    x: wrapDelta(to.x - from.x, width),
    y: wrapDelta(to.y - from.y, height),
  });
}
