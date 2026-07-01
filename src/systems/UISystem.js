import { clamp, formatTime } from "../core/MathUtils.js";
import { GameConfig } from "../config/GameConfig.js";
import { GameIdentity } from "../config/GameIdentity.js";
import {
  UITheme,
  drawButton as drawThemeButton,
  drawPanel,
  drawProgressBar,
  drawTextShadow,
  drawTextOutline,
  drawWrappedText as wrapThemeText,
  getRarityColor,
} from "../config/UITheme.js";

export class UISystem {
  constructor(context, width, height) {
    this.context = context;
    this.width = width;
    this.height = height;
    this.upgradeChoiceCards = [];
    this.chestContinueButton = null;
    this.gameOverShopButton = null;
    this.gameOverRestartButton = null;
    this.gameOverSubmitButton = null;
    this.pauseButton = {
      x: width - 164,
      y: 28,
      width: 60,
      height: 44,
    };
    this.muteButton = {
      x: width - 92,
      y: height - 72,
      width: 60,
      height: 44,
    };
    this.volumeSlider = {
      x: width - 410,
      y: height - 72,
      width: 230,
      height: 44,
    };
    this.volumeDragging = false;
    this.playerStatusCard = {
      x: 28,
      y: 28,
      width: 260,
      height: 108,
    };
    this.showPerfStats = false;
  }

  draw({
    title,
    fps,
    playerPosition,
    playerHealth,
    playerMaxHealth,
    killCount,
    survivalTime,
    enemyCount,
    playerLevel,
    playerXP,
    playerXPToNextLevel,
    weapons = [],
    passives = [],
    coins = 0,
    wave = null,
    waveAnnouncement = null,
    muted = false,
    volume = 1,
    lowHealthPulse = 0,
    dashCooldownProgress = 1,
    manualShotCooldownProgress = 1,
    projectileCount = 0,
    particleCount = 0,
    pickupCount = 0,
    showPauseButton = true,
    showPerfStats = false,
  }) {
    const ctx = this.context;

    ctx.save();
    ctx.textBaseline = "top";

    this.drawPlayerStatusCard({
      playerHealth,
      playerMaxHealth,
      survivalTime,
      killCount,
      coins,
    });
    this.drawLoadoutPanel(weapons, passives);
    this.drawWaveInfo(wave);
    this.drawWaveAnnouncement(waveAnnouncement);
    this.drawXPBar(playerLevel, playerXP, playerXPToNextLevel);
    this.drawAbilityCooldowns(dashCooldownProgress, manualShotCooldownProgress);
    if (showPauseButton) {
      this.drawPauseButton();
    }
    this.drawAudioControls(muted, volume);
    if (showPerfStats) {
      this.drawPerfStats({
        fps,
        enemyCount,
        projectileCount,
        particleCount,
        pickupCount,
      });
    }
    ctx.restore();
  }

  drawPlayerStatusCard({ playerHealth, playerMaxHealth, survivalTime, killCount, coins }) {
    const ctx = this.context;
    const card = this.playerStatusCard;
    const pad = UITheme.spacing.panelPad;
    const barY = card.y + pad;
    const barWidth = card.width - pad * 2;
    const barHeight = 20;
    const statsY = barY + barHeight + 12;

    drawPanel(ctx, card.x, card.y, card.width, card.height, {
      fillStyle: UITheme.colors.panelBgHud,
      borderWidth: 1.5,
    });

    const hpPercent = playerMaxHealth > 0 ? playerHealth / playerMaxHealth : 0;
    drawProgressBar(
      ctx,
      card.x + pad,
      barY,
      barWidth,
      barHeight,
      hpPercent,
      {
        fillColor: hpPercent > 0.35 ? UITheme.colors.hpMid : UITheme.colors.hpLow,
        label: `HP ${Math.ceil(playerHealth)} / ${playerMaxHealth}`,
        fontStyle: UITheme.fonts.label,
      },
    );

    ctx.font = UITheme.fonts.hud;
    ctx.fillStyle = UITheme.colors.textSecondary;
    ctx.fillText(`Time ${formatTime(survivalTime)}`, card.x + pad, statsY);

    ctx.fillText(`Kills ${killCount}`, card.x + pad, statsY + 22);
    ctx.textAlign = "right";
    ctx.fillStyle = UITheme.colors.accent;
    ctx.fillText(`${GameIdentity.memoryCoinLabel} ${coins}`, card.x + card.width - pad, statsY + 22);
    ctx.textAlign = "left";
  }

  drawPerfStats({ fps, enemyCount, projectileCount, particleCount, pickupCount }) {
    const ctx = this.context;
    const card = this.playerStatusCard;
    const panelX = card.x;
    const panelY = card.y + card.height + 10;
    const panelWidth = card.width;
    const panelHeight = 96;

    drawPanel(ctx, panelX, panelY, panelWidth, panelHeight, {
      fillStyle: "rgba(8, 10, 14, 0.65)",
      borderWidth: 1,
      cornerAccent: false,
    });

    ctx.font = UITheme.fonts.debug;
    ctx.fillStyle = UITheme.colors.debug;
    ctx.fillText("DEBUG", panelX + 10, panelY + 8);
    ctx.fillStyle = UITheme.colors.textMuted;
    ctx.fillText(`FPS ${Math.round(fps)}`, panelX + 10, panelY + 28);
    ctx.fillText(`Enemies ${enemyCount}`, panelX + 10, panelY + 46);
    ctx.fillText(`Proj ${projectileCount}`, panelX + 10, panelY + 64);
    ctx.fillText(`Fx ${particleCount}`, panelX + 120, panelY + 28);
    ctx.fillText(`Pick ${pickupCount}`, panelX + 120, panelY + 46);
  }

  drawPauseButton() {
    const ctx = this.context;
    const button = this.pauseButton;

    drawPanel(ctx, button.x, button.y, button.width, button.height, {
      fillStyle: UITheme.colors.panelBgHud,
      borderWidth: 1.5,
      cornerAccent: false,
    });

    ctx.fillStyle = UITheme.colors.textPrimary;
    ctx.font = UITheme.fonts.subheading;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("☰", button.x + button.width / 2, button.y + button.height / 2 + 1);
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
  }

  consumePauseClick(input) {
    return input.consumeUiClick(this.pauseButton);
  }

  drawAudioControls(muted, volume) {
    this.drawVolumeSlider(volume);
    this.drawMuteButton(muted);
  }

  getVolumeTrackBounds() {
    const slider = this.volumeSlider;

    return {
      left: slider.x + 46,
      right: slider.x + slider.width - 14,
      centerY: slider.y + slider.height / 2,
    };
  }

  volumeFromX(x) {
    const track = this.getVolumeTrackBounds();
    const span = track.right - track.left;

    if (span <= 0) {
      return 0;
    }

    return clamp((x - track.left) / span, 0, 1);
  }

  drawVolumeSlider(volume) {
    const ctx = this.context;
    const slider = this.volumeSlider;
    const track = this.getVolumeTrackBounds();
    const level = clamp(volume, 0, 1);

    drawPanel(ctx, slider.x, slider.y, slider.width, slider.height, {
      fillStyle: UITheme.colors.panelBgHud,
      borderWidth: 1.5,
      cornerAccent: false,
    });

    ctx.fillStyle = UITheme.colors.textPrimary;
    ctx.font = UITheme.fonts.label;
    ctx.fillText("VOL", slider.x + 12, slider.y + 13);

    ctx.strokeStyle = "rgba(255, 222, 161, 0.35)";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(track.left, track.centerY);
    ctx.lineTo(track.right, track.centerY);
    ctx.stroke();

    const fillWidth = (track.right - track.left) * level;
    ctx.strokeStyle = "rgba(255, 222, 161, 0.85)";
    ctx.beginPath();
    ctx.moveTo(track.left, track.centerY);
    ctx.lineTo(track.left + fillWidth, track.centerY);
    ctx.stroke();

    const knobX = track.left + fillWidth;
    ctx.fillStyle = UITheme.colors.textPrimary;
    ctx.beginPath();
    ctx.arc(knobX, track.centerY, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 222, 161, 0.32)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  handleVolumeSlider(input, currentVolume, onVolumeChange) {
    const onSlider = input.isMouseOver(this.volumeSlider);

    if (input.isPointerHeld()) {
      if (!this.volumeDragging && onSlider) {
        this.volumeDragging = true;
        input.consumeClick();
      }

      if (this.volumeDragging) {
        const nextVolume = this.volumeFromX(input.mousePosition.x);

        if (Math.abs(nextVolume - currentVolume) >= 0.005) {
          onVolumeChange(nextVolume);
        }
      }

      return;
    }

    this.volumeDragging = false;
  }

  drawMuteButton(muted) {
    const ctx = this.context;
    const button = this.muteButton;

    drawPanel(ctx, button.x, button.y, button.width, button.height, {
      fillStyle: UITheme.colors.panelBgHud,
      borderWidth: 1.5,
      cornerAccent: false,
    });

    ctx.fillStyle = UITheme.colors.textPrimary;
    ctx.font = UITheme.fonts.subheading;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(muted ? "🔇" : "🔊", button.x + button.width / 2, button.y + button.height / 2 + 1);
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
  }

  consumeMuteClick(input) {
    return input.consumeUiClick(this.muteButton);
  }

  drawLoadoutPanel(weapons, passives) {
    const ctx = this.context;
    const panelX = this.width - 348;
    const panelY = 28;
    const panelWidth = 316;
    const rowHeight = 28;
    const headerHeight = 32;
    const sectionGap = 14;
    const weaponsHeight = headerHeight + weapons.length * rowHeight;
    const passivesHeight = passives.length > 0 ? headerHeight + passives.length * rowHeight : 0;
    const panelHeight = weaponsHeight + (passives.length > 0 ? sectionGap + passivesHeight : 0) + 12;

    drawPanel(ctx, panelX, panelY, panelWidth, panelHeight, {
      fillStyle: UITheme.colors.panelBgHud,
      borderWidth: 1.5,
    });

    let rowY = panelY + 12;
    ctx.fillStyle = UITheme.colors.textPrimary;
    ctx.font = UITheme.fonts.subheading;
    ctx.fillText("Tools", panelX + 16, rowY);
    rowY += 26;
    rowY = this.drawLoadoutRows(panelX, panelWidth, rowY, weapons);

    if (passives.length > 0) {
      rowY += sectionGap;
      ctx.fillStyle = UITheme.colors.textPrimary;
      ctx.font = UITheme.fonts.subheading;
      ctx.fillText("Relics", panelX + 16, rowY);
      rowY += 26;
      this.drawLoadoutRows(panelX, panelWidth, rowY, passives);
    }
  }

  drawLoadoutRows(panelX, panelWidth, startY, items) {
    const ctx = this.context;
    let rowY = startY;
    ctx.font = UITheme.fonts.bodySmall;

    for (const item of items) {
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(panelX + 24, rowY + 9, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = item.isEvolved ? item.color : UITheme.colors.textSecondary;
      const name = item.name.length > 16 ? `${item.name.slice(0, 15)}…` : item.name;
      ctx.fillText(name, panelX + 36, rowY);

      let levelText;
      let levelColor;

      if (item.isEvolved) {
        levelText = "EVO";
        levelColor = item.color ?? UITheme.colors.accent;
      } else if (item.isMaxLevel) {
        levelText = "MAX";
        levelColor = UITheme.colors.accent;
      } else {
        levelText = `Lv${item.level}`;
        levelColor = UITheme.colors.textMuted;
      }

      ctx.font = UITheme.fonts.label;
      const levelWidth = ctx.measureText(levelText).width;
      ctx.fillStyle = levelColor;
      ctx.fillText(levelText, panelX + panelWidth - levelWidth - 14, rowY + 1);
      ctx.font = UITheme.fonts.bodySmall;
      rowY += 28;
    }

    return rowY;
  }

  drawWaveInfo(wave) {
    if (!wave) {
      return;
    }

    const ctx = this.context;
    const title = wave.waveName ?? "";
    const subtitle = `Minute ${wave.minute ?? 1}${wave.worldSubtitle ? ` · ${wave.worldSubtitle}` : ""}`;

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.font = UITheme.fonts.subheading;
    drawTextOutline(ctx, title, this.width / 2, 28, {
      fillStyle: UITheme.colors.accent,
      lineWidth: 2,
      align: "center",
    });
    ctx.font = UITheme.fonts.bodySmall;
    drawTextShadow(ctx, subtitle, this.width / 2, 56, {
      fillStyle: UITheme.colors.textMuted,
      shadowX: 1,
      shadowY: 1,
      align: "center",
    });
    ctx.restore();
  }

  drawWaveAnnouncement(announcement) {
    if (!announcement) {
      return;
    }

    const ctx = this.context;
    const centerX = this.width / 2;
    const fade = announcement.alpha ?? 1;

    ctx.save();
    ctx.globalAlpha = fade;

    drawPanel(ctx, centerX - 480, 78, 960, 108, {
      fillStyle: UITheme.colors.panelBg,
      borderColor: UITheme.colors.borderSoft,
      borderWidth: 2,
    });

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = UITheme.fonts.titleMedium;
    drawTextOutline(ctx, announcement.title ?? announcement.text ?? "", centerX, 118, {
      fillStyle: UITheme.colors.accent,
      lineWidth: 3,
      align: "center",
      baseline: "middle",
    });

    if (announcement.worldName) {
      ctx.font = UITheme.fonts.heading;
      drawTextShadow(ctx, announcement.worldName, centerX, 152, {
        fillStyle: UITheme.colors.textPrimary,
        align: "center",
        baseline: "middle",
      });
    }

    if (announcement.subtitle) {
      ctx.font = UITheme.fonts.body;
      drawTextShadow(ctx, announcement.subtitle, centerX, 178, {
        fillStyle: UITheme.colors.textMuted,
        align: "center",
        baseline: "middle",
      });
    }

    ctx.restore();
  }

  drawPlayerHealthBar(current, max, x, y, width, height) {
    const percent = clamp(current / max, 0, 1);

    drawProgressBar(this.context, x, y, width, height, percent, {
      fillColor: percent > 0.35 ? UITheme.colors.hpMid : UITheme.colors.hpLow,
      label: `HP ${Math.ceil(current)} / ${max}`,
      fontStyle: UITheme.fonts.label,
    });
  }

  drawXPBar(level, xp, xpToNextLevel) {
    const ctx = this.context;
    const x = 420;
    const y = this.height - 52;
    const width = this.width - 840;
    const height = 22;
    const percent = xpToNextLevel > 0 ? xp / xpToNextLevel : 0;
    const label = `LEVEL ${level}  ·  SHARDS ${xp} / ${xpToNextLevel}`;

    drawPanel(ctx, x - 6, y - 6, width + 12, height + 12, {
      fillStyle: UITheme.colors.panelBgHud,
      borderWidth: 1.5,
      cornerAccent: false,
    });

    drawProgressBar(ctx, x, y, width, height, percent, {
      trackColor: "#17243a",
      fillColor: UITheme.colors.xp,
      label: "",
    });

    ctx.textAlign = "center";
    ctx.font = UITheme.fonts.subheading;
    drawTextShadow(ctx, label, this.width / 2, y - 28, {
      fillStyle: UITheme.colors.textPrimary,
      align: "center",
    });
    ctx.textAlign = "left";
  }

  drawAbilityCooldowns(dashProgress, manualShotProgress) {
    const ctx = this.context;
    const centerX = this.width / 2;
    const y = this.height - 96;
    const slotWidth = 88;
    const slotHeight = 10;
    const gap = 24;

    this.drawCooldownSlot(ctx, centerX - slotWidth - gap / 2, y, slotWidth, slotHeight, dashProgress, "DASH");
    this.drawCooldownSlot(
      ctx,
      centerX + gap / 2,
      y,
      slotWidth,
      slotHeight,
      manualShotProgress,
      "AIM",
    );
  }

  drawCooldownSlot(ctx, x, y, width, height, progress, label) {
    drawPanel(ctx, x - 4, y - 20, width + 8, height + 24, {
      fillStyle: "rgba(8, 10, 14, 0.55)",
      borderWidth: 1,
      cornerAccent: false,
    });

    drawProgressBar(ctx, x, y, width, height, progress, {
      trackColor: "#17243a",
      fillColor: progress >= 1 ? UITheme.colors.success : UITheme.colors.accent,
      label: "",
      shine: false,
    });

    ctx.font = UITheme.fonts.hudSmall;
    ctx.fillStyle = UITheme.colors.textMuted;
    ctx.textAlign = "center";
    ctx.fillText(label, x + width / 2, y - 14);
    ctx.textAlign = "left";
  }

  drawLevelUp(choices) {
    this.layoutUpgradeChoiceCards(choices);

    const ctx = this.context;
    const panelX = this.width / 2 - 650;
    const panelY = this.height / 2 - 300;

    ctx.save();
    ctx.fillStyle = UITheme.colors.overlay;
    ctx.fillRect(0, 0, this.width, this.height);

    drawPanel(ctx, panelX, panelY, 1300, 600, {
      fillStyle: UITheme.colors.panelBg,
      borderColor: UITheme.colors.border,
      borderWidth: 3,
    });

    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.font = UITheme.fonts.title;
    drawTextShadow(ctx, "INSIGHT GAINED", this.width / 2, panelY + 42, {
      fillStyle: UITheme.colors.textPrimary,
      align: "center",
    });

    ctx.font = UITheme.fonts.body;
    ctx.fillStyle = UITheme.colors.textSecondary;
    ctx.fillText("Choose one insight", this.width / 2, panelY + 112);

    choices.forEach((choice, index) => {
      this.drawUpgradeCard(choice, this.upgradeChoiceCards[index], index);
    });

    ctx.restore();
  }

  layoutUpgradeChoiceCards(choices) {
    const panelX = this.width / 2 - 650;
    const panelY = this.height / 2 - 300;
    const cardWidth = 390;
    const cardHeight = 360;
    const gap = 34;

    this.upgradeChoiceCards = choices.map((_, index) => ({
      x: panelX + 34 + index * (cardWidth + gap),
      y: panelY + 170,
      width: cardWidth,
      height: cardHeight,
    }));
  }

  drawUpgradeCard(choice, card, index) {
    const ctx = this.context;
    const rankText = getUpgradeRankText(choice);
    const categoryText = getUpgradeCategoryText(choice);
    const accentColor = getUpgradeAccentColor(choice);
    const isSpecial = choice.type === "trait" || choice.type === "synergy";

    drawPanel(ctx, card.x, card.y, card.width, card.height, {
      fillStyle: UITheme.colors.panelBgLight,
      borderColor: accentColor,
      borderWidth: isSpecial ? 3 : 2,
    });

    ctx.fillStyle = UITheme.colors.buttonInner;
    ctx.fillRect(card.x + 18, card.y + 18, 58, 58);
    ctx.strokeStyle = UITheme.colors.border;
    ctx.lineWidth = 2;
    ctx.strokeRect(card.x + 18, card.y + 18, 58, 58);

    ctx.textAlign = "center";
    ctx.font = UITheme.fonts.heading;
    drawTextShadow(ctx, String(index + 1), card.x + 47, card.y + 24, {
      fillStyle: UITheme.colors.textPrimary,
      align: "center",
    });

    ctx.textAlign = "left";
    ctx.font = UITheme.fonts.label;
    ctx.fillStyle = isSpecial ? accentColor : UITheme.colors.textMuted;
    ctx.fillText(categoryText, card.x + 96, card.y + 22);

    ctx.fillStyle = UITheme.colors.textPrimary;
    ctx.font = UITheme.fonts.subheading;
    this.drawWrappedText(choice.name, card.x + 96, card.y + 44, card.width - 118, 28, 2);

    ctx.fillStyle = UITheme.colors.textSecondary;
    ctx.font = UITheme.fonts.body;
    this.drawWrappedText(choice.description, card.x + 30, card.y + 126, card.width - 60, 26, 4);

    ctx.fillStyle = UITheme.colors.accent;
    ctx.font = UITheme.fonts.bodySmall;
    this.drawWrappedText(rankText, card.x + 30, card.y + 286, card.width - 60, 22, 2);
    ctx.textAlign = "center";
  }

  drawWrappedText(text, x, y, maxWidth, lineHeight, maxLines = 8) {
    wrapThemeText(this.context, text, x, y, maxWidth, lineHeight, maxLines);
  }

  getClickedUpgradeChoice(input) {
    for (let index = 0; index < this.upgradeChoiceCards.length; index += 1) {
      if (input.consumeUiClick(this.upgradeChoiceCards[index])) {
        return index;
      }
    }

    return -1;
  }

  consumeChestContinueClick(input) {
    if (!this.chestContinueButton || !input.consumeClick()) {
      return false;
    }

    return input.isMouseOver(this.chestContinueButton);
  }

  drawChestReward(reward, animation) {
    if (!reward || !animation) {
      return;
    }

    const ctx = this.context;
    const animationConfig = GameConfig.chests.animation;
    const time = animation.time;
    const centerX = this.width / 2;
    const centerY = this.height / 2 - 40;
    const inShake = time < animationConfig.shakeDuration;
    const inBurst =
      time >= animationConfig.shakeDuration &&
      time < animationConfig.shakeDuration + animationConfig.burstDuration;
    const inReveal = time >= animationConfig.revealDelay;

    ctx.save();
    ctx.fillStyle = "rgba(5, 6, 9, 0.72)";
    ctx.fillRect(0, 0, this.width, this.height);

    if (inBurst || inReveal) {
      const burstProgress = inReveal
        ? 1
        : (time - animationConfig.shakeDuration) / animationConfig.burstDuration;
      const radius = 120 + burstProgress * (reward.isEvolution ? 560 : 420);
      const alpha = inReveal ? (reward.isEvolution ? 0.34 : 0.22) : 0.55 * (1 - burstProgress * 0.35);
      const burst = ctx.createRadialGradient(centerX, centerY + 40, 20, centerX, centerY + 40, radius);
      const accent = reward.accent ?? "#ffd27e";

      if (reward.isEvolution) {
        burst.addColorStop(0, `rgba(255, 244, 220, ${alpha})`);
        burst.addColorStop(0.25, `rgba(185, 140, 255, ${alpha * 0.85})`);
        burst.addColorStop(0.55, `rgba(255, 207, 115, ${alpha * 0.65})`);
        burst.addColorStop(1, "rgba(255, 140, 72, 0)");
      } else {
        burst.addColorStop(0, `rgba(255, 244, 220, ${alpha})`);
        burst.addColorStop(0.35, `rgba(255, 207, 115, ${alpha * 0.75})`);
        burst.addColorStop(1, "rgba(255, 140, 72, 0)");
      }

      ctx.fillStyle = burst;
      ctx.fillRect(0, 0, this.width, this.height);
    }

    const shakeX = inShake ? Math.sin(time * 48) * (8 + time * 10) : 0;
    const shakeY = inShake ? Math.cos(time * 62) * (4 + time * 6) : 0;
    const chestWidth = 180;
    const chestHeight = 150;
    const chestX = centerX - chestWidth / 2 + shakeX;
    const chestY = centerY - chestHeight / 2 + 40 + shakeY;

    ctx.fillStyle = "#6b3f22";
    ctx.fillRect(chestX, chestY + 52, chestWidth, 72);
    ctx.fillStyle = "#8f5528";
    ctx.fillRect(chestX, chestY + 52, chestWidth, 18);
    ctx.fillStyle = inReveal ? "#ffe09a" : "#ffd27e";
    ctx.fillRect(chestX - 8, chestY + 18, chestWidth + 16, 44);
    ctx.strokeStyle = "#fff4dc";
    ctx.lineWidth = 5;
    ctx.strokeRect(chestX - 8, chestY + 18, chestWidth + 16, 44);
    ctx.fillStyle = "#fff4dc";
    ctx.beginPath();
    ctx.arc(centerX + shakeX, chestY + 40 + shakeY, 14, 0, Math.PI * 2);
    ctx.fill();

    if (inReveal) {
      const panelX = centerX - 420;
      const panelY = centerY - 260;
      const panelWidth = 840;
      const panelHeight = reward.isEvolution ? 560 : 520;
      const accent = reward.accent ?? UITheme.colors.border;

      drawPanel(ctx, panelX, panelY, panelWidth, panelHeight, {
        fillStyle: reward.isEvolution ? "rgba(18, 12, 28, 0.97)" : UITheme.colors.panelBg,
        borderColor: accent,
        borderWidth: reward.isEvolution ? 4 : 3,
      });

      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.font = reward.isEvolution ? UITheme.fonts.title : UITheme.fonts.titleSmall;
      drawTextOutline(ctx, reward.isEvolution ? "TALE REWRITTEN!" : "CATALOG OPENED!", centerX, panelY + 36, {
        fillStyle: accent,
        align: "center",
      });

      ctx.font = UITheme.fonts.titleSmall;
      drawTextShadow(ctx, reward.title, centerX, panelY + 112, {
        fillStyle: UITheme.colors.textPrimary,
        align: "center",
      });

      const iconPulse = reward.isEvolution ? 1 + Math.sin(time * 10) * 0.08 : 1;
      ctx.save();
      ctx.translate(centerX, panelY + 224);
      ctx.scale(iconPulse, iconPulse);
      ctx.font = UITheme.fonts.title;
      drawTextOutline(ctx, reward.icon ?? "★", 0, 0, {
        fillStyle: accent,
        align: "center",
        baseline: "middle",
      });
      ctx.restore();

      ctx.font = UITheme.fonts.titleSmall;
      drawTextShadow(ctx, reward.name, centerX, panelY + (reward.isEvolution ? 268 : 252), {
        fillStyle: UITheme.colors.textPrimary,
        align: "center",
      });

      ctx.font = UITheme.fonts.heading;
      drawTextShadow(ctx, reward.headline, centerX, panelY + (reward.isEvolution ? 334 : 316), {
        fillStyle: UITheme.colors.accent,
        align: "center",
      });

      ctx.font = UITheme.fonts.body;
      ctx.fillStyle = UITheme.colors.textSecondary;
      this.drawWrappedText(
        reward.description,
        centerX - 320,
        panelY + (reward.isEvolution ? 392 : 372),
        640,
        26,
        4,
      );

      const buttonWidth = 520;
      const buttonHeight = 64;
      const buttonX = centerX - buttonWidth / 2;
      const buttonY = panelY + panelHeight - 92;
      this.chestContinueButton = {
        x: buttonX,
        y: buttonY,
        width: buttonWidth,
        height: buttonHeight,
        label: "SPACE OR CLICK TO CONTINUE",
      };

      drawThemeButton(ctx, this.chestContinueButton, {
        hovered: true,
        fontStyle: UITheme.fonts.button,
      });
    } else {
      this.chestContinueButton = null;
      ctx.textAlign = "center";
      ctx.font = UITheme.fonts.heading;
      drawTextShadow(ctx, "Unfolding catalog...", centerX, centerY + 150, {
        fillStyle: UITheme.colors.textPrimary,
        align: "center",
      });
    }

    ctx.restore();
  }

  consumeGameOverShopClick(input) {
    if (!this.gameOverShopButton || !input.consumeClick()) {
      return false;
    }

    return input.isMouseOver(this.gameOverShopButton);
  }

  consumeGameOverRestartClick(input) {
    if (!this.gameOverRestartButton || !input.consumeClick()) {
      return false;
    }

    return input.isMouseOver(this.gameOverRestartButton);
  }

  consumeGameOverSubmitClick(input) {
    if (!this.gameOverSubmitButton || !input.consumeClick()) {
      return false;
    }

    return input.isMouseOver(this.gameOverSubmitButton);
  }

  drawGameOver(summary, leaderboard = {}) {
    if (!summary) {
      return;
    }

    const ctx = this.context;
    const panelX = this.width / 2 - 520;
    const panelY = 72;
    const panelWidth = 1040;
    const panelHeight = 920;
    const centerX = this.width / 2;

    ctx.save();
    ctx.fillStyle = UITheme.colors.overlay;
    ctx.fillRect(0, 0, this.width, this.height);

    drawPanel(ctx, panelX, panelY, panelWidth, panelHeight, {
      fillStyle: UITheme.colors.panelBg,
      borderColor: UITheme.colors.border,
      borderWidth: 3,
    });

    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.font = UITheme.fonts.title;
    drawTextShadow(ctx, "PATROL ENDED", centerX, panelY + 24, {
      fillStyle: UITheme.colors.textPrimary,
      align: "center",
    });

    const leftX = panelX + 70;
    const rightX = panelX + panelWidth / 2 + 30;
    let rowY = panelY + 116;

    // --- Left column: run summary + loadout ---
    this.drawSummaryLine(leftX, rowY, `Survival Time: ${formatTime(summary.survivalTime)}`);
    rowY += 40;
    this.drawSummaryLine(leftX, rowY, `Level Reached: ${summary.finalLevel}`);
    rowY += 40;
    this.drawSummaryLine(leftX, rowY, `Unwritten Vanquished: ${summary.killCount}`);
    rowY += 40;
    this.drawSummaryLine(leftX, rowY, `Archivores Defeated: ${summary.bossDefeatedCount}`);
    rowY += 40;
    this.drawSummaryLine(leftX, rowY, `Memory Coins Earned: ${summary.coinsEarned}`);

    if (summary.startingCoinBonus > 0) {
      rowY += 40;
      this.drawSummaryLine(leftX, rowY, `Starting Bonus: +${summary.startingCoinBonus}`);
    }

    rowY += 40;
    this.drawSummaryLine(leftX, rowY, `Total Memory Coins: ${summary.totalCoins}`, UITheme.colors.accent);

    rowY += 56;
    ctx.textAlign = "left";
    ctx.fillStyle = UITheme.colors.textPrimary;
    ctx.font = UITheme.fonts.subheading;
    ctx.fillText("Tools Carried", leftX, rowY);
    rowY += 36;
    ctx.font = UITheme.fonts.body;
    ctx.fillStyle = UITheme.colors.textSecondary;

    if (summary.weapons.length === 0) {
      ctx.fillText("None", leftX, rowY);
      rowY += 30;
    } else {
      for (const weaponName of summary.weapons) {
        ctx.fillText(`• ${weaponName}`, leftX, rowY);
        rowY += 30;
      }
    }

    rowY += 14;
    ctx.fillStyle = UITheme.colors.textPrimary;
    ctx.font = UITheme.fonts.subheading;
    ctx.fillText("Tales Rewritten", leftX, rowY);
    rowY += 36;
    ctx.font = UITheme.fonts.body;
    ctx.fillStyle = UITheme.colors.textSecondary;

    if (summary.evolutions.length === 0) {
      ctx.fillText("None this run", leftX, rowY);
    } else {
      for (const evolutionName of summary.evolutions) {
        ctx.fillText(`• ${evolutionName}`, leftX, rowY);
        rowY += 30;
      }
    }

    // --- Right column: leaderboard ---
    this.drawLeaderboardColumn(rightX, panelY + 116, panelX + panelWidth - 40, leaderboard);

    const shopButton = {
      x: centerX - 430,
      y: panelY + panelHeight - 100,
      width: 380,
      height: 68,
      label: "BACK TO BUREAU",
    };
    const restartButton = {
      x: centerX + 50,
      y: panelY + panelHeight - 100,
      width: 380,
      height: 68,
      label: "PLAY AGAIN",
    };

    this.gameOverShopButton = shopButton;
    this.gameOverRestartButton = restartButton;

    this.drawSummaryActionButton(shopButton, true);
    this.drawSummaryActionButton(restartButton, false);

    ctx.fillStyle = UITheme.colors.accent;
    ctx.font = UITheme.fonts.bodySmall;
    ctx.textAlign = "center";
    ctx.fillText("Type your name, click SUBMIT, then PLAY AGAIN or BUREAU", centerX, panelY + panelHeight - 26);
    ctx.restore();
  }

  drawLeaderboardColumn(x, y, rightEdge, leaderboard) {
    const ctx = this.context;
    const width = rightEdge - x;

    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillStyle = UITheme.colors.textPrimary;
    ctx.font = UITheme.fonts.heading;
    ctx.fillText("GLOBAL LEADERBOARD", x, y);

    let rowY = y + 44;

    if (!leaderboard.configured) {
      this.gameOverSubmitButton = null;
      ctx.fillStyle = UITheme.colors.textMuted;
      ctx.font = UITheme.fonts.body;
      ctx.fillText("Leaderboard not configured yet", x, rowY);
      return;
    }

    ctx.fillStyle = UITheme.colors.textMuted;
    ctx.font = UITheme.fonts.label;
    ctx.fillText("YOUR NAME", x, rowY);
    rowY += 26;

    const boxWidth = width - 160;
    const boxHeight = 44;
    drawPanel(ctx, x, rowY, boxWidth, boxHeight, {
      fillStyle: UITheme.colors.buttonShadow,
      borderColor: leaderboard.submitted ? "rgba(90, 214, 111, 0.6)" : UITheme.colors.borderSoft,
      borderWidth: 2,
      cornerAccent: false,
    });

    ctx.fillStyle = UITheme.colors.textPrimary;
    ctx.font = UITheme.fonts.body;
    const caret = Math.floor(Date.now() / 500) % 2 === 0 ? "_" : " ";
    const nameText = (leaderboard.name ?? "").toUpperCase();
    ctx.textBaseline = "middle";
    ctx.fillText(`${nameText}${leaderboard.submitted ? "" : caret}`, x + 12, rowY + boxHeight / 2);
    ctx.textBaseline = "top";

    const submitButton = {
      x: x + boxWidth + 12,
      y: rowY,
      width: width - boxWidth - 12,
      height: boxHeight,
      label: leaderboard.submitted ? "DONE" : "SUBMIT",
    };
    this.gameOverSubmitButton = leaderboard.submitted ? null : submitButton;

    if (!leaderboard.submitted) {
      drawThemeButton(ctx, submitButton, {
        hovered: true,
        fontStyle: UITheme.fonts.label,
      });
    } else {
      drawPanel(ctx, submitButton.x, submitButton.y, submitButton.width, submitButton.height, {
        fillStyle: "#3a5044",
        borderWidth: 1,
        cornerAccent: false,
      });
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = UITheme.fonts.label;
      ctx.fillStyle = UITheme.colors.accent;
      ctx.fillText(submitButton.label, submitButton.x + submitButton.width / 2, submitButton.y + submitButton.height / 2);
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
    }

    rowY += boxHeight + 8;

    if (leaderboard.status) {
      ctx.fillStyle = leaderboard.statusError ? UITheme.colors.warning : UITheme.colors.success;
      ctx.font = UITheme.fonts.bodySmall;
      ctx.fillText(leaderboard.status, x, rowY);
    }
    rowY += 30;

    ctx.strokeStyle = UITheme.colors.borderSoft;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, rowY);
    ctx.lineTo(rightEdge, rowY);
    ctx.stroke();
    rowY += 12;

    const entries = leaderboard.entries ?? [];

    if (leaderboard.loading) {
      ctx.fillStyle = UITheme.colors.textMuted;
      ctx.font = UITheme.fonts.body;
      ctx.fillText("Loading...", x, rowY);
      return;
    }

    if (leaderboard.loadError) {
      ctx.fillStyle = UITheme.colors.warning;
      ctx.font = UITheme.fonts.body;
      ctx.fillText("Could not load leaderboard", x, rowY);
      return;
    }

    if (entries.length === 0) {
      ctx.fillStyle = UITheme.colors.textMuted;
      ctx.font = UITheme.fonts.body;
      ctx.fillText("No scores yet. Be the first!", x, rowY);
      return;
    }

    ctx.font = UITheme.fonts.bodySmall;

    entries.slice(0, 10).forEach((entry, index) => {
      const rank = `${index + 1}.`.padEnd(3, " ");
      const name = String(entry.player_name ?? "Player").toUpperCase().slice(0, 12).padEnd(12, " ");
      const time = formatTime(entry.survival_time ?? 0);
      const line = `${rank}${name} ${time}  ${entry.kills ?? 0}k  Lv${entry.final_level ?? 1}`;
      ctx.fillStyle = index === 0 ? UITheme.colors.accent : UITheme.colors.textSecondary;
      ctx.fillText(line, x, rowY);
      rowY += 30;
    });
  }

  drawSummaryLine(x, y, text, color = UITheme.colors.textSecondary) {
    const ctx = this.context;
    ctx.textAlign = "left";
    ctx.fillStyle = color;
    ctx.font = UITheme.fonts.body;
    ctx.fillText(text, x, y);
  }

  drawSummaryActionButton(button, danger = false) {
    drawThemeButton(this.context, button, {
      hovered: false,
      danger,
      fontStyle: UITheme.fonts.button,
    });
  }
}

function getUpgradeRankText(choice) {
  if (choice.type === "newWeapon") {
    return "New tool";
  }

  if (choice.type === "weaponUpgrade") {
    return `Tool level ${choice.rank + 1} / ${choice.maxRank}`;
  }

  if (choice.type === "newPassive") {
    return "New relic";
  }

  if (choice.type === "passiveUpgrade") {
    return `Relic level ${choice.rank + 1} / ${choice.maxRank}`;
  }

  if (choice.type === "fallback") {
    return "Bonus reward";
  }

  if (choice.type === "trait") {
    return choice.tradeoff ? `Trait — ${choice.tradeoff}` : "Run Trait";
  }

  if (choice.type === "synergy") {
    return "Synergy unlocked!";
  }

  return "";
}

function getUpgradeCategoryText(choice) {
  if (choice.type === "newWeapon" || choice.type === "weaponUpgrade") {
    return "TOOL";
  }

  if (choice.type === "newPassive" || choice.type === "passiveUpgrade") {
    return "RELIC";
  }

  if (choice.type === "trait") {
    return "TRAIT";
  }

  if (choice.type === "synergy") {
    return "SYNERGY";
  }

  return "BONUS";
}

function getUpgradeAccentColor(choice) {
  if (choice.color) {
    return choice.color;
  }

  return getRarityColor(choice.type);
}
