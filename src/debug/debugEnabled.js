/**
 * Debug tools (CMD command chat, god mode) are available when EITHER:
 *   - the URL has ?debug=1, or
 *   - the game is running locally (localhost / 127.0.0.1 / file://).
 * This keeps the CMD button handy while testing, but hides it on a public deploy.
 */
export function isDebugEnabled() {
  if (typeof window === "undefined") {
    return false;
  }

  if (new URLSearchParams(window.location.search).get("debug") === "1") {
    return true;
  }

  const host = window.location.hostname;

  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "" ||
    window.location.protocol === "file:"
  );
}

/** Optional ?startMin=10 or ?startTime=600 to begin at late-game rotation. */
export function getDebugStartSurvivalTime() {
  if (typeof window === "undefined" || !isDebugEnabled()) {
    return 0;
  }

  const params = new URLSearchParams(window.location.search);
  const startTime = Number(params.get("startTime"));
  const startMin = Number(params.get("startMin"));

  if (Number.isFinite(startTime) && startTime > 0) {
    return startTime;
  }

  if (Number.isFinite(startMin) && startMin > 0) {
    return startMin * 60;
  }

  return 0;
}
