import { GameConfig } from "../config/GameConfig.js";

export class AudioSystem {
  constructor() {
    this.context = null;
    this.muted = false;
    this.masterVolume = 1;
    this.shootCooldown = 0;
    this.music = new Audio(GameConfig.audio.music.menu);
    this.music.loop = true;
    this.music.preload = "auto";
    this.musicStarted = false;
    this.musicState = "menu";
  }

  setVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.applyMusicVolume();
  }

  getVolume() {
    return this.masterVolume;
  }

  setMuted(muted) {
    this.muted = muted;
    this.applyMusicVolume();
  }

  isMuted() {
    return this.muted;
  }

  ensureContext() {
    if (!this.context) {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (this.context.state === "suspended") {
      this.context.resume();
    }
  }

  ensureMusic() {
    if (this.muted || this.masterVolume <= 0 || this.musicStarted) {
      return;
    }

    this.musicStarted = true;
    this.applyMusicVolume();
    this.music.play().catch(() => {
      this.musicStarted = false;
    });
  }

  syncMusicState(state) {
    const isMenuMusic =
      state === "menu" ||
      state === "shop";

    const nextState = isMenuMusic ? "menu" : "gameplay";
    if (this.musicState === nextState) {
      this.applyMusicVolume();
      return;
    }

    this.musicState = nextState;
    this.applyMusicVolume();
  }

  applyMusicVolume() {
    const config = GameConfig.audio.music;
    const base = this.musicState === "menu" ? config.volume : config.gameplayVolume;
    this.music.volume = this.getEffectiveVolume(base);
  }

  getEffectiveVolume(baseVolume) {
    if (this.muted || this.masterVolume <= 0) {
      return 0;
    }

    return baseVolume * this.masterVolume;
  }

  scaleVolume(volume) {
    return this.getEffectiveVolume(volume);
  }

  update(deltaTime) {
    this.shootCooldown = Math.max(0, this.shootCooldown - deltaTime);
  }

  play(type) {
    if (this.muted || this.masterVolume <= 0) {
      return;
    }

    this.ensureContext();

    const handlers = {
      shoot: () => this.playShoot(),
      enemyHit: () => this.playTone(280, 0.05, "square", 0.04),
      enemyDeath: () => this.playSweep(520, 180, 0.12, "sawtooth", 0.06),
      xpPickup: () => this.playTone(920, 0.07, "sine", 0.05),
      levelUp: () => this.playArpeggio([523, 659, 784], 0.08, 0.06),
      chestOpen: () => this.playSweep(220, 440, 0.18, "triangle", 0.07),
      evolution: () => this.playArpeggio([392, 494, 587, 784], 0.1, 0.08),
      playerDamage: () => this.playSweep(180, 90, 0.14, "sawtooth", 0.07),
      gameOver: () => this.playSweep(320, 80, 0.45, "triangle", 0.08),
    };

    handlers[type]?.();
  }

  playShoot() {
    if (this.shootCooldown > 0) {
      return;
    }

    this.shootCooldown = 0.05;
    this.playTone(760, 0.035, "square", 0.025);
  }

  playTone(frequency, duration, type = "sine", volume = 0.05) {
    const ctx = this.context;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(this.scaleVolume(volume), now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
  }

  playSweep(startFrequency, endFrequency, duration, type = "sine", volume = 0.05) {
    const ctx = this.context;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(startFrequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, endFrequency), now + duration);
    gain.gain.setValueAtTime(this.scaleVolume(volume), now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
  }

  playArpeggio(frequencies, noteDuration, volume = 0.05) {
    frequencies.forEach((frequency, index) => {
      const ctx = this.context;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = ctx.currentTime + index * noteDuration * 0.85;

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(this.scaleVolume(volume), start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + noteDuration);

      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(start);
      oscillator.stop(start + noteDuration + 0.02);
    });
  }
}
