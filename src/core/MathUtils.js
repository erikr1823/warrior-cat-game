export function normalizeVector(vector) {
  const length = Math.hypot(vector.x, vector.y);

  if (length === 0) {
    return { x: 0, y: 0 };
  }

  return {
    x: vector.x / length,
    y: vector.y / length,
  };
}

export function roundTo(value, decimals = 0) {
  const multiplier = 10 ** decimals;
  return Math.round(value * multiplier) / multiplier;
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

export function distanceBetween(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function directionBetween(from, to) {
  return normalizeVector({
    x: to.x - from.x,
    y: to.y - from.y,
  });
}

export function circlesOverlap(a, b) {
  return distanceBetween(a.position, b.position) <= a.radius + b.radius;
}

export function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function isOffScreen(position, camera, width, height, padding = 200) {
  const screenPosition = camera.worldToScreen(position);

  return (
    screenPosition.x < -padding ||
    screenPosition.x > width + padding ||
    screenPosition.y < -padding ||
    screenPosition.y > height + padding
  );
}
