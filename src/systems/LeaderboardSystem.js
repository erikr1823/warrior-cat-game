import { LeaderboardConfig, isLeaderboardConfigured } from "../config/LeaderboardConfig.js";

const NAME_MAX_LENGTH = 12;
const DEFAULT_NAME = "Player";
const MIN_SURVIVAL_TIME = 10;

/**
 * Talks to Supabase via its REST API using fetch (no external SDK / CDN needed),
 * which keeps the game a fully static deploy. Only the public anon key is used.
 */
const CACHE_TTL_MS = 30000;

export class LeaderboardSystem {
  constructor() {
    this.cachedScores = null;
    this.cacheTime = 0;
  }

  isConfigured() {
    return isLeaderboardConfigured();
  }

  // Returns cached scores immediately (or null) for instant display.
  getCachedScores() {
    return this.cachedScores;
  }

  isCacheFresh() {
    return this.cachedScores !== null && Date.now() - this.cacheTime < CACHE_TTL_MS;
  }

  // Warm the cache in the background; ignores failures.
  prefetch() {
    if (this.isConfigured() && !this.isCacheFresh()) {
      this.getTopScores(10).catch(() => {});
    }
  }

  /** Trim, strip odd characters, clamp length, fall back to "Player". */
  sanitizeName(rawName) {
    if (typeof rawName !== "string") {
      return DEFAULT_NAME;
    }

    const cleaned = rawName
      .replace(/[^\p{L}\p{N} _.\-]/gu, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, NAME_MAX_LENGTH)
      .trim();

    return cleaned.length > 0 ? cleaned : DEFAULT_NAME;
  }

  /** Returns true only when the run is worth recording. */
  validateScore(score) {
    if (!score) {
      return false;
    }

    return (
      Number(score.survival_time) > MIN_SURVIVAL_TIME &&
      Number(score.kills) >= 0 &&
      Number(score.final_level) >= 1 &&
      Number(score.coins_earned) >= 0
    );
  }

  buildScoreRow(runSummary, rawName) {
    return {
      player_name: this.sanitizeName(rawName),
      survival_time: Math.max(0, Math.round(Number(runSummary?.survivalTime) || 0)),
      kills: Math.max(0, Math.floor(Number(runSummary?.killCount) || 0)),
      final_level: Math.max(1, Math.floor(Number(runSummary?.finalLevel) || 1)),
      coins_earned: Math.max(0, Math.floor(Number(runSummary?.coinsEarned) || 0)),
      bosses_defeated: Math.max(0, Math.floor(Number(runSummary?.bossDefeatedCount) || 0)),
    };
  }

  headers() {
    return {
      "Content-Type": "application/json",
      apikey: LeaderboardConfig.supabaseAnonKey,
      Authorization: `Bearer ${LeaderboardConfig.supabaseAnonKey}`,
    };
  }

  endpoint() {
    const base = LeaderboardConfig.supabaseUrl.replace(/\/$/, "");
    return `${base}/rest/v1/${LeaderboardConfig.tableName}`;
  }

  async submitScore(score) {
    if (!this.isConfigured()) {
      return { ok: false, reason: "not_configured" };
    }

    if (!this.validateScore(score)) {
      return { ok: false, reason: "invalid" };
    }

    try {
      const response = await fetch(this.endpoint(), {
        method: "POST",
        headers: { ...this.headers(), Prefer: "return=minimal" },
        body: JSON.stringify(score),
      });

      if (!response.ok) {
        return { ok: false, reason: "request_failed" };
      }

      return { ok: true };
    } catch (error) {
      return { ok: false, reason: "network_error" };
    }
  }

  async getTopScores(limit = 10) {
    if (!this.isConfigured()) {
      return { ok: false, reason: "not_configured", scores: [] };
    }

    const select =
      "player_name,survival_time,kills,final_level,coins_earned,bosses_defeated,created_at";
    const url =
      `${this.endpoint()}?select=${select}` +
      `&order=survival_time.desc&order=kills.desc&order=final_level.desc&limit=${limit}`;

    try {
      const response = await fetch(url, { method: "GET", headers: this.headers() });

      if (!response.ok) {
        return { ok: false, reason: "request_failed", scores: [] };
      }

      const scores = await response.json();
      const list = Array.isArray(scores) ? scores : [];
      this.cachedScores = list;
      this.cacheTime = Date.now();
      return { ok: true, scores: list };
    } catch (error) {
      return { ok: false, reason: "network_error", scores: [] };
    }
  }
}
