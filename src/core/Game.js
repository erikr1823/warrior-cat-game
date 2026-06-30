import { Camera } from "./Camera.js";
import { Input } from "./Input.js";
import { isOffScreen } from "./MathUtils.js";
import { GameConfig } from "../config/GameConfig.js";
import { GameIdentity } from "../config/GameIdentity.js";
import { Player } from "../entities/Player.js";
import { CollisionSystem } from "../systems/CollisionSystem.js";
import { MenuSystem } from "../systems/MenuSystem.js";
import { Renderer } from "../systems/Renderer.js";
import { Spawner } from "../systems/Spawner.js";
import { UISystem } from "../systems/UISystem.js";
import { PassiveSystem } from "../systems/PassiveSystem.js";
import { UpgradeSystem } from "../systems/UpgradeSystem.js";
import { WeaponSystem } from "../systems/WeaponSystem.js";
import { ChestRewardSystem } from "../systems/ChestRewardSystem.js";
import { TraitSystem } from "../systems/TraitSystem.js";
import { SynergySystem } from "../systems/SynergySystem.js";
import { HazardSystem } from "../systems/HazardSystem.js";
import { SaveSystem } from "../systems/SaveSystem.js";
import { MetaUpgradeSystem } from "../systems/MetaUpgradeSystem.js";
import { ShopSystem } from "../systems/ShopSystem.js";
import { PauseMenuSystem } from "../systems/PauseMenuSystem.js";
import { applyCharacterToRun } from "../systems/CharacterBonusSystem.js";
import { getCharacterDefinition } from "../config/CharacterDefinitions.js";
import { WorldMap } from "../systems/WorldMap.js";
import { FeedbackSystem } from "../systems/FeedbackSystem.js";
import { ProjectilePool } from "../systems/ProjectilePool.js";
import { removeDeadInPlace } from "./EntityCleanup.js";
import { BiomeAmbienceSystem } from "../systems/BiomeAmbienceSystem.js";
import { DebugChatSystem } from "../systems/DebugChatSystem.js";
import { LeaderboardSystem } from "../systems/LeaderboardSystem.js";
import { applyGodModeToPlayer } from "../debug/GodMode.js";
import { isDebugEnabled } from "../debug/debugEnabled.js";
import { preloadEnemyArt } from "../assets/EnemyVisuals.js";

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.width = GameConfig.resolution.width;
    this.height = GameConfig.resolution.height;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.lastTime = 0;
    this.fps = 0;
    this.frameSmoothing = 0.9;
    this.running = false;
    this.state = "menu";

    this.saveSystem = new SaveSystem();
    this.saveData = this.saveSystem.load();
    this.metaUpgradeSystem = new MetaUpgradeSystem();

    this.input = new Input(canvas);
    this.camera = new Camera(this.width, this.height);
    this.renderer = new Renderer(this.context, this.width, this.height);
    this.menu = new MenuSystem(this.context, this.width, this.height);
    this.shop = new ShopSystem(this.context, this.width, this.height);
    this.pauseMenu = new PauseMenuSystem(this.context, this.width, this.height);
    this.ui = new UISystem(this.context, this.width, this.height);
    this.worldMap = new WorldMap();
    this.biomeAmbience = new BiomeAmbienceSystem(this.width, this.height);
    this.debugEnabled = isDebugEnabled();
    this.debugChat = new DebugChatSystem(this.context, this.width, this.height, this.debugEnabled);
    this.godMode = false;
    this.timeScale = 1;
    this.feedback = new FeedbackSystem(this);
    this.projectilePool = new ProjectilePool();
    this.runSummary = null;

    this.leaderboard = new LeaderboardSystem();
    this.leaderboardView = this.createLeaderboardView();
    this.nameCaptureHandler = null;
    this.menu.leaderboard = this.leaderboard;
    this.resetRun();
  }

  async initialize() {
    preloadEnemyArt();
    this.leaderboard.prefetch();
    await this.worldMap.load();
  }

  start() {
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame((time) => this.loop(time));
  }

  loop(currentTime) {
    if (!this.running) {
      return;
    }

    try {
      const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
      this.lastTime = currentTime;
      this.updateFPS(deltaTime);
      this.handleAudioControls();

      if (this.state === "menu") {
        this.updateMenu();
      } else if (this.state === "shop") {
        this.updateShop();
      } else if (this.state === "gameOver") {
        this.updateGameOver(deltaTime);
      } else if (this.state === "levelUp") {
        this.updateLevelUp();
      } else if (this.state === "chestReward") {
        this.updateChestReward(deltaTime);
      } else if (this.state === "paused") {
        this.updatePaused();
      } else {
        this.update(deltaTime);
      }

      this.render();
      this.feedback.syncMusic(this.state);
    } catch (error) {
      console.error(error);
      this.running = false;
      showRuntimeError(error);
    }

    this.input.endFrame();

    requestAnimationFrame((time) => this.loop(time));
  }

  handleAudioControls() {
    this.ui.handleVolumeSlider(this.input, this.feedback.getVolume(), (volume) => {
      this.feedback.setVolume(volume);
    });

    if (this.ui.consumeMuteClick(this.input)) {
      this.feedback.toggleMute();
    }
  }

  updateMenu() {
    this.feedback.ensureAudio();

    if (this.menu.update(this.input)) {
      this.feedback.ensureAudio();
      this.state = "shop";
    }
  }

  updateShop() {
    this.feedback.ensureAudio();

    const action = this.shop.update(this.input, this.saveData, this.metaUpgradeSystem, this.saveSystem);

    if (action === "startRun") {
      this.startRun();
    }
  }

  updateGameOver(deltaTime) {
    this.updateScreenShake(deltaTime);
    this.feedback.update(deltaTime);

    if (!this.input.consumeClick()) {
      return;
    }

    const ui = this.ui;

    if (ui.gameOverSubmitButton && this.input.isMouseOver(ui.gameOverSubmitButton)) {
      this.submitLeaderboardScore();
      return;
    }

    if (ui.gameOverRestartButton && this.input.isMouseOver(ui.gameOverRestartButton)) {
      this.stopNameCapture();
      this.startRun();
      return;
    }

    if (ui.gameOverShopButton && this.input.isMouseOver(ui.gameOverShopButton)) {
      this.stopNameCapture();
      this.state = "shop";
    }
  }

  updateLevelUp() {
    this.ui.layoutUpgradeChoiceCards(this.levelUpChoices);

    const keyboardChoice = this.input.getChoicePressed();
    const clickedChoice = this.ui.getClickedUpgradeChoice(this.input);
    const choiceIndex = clickedChoice >= 0 ? clickedChoice : keyboardChoice;

    if (choiceIndex >= 0 && this.levelUpChoices[choiceIndex]) {
      this.chooseUpgrade(choiceIndex);
    }
  }

  updatePaused() {
    this.syncGodMode();

    if (this.debugEnabled && this.debugChat.update(this, this.input)) {
      return;
    }

    if (this.input.wasPauseJustPressed()) {
      if (this.pauseMenu.page === "main") {
        this.resumeFromPause();
      } else {
        this.pauseMenu.page = "main";
      }

      return;
    }

    const action = this.pauseMenu.update(this.input, this, this.shop);

    if (action === "resume") {
      this.resumeFromPause();
      return;
    }

    if (action === "bureau") {
      this.pauseMenu.page = "bureau";
      return;
    }

    if (action === "profile") {
      this.pauseMenu.page = "charInfo";
      return;
    }

    if (action === "abandon") {
      this.abandonRun();
    }
  }

  openPause() {
    if (this.state !== "playing" || this.player.isDead) {
      return false;
    }

    this.pauseMenu.reset();
    this.state = "paused";
    return true;
  }

  resumeFromPause() {
    this.pauseMenu.reset();
    this.state = "playing";
  }

  abandonRun() {
    this.finalLevel = this.player.level;
    this.saveData.totalCoins += this.coins;
    this.saveSystem.save(this.saveData);
    this.pauseMenu.reset();
    this.resetRun();
    this.state = "shop";
  }

  tryOpenPauseFromInput() {
    if (this.ui.consumePauseClick(this.input) || this.input.wasPauseJustPressed()) {
      return this.openPause();
    }

    return false;
  }

  updateChestReward(deltaTime) {
    this.feedback.update(deltaTime);
    this.chestAnimation.time += deltaTime;

    const animationConfig = GameConfig.chests.animation;
    const canContinue = this.chestAnimation.time >= animationConfig.revealDelay + 0.12;

    if (
      canContinue &&
      (this.input.wasActionJustPressed() || this.ui.consumeChestContinueClick(this.input))
    ) {
      this.chestRewardSystem.applyReward(this, this.chestReward);
      this.chestReward = null;
      this.chestAnimation = null;
      this.state = "playing";
      this.processLevelUps();
    }
  }

  update(deltaTime) {
    this.syncGodMode();

    if (this.debugEnabled && this.debugChat.update(this, this.input)) {
      return;
    }

    if (this.tryOpenPauseFromInput()) {
      return;
    }

    const step = deltaTime * this.timeScale;

    this.survivalTime += step;
    this.updateScreenShake(step);
    this.feedback.update(step);

    // Player mechanics: mouse/touch aim, dash (Shift/Space), manual Ink Flick (left click / touch action).
    const aim = this.input.getWorldAimDirection(this.player.position, this.camera);
    this.player.aimDirection = aim.direction;

    if (this.input.wasDashJustPressed()) {
      this.player.tryDash(this.input);
    }

    this.player.update(step, this.input);

    if (this.input.consumeManualShootClick()) {
      this.weaponSystem.fireManualInkFlick(this, this.player.aimDirection);
    }

    if (this.input.consumeTouchAttackPress()) {
      this.weaponSystem.fireManualInkFlick(this, this.player.aimDirection);
    }

    this.worldMap.clampPosition(this.player.position);
    this.camera.follow(this.player.position);
    this.spawner.update(step, this);

    for (const enemy of this.enemies) {
      enemy.update(step, this.player, this);
    }

    this.traitSystem.update(step, this);
    this.synergySystem.update(step);
    this.hazardSystem.update(step, this);

    for (const projectile of this.projectiles) {
      projectile.update(step);

      if (isOffScreen(projectile.position, this.camera, this.width, this.height)) {
        projectile.isDead = true;
      }
    }

    for (const damageNumber of this.damageNumbers) {
      damageNumber.update(step);
    }

    for (const xpGem of this.xpGems) {
      xpGem.update(step, this.player, this);
    }

    for (const coinPickup of this.coinPickups) {
      coinPickup.update(step, this.player, this);
    }

    for (const chest of this.chests) {
      chest.update(step);
    }

    this.collisionSystem.prepareFrame(this.enemies);
    this.weaponSystem.update(step, this);
    this.collisionSystem.update(step, this);
    this.removeDeadEntities();
    this.processLevelUps();

    const currentWorld = this.spawner.getWaveDirector().getCurrentWorld(this.survivalTime);
    this.biomeAmbience.update(step, this.camera, currentWorld);
  }

  applyWorldTheme(currentWorld) {
    if (typeof this.worldMap.applyWorld === "function") {
      this.worldMap.applyWorld(currentWorld);
      return;
    }

    const paletteId = currentWorld?.tilePalette ?? "castleCourtyard";
    this.worldMap.setTilePalette(paletteId);

    if (currentWorld?.id) {
      this.worldMap.activeWorldId = currentWorld.id;
    }

    if (currentWorld?.decorationTypes?.length > 0) {
      this.worldMap.activeDecorationTypes = currentWorld.decorationTypes;
    }
  }

  render() {
    this.renderer.clear();

    if (this.state === "menu") {
      this.menu.draw(this.input);
      this.ui.drawAudioControls(this.feedback.isMuted(), this.feedback.getVolume());
      this.input.drawTouchControls(this.context, this.state);
      return;
    }

    if (this.state === "shop") {
      this.shop.draw(this.input, this.saveData, this.metaUpgradeSystem);
      this.ui.drawAudioControls(this.feedback.isMuted(), this.feedback.getVolume());
      this.input.drawTouchControls(this.context, this.state);
      return;
    }

    const isGameplayView =
      this.state === "playing" ||
      this.state === "paused" ||
      this.state === "levelUp" ||
      this.state === "chestReward" ||
      this.state === "gameOver";

    if (!isGameplayView) {
      return;
    }
    this.renderer.setShake(this.screenShake);
    const currentWorld = this.spawner.getWaveDirector().getCurrentWorld(this.survivalTime);
    this.applyWorldTheme(currentWorld);
    this.renderer.drawBackground(this.camera, this.worldMap, currentWorld);
    this.biomeAmbience.draw(this.context, this.camera);
    this.renderer.drawWeaponEffects(this.weaponSystem, this.player, this.camera);
    this.renderer.drawProjectiles(this.projectiles, this.camera);
    this.renderer.drawXPGems(this.xpGems, this.camera);
    this.renderer.drawCoinPickups(this.coinPickups, this.camera);
    this.renderer.drawChests(this.chests, this.camera);
    this.renderer.drawHazards(this.hazardSystem.hazards, this.camera);
    this.renderer.drawEnemies(this.enemies, this.camera);
    this.renderer.drawEnemyProjectiles(this.hazardSystem.projectiles, this.camera);
    this.renderer.drawPlayer(this.player, this.camera);
    if (this.state === "playing") {
      this.renderer.drawAimIndicator(
        this.player,
        this.camera,
        this.player.aimDirection,
        this.input.isMouseInCanvas(),
      );
    }
    this.renderer.drawParticles(this.feedback.particles, this.camera);
    this.renderer.drawDamageNumbers(this.damageNumbers, this.camera);
    this.renderer.drawBossHealthBar(this.enemies, this.width);
    this.renderer.resetTransform();
    this.ui.draw({
      title: GameIdentity.title,
      fps: this.fps,
      playerPosition: this.player.position,
      playerHealth: this.player.health,
      playerMaxHealth: this.player.maxHealth,
      killCount: this.killCount,
      survivalTime: this.survivalTime,
      enemyCount: this.enemies.length,
      finalLevel: this.finalLevel,
      playerLevel: this.player.level,
      playerXP: this.player.xp,
      playerXPToNextLevel: this.player.xpToNextLevel,
      weapons: this.weaponSystem.getOwnedWeaponSummary(),
      passives: this.passiveSystem.getOwnedPassiveSummary(),
      coins: this.coins,
      wave: this.spawner.getWaveDirector().getDisplayInfo(this.survivalTime),
      waveAnnouncement:
        this.spawner.getBossDirector().getAnnouncement() ??
        this.spawner.getWaveDirector().getAnnouncement(),
      muted: this.feedback.isMuted(),
      volume: this.feedback.getVolume(),
      lowHealthPulse: this.feedback.getLowHealthPulse(),
      dashCooldownProgress: this.player.getDashCooldownProgress(),
      manualShotCooldownProgress: this.weaponSystem.getManualShotCooldownProgress(),
      projectileCount: this.projectiles.length,
      particleCount: this.feedback.particles.particles.length,
      pickupCount: this.xpGems.length + this.coinPickups.length,
      showPauseButton: this.state === "playing",
    });

    if (this.state === "levelUp") {
      this.ui.drawLevelUp(this.levelUpChoices);
    }

    if (this.state === "chestReward") {
      this.ui.drawChestReward(this.chestReward, this.chestAnimation);
    }

    if (this.state === "gameOver") {
      this.ui.drawGameOver(this.runSummary, this.leaderboardView);
    }

    if (this.state === "paused") {
      this.pauseMenu.draw(this.input, this, this.shop);
    }

    this.renderer.drawLowHealthOverlay(
      this.player.health,
      this.player.maxHealth,
      this.feedback.getLowHealthPulse(),
    );
    if (this.debugEnabled) {
      this.debugChat.draw(this);
    }
    this.input.drawTouchControls(this.context, this.state);
  }

  removeDeadEntities() {
    removeDeadInPlace(this.enemies);
    removeDeadInPlace(this.projectiles, (projectile) => this.projectilePool.release(projectile));
    removeDeadInPlace(this.damageNumbers);
    removeDeadInPlace(this.xpGems);
    removeDeadInPlace(this.coinPickups);
    removeDeadInPlace(this.chests);
  }

  resetRun() {
    const keepGodMode = this.debugEnabled && this.godMode;
    const keepTimeScale = keepGodMode ? this.timeScale : 1;
    this.survivalTime = 0;
    this.killCount = 0;
    this.bossDefeatedCount = 0;
    this.runEvolutions = [];
    this.startingCoinBonus = 0;
    this.finalLevel = 1;
    this.runModifiers = {
      damageMultiplier: 1,
      xpMultiplier: 1,
      moveSpeedMultiplier: 1,
      pickupRangeMultiplier: 1,
    };
    this.screenShake = { amount: 0, time: 0, duration: 0 };
    this.feedback.clearRunEffects();
    this.player = new Player(0, 0, this.saveData.selectedCharacter ?? "puzas");
    this.enemies = [];
    this.projectiles = [];
    this.damageNumbers = [];
    this.xpGems = [];
    this.coinPickups = [];
    this.chests = [];
    this.coins = 0;
    this.levelUpChoices = [];
    this.chestReward = null;
    this.chestAnimation = null;
    this.runSummary = null;
    this.godMode = keepGodMode;
    this.timeScale = keepGodMode ? keepTimeScale : 1;
    this.spawner = new Spawner(this.camera);
    this.weaponSystem = new WeaponSystem();
    this.passiveSystem = new PassiveSystem();
    this.collisionSystem = new CollisionSystem();
    this.upgradeSystem = new UpgradeSystem();
    this.chestRewardSystem = new ChestRewardSystem();
    this.traitSystem = new TraitSystem();
    this.synergySystem = new SynergySystem();
    this.hazardSystem = new HazardSystem();
    this.metaUpgradeSystem.applyToRun(this);
    applyCharacterToRun(this);
    this.camera.follow(this.player.position);
    this.syncGodMode();
  }

  killPlayerByDebug() {
    if (!this.debugEnabled || this.state !== "playing") {
      return;
    }

    this.godMode = false;
    this.timeScale = 1;
    this.syncGodMode();
    this.player.godMode = false;
    this.player.invincibilityTime = 0;
    this.player.health = 0;
    this.player.isDead = true;
    this.endRun();
  }

  setGodMode(enabled, timeScale = 1) {
    if (!this.debugEnabled) {
      return;
    }

    this.godMode = Boolean(enabled);
    this.timeScale = enabled ? timeScale : 1;
    this.syncGodMode();
  }

  syncGodMode() {
    applyGodModeToPlayer(this);
  }

  startRun() {
    this.feedback.ensureAudio();
    this.pauseMenu.reset();
    this.resetRun();
    this.state = "playing";
  }

  openChest(chest) {
    if (this.state !== "playing" || this.player.isDead) {
      return;
    }

    // Blood Price trait: stronger rewards, but opening costs HP unless already low.
    const bloodPrice = this.traitSystem?.hasBloodPrice() ?? false;

    if (bloodPrice && this.player.health > this.player.maxHealth * 0.35) {
      const cost = Math.round(this.player.maxHealth * 0.12);
      this.player.health = Math.max(1, this.player.health - cost);
    }

    this.chestReward = this.chestRewardSystem.rollReward(this, { bloodPrice });
    this.chestAnimation = { time: 0 };
    this.feedback.onChestOpen();
    this.state = "chestReward";
  }

  endRun() {
    if (this.state === "gameOver" || this.godMode) {
      return;
    }

    this.finalLevel = this.player.level;
    this.saveData.totalCoins += this.coins;
    this.saveSystem.save(this.saveData);

    const weapons = this.weaponSystem.getOwnedWeaponSummary().map((weapon) => weapon.name);

    this.runSummary = {
      survivalTime: this.survivalTime,
      finalLevel: this.finalLevel,
      killCount: this.killCount,
      bossDefeatedCount: this.bossDefeatedCount,
      coinsEarned: this.coins,
      startingCoinBonus: this.startingCoinBonus,
      totalCoins: this.saveData.totalCoins,
      weapons,
      evolutions: [...this.runEvolutions],
    };

    this.feedback.onGameOver();
    this.state = "gameOver";
    this.beginLeaderboardFlow();
  }

  createLeaderboardView() {
    const savedName = this.saveData?.settings?.playerName ?? "";

    return {
      configured: false,
      name: typeof savedName === "string" ? savedName : "",
      status: "",
      statusError: false,
      submitted: false,
      submitting: false,
      loading: false,
      loadError: false,
      entries: [],
    };
  }

  beginLeaderboardFlow() {
    this.leaderboardView = this.createLeaderboardView();
    this.leaderboardView.configured = this.leaderboard.isConfigured();

    if (!this.leaderboardView.configured) {
      this.leaderboardView.status = "Leaderboard not configured yet";
      return;
    }

    this.startNameCapture();
    this.refreshLeaderboard();
  }

  startNameCapture() {
    if (this.nameCaptureHandler) {
      return;
    }

    this.nameCaptureHandler = (event) => this.handleNameKey(event);
    window.addEventListener("keydown", this.nameCaptureHandler, true);
  }

  stopNameCapture() {
    if (!this.nameCaptureHandler) {
      return;
    }

    window.removeEventListener("keydown", this.nameCaptureHandler, true);
    this.nameCaptureHandler = null;
  }

  handleNameKey(event) {
    if (this.state !== "gameOver" || this.leaderboardView.submitted) {
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();
      this.submitLeaderboardScore();
      return;
    }

    if (event.key === "Backspace") {
      event.preventDefault();
      event.stopPropagation();
      this.leaderboardView.name = this.leaderboardView.name.slice(0, -1);
      return;
    }

    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      event.stopPropagation();

      if (this.leaderboardView.name.length < 12) {
        this.leaderboardView.name += event.key;
      }
    }
  }

  async refreshLeaderboard() {
    const view = this.leaderboardView;
    view.loading = true;
    view.loadError = false;

    const result = await this.leaderboard.getTopScores(10);

    if (this.leaderboardView !== view) {
      return;
    }

    view.loading = false;

    if (result.ok) {
      view.entries = result.scores;
    } else if (result.reason !== "not_configured") {
      view.loadError = true;
    }
  }

  async submitLeaderboardScore() {
    const view = this.leaderboardView;

    if (!view.configured || view.submitting || view.submitted || !this.runSummary) {
      return;
    }

    const score = this.leaderboard.buildScoreRow(this.runSummary, view.name);

    if (!this.leaderboard.validateScore(score)) {
      view.status = "Survive at least 10s to submit";
      view.statusError = true;
      return;
    }

    view.submitting = true;
    view.status = "Submitting...";
    view.statusError = false;

    // Persist the cleaned name so it is remembered next time.
    this.saveData.settings = { ...this.saveData.settings, playerName: score.player_name };
    this.saveSystem.save(this.saveData);

    const result = await this.leaderboard.submitScore(score);

    if (this.leaderboardView !== view) {
      return;
    }

    view.submitting = false;

    if (result.ok) {
      view.submitted = true;
      view.name = score.player_name;
      view.status = "Score submitted!";
      view.statusError = false;
      this.stopNameCapture();
      this.refreshLeaderboard();
    } else {
      view.status = "Could not submit score";
      view.statusError = true;
    }
  }

  processLevelUps() {
    if (this.state !== "playing" || this.player.isDead) {
      return;
    }

    while (this.player.canLevelUp()) {
      this.player.levelUpOnce();
      this.finalLevel = this.player.level;
      this.levelUpChoices = this.upgradeSystem.getChoices(3, this);
      this.ui.layoutUpgradeChoiceCards(this.levelUpChoices);
      this.feedback.onLevelUp();
      this.state = "levelUp";
      return;
    }
  }

  chooseUpgrade(choiceIndex) {
    const choice = this.levelUpChoices[choiceIndex];

    if (!choice || this.state !== "levelUp" || this.player.isDead) {
      return;
    }

    this.upgradeSystem.applyUpgrade(this, choice);
    this.levelUpChoices = [];

    if (this.player.canLevelUp()) {
      this.processLevelUps();
      return;
    }

    this.state = "playing";
  }

  startScreenShake(amount, duration) {
    this.screenShake.amount = amount;
    this.screenShake.duration = duration;
    this.screenShake.time = duration;
  }

  updateScreenShake(deltaTime) {
    this.screenShake.time = Math.max(0, this.screenShake.time - deltaTime);
  }

  updateFPS(deltaTime) {
    if (deltaTime <= 0) {
      return;
    }

    const currentFPS = 1 / deltaTime;
    this.fps = this.fps * this.frameSmoothing + currentFPS * (1 - this.frameSmoothing);
  }
}

function showRuntimeError(error) {
  const shell = document.querySelector("#game-shell");

  if (!shell) {
    return;
  }

  shell.innerHTML = `
    <div style="max-width:720px;padding:32px;text-align:center;font-family:monospace;">
      <h1 style="color:#ffe09a;margin:0 0 16px;">${GameIdentity.title} crashed</h1>
      <p style="color:#d9e8e2;line-height:1.6;">Reload the page to try again.</p>
      <pre style="margin-top:20px;padding:16px;background:rgba(0,0,0,0.35);color:#ff9a9a;text-align:left;overflow:auto;">${error?.stack ?? error?.message ?? error}</pre>
    </div>
  `;
}
