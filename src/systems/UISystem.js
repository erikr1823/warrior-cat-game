import { clamp, formatTime } from "../core/MathUtils.js";
import { GameConfig } from "../config/GameConfig.js";
import { GameIdentity } from "../config/GameIdentity.js";

export class UISystem {
  constructor(context, width, height) {
    this.context = context;
    this.width = width;
    this.height = height;
    this.upgradeChoiceCards = [];
    this.chestContinueButton = null;
    this.gameOverShopButton = null;
    this.gameOverRestartButton = null;
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
  }) {
    const ctx = this.context;

    ctx.save();
    ctx.textBaseline = "top";

    const panelHeight = 248;
    ctx.fillStyle = "rgba(10, 14, 18, 0.58)";
    ctx.fillRect(32, 28, 470, panelHeight);

    ctx.strokeStyle = "rgba(255, 222, 161, 0.32)";
    ctx.lineWidth = 2;
    ctx.strokeRect(32, 28, 470, panelHeight);

    ctx.fillStyle = "#fff4dc";
    ctx.font = "700 42px system-ui, sans-serif";
    ctx.fillText(title, 56, 50);

    ctx.fillStyle = "#d9e8e2";
    ctx.font = "500 24px system-ui, sans-serif";
    ctx.fillText(`FPS: ${Math.round(fps)}`, 56, 108);
    ctx.fillText(`Time: ${formatTime(survivalTime)}`, 56, 142);
    ctx.fillText(`Kills: ${killCount}`, 56, 176);
    ctx.fillText(`Enemies: ${enemyCount}`, 240, 176);
    ctx.fillText(`${GameIdentity.memoryCoinLabel}: ${coins}`, 360, 176);
    this.drawPlayerHealthBar(playerHealth, playerMaxHealth, 56, 210, 390, 26);

    this.drawLoadoutPanel(weapons, passives);
    this.drawWaveInfo(wave);
    this.drawWaveAnnouncement(waveAnnouncement);
    this.drawXPBar(playerLevel, playerXP, playerXPToNextLevel);
    this.drawAbilityCooldowns(dashCooldownProgress, manualShotCooldownProgress);
    if (showPauseButton) {
      this.drawPauseButton();
    }
    this.drawAudioControls(muted, volume);
    this.drawPerfStats({
      fps,
      enemyCount,
      projectileCount,
      particleCount,
      pickupCount,
    });
    ctx.restore();
  }

  drawPerfStats({ fps, enemyCount, projectileCount, particleCount, pickupCount }) {
    const ctx = this.context;
    const panelX = 32;
    const panelY = 286;
    const panelWidth = 470;
    const panelHeight = 118;

    ctx.fillStyle = "rgba(10, 14, 18, 0.58)";
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
    ctx.strokeStyle = "rgba(255, 222, 161, 0.22)";
    ctx.lineWidth = 2;
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);

    ctx.fillStyle = "#9eb0aa";
    ctx.font = "600 18px system-ui, sans-serif";
    ctx.fillText("PERFORMANCE", panelX + 16, panelY + 12);
    ctx.font = "500 20px system-ui, sans-serif";
    ctx.fillStyle = "#d9e8e2";
    ctx.fillText(`FPS ${Math.round(fps)}`, panelX + 16, panelY + 42);
    ctx.fillText(`Enemies ${enemyCount}`, panelX + 150, panelY + 42);
    ctx.fillText(`Projectiles ${projectileCount}`, panelX + 300, panelY + 42);
    ctx.fillText(`Particles ${particleCount}`, panelX + 16, panelY + 72);
    ctx.fillText(`Pickups ${pickupCount}`, panelX + 180, panelY + 72);
  }

  drawPauseButton() {
    const ctx = this.context;
    const button = this.pauseButton;

    ctx.fillStyle = "rgba(10, 14, 18, 0.58)";
    ctx.fillRect(button.x, button.y, button.width, button.height);
    ctx.strokeStyle = "rgba(255, 222, 161, 0.32)";
    ctx.lineWidth = 2;
    ctx.strokeRect(button.x, button.y, button.width, button.height);

    ctx.fillStyle = "#fff4dc";
    ctx.font = "700 22px system-ui, sans-serif";
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

    ctx.fillStyle = "rgba(10, 14, 18, 0.58)";
    ctx.fillRect(slider.x, slider.y, slider.width, slider.height);
    ctx.strokeStyle = "rgba(255, 222, 161, 0.32)";
    ctx.lineWidth = 2;
    ctx.strokeRect(slider.x, slider.y, slider.width, slider.height);

    ctx.fillStyle = "#fff4dc";
    ctx.font = "600 18px system-ui, sans-serif";
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
    ctx.fillStyle = "#fff4dc";
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

    ctx.fillStyle = "rgba(10, 14, 18, 0.58)";
    ctx.fillRect(button.x, button.y, button.width, button.height);
    ctx.strokeStyle = "rgba(255, 222, 161, 0.32)";
    ctx.lineWidth = 2;
    ctx.strokeRect(button.x, button.y, button.width, button.height);

    ctx.fillStyle = "#fff4dc";
    ctx.font = "700 22px system-ui, sans-serif";
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
    const panelX = this.width - 360;
    const panelY = 28;
    const panelWidth = 328;
    const rowHeight = 32;
    const headerHeight = 38;
    const sectionGap = 18;
    const weaponsHeight = headerHeight + weapons.length * rowHeight;
    const passivesHeight = passives.length > 0 ? headerHeight + passives.length * rowHeight : 0;
    const panelHeight = weaponsHeight + (passives.length > 0 ? sectionGap + passivesHeight : 0);

    ctx.fillStyle = "rgba(10, 14, 18, 0.58)";
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
    ctx.strokeStyle = "rgba(255, 222, 161, 0.32)";
    ctx.lineWidth = 2;
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);

    let rowY = panelY + 16;
    ctx.fillStyle = "#fff4dc";
    ctx.font = "700 24px system-ui, sans-serif";
    ctx.fillText("Tools", panelX + 18, rowY);
    rowY += 30;
    rowY = this.drawLoadoutRows(panelX, panelWidth, rowY, weapons);

    if (passives.length > 0) {
      rowY += sectionGap;
      ctx.fillStyle = "#fff4dc";
      ctx.font = "700 24px system-ui, sans-serif";
      ctx.fillText("Relics", panelX + 18, rowY);
      rowY += 30;
      this.drawLoadoutRows(panelX, panelWidth, rowY, passives);
    }
  }

  drawLoadoutRows(panelX, panelWidth, startY, items) {
    const ctx = this.context;
    let rowY = startY;
    ctx.font = "600 20px system-ui, sans-serif";

    for (const item of items) {
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(panelX + 28, rowY + 10, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = item.isEvolved ? item.color : "#d9e8e2";
      ctx.fillText(item.name, panelX + 44, rowY);

      let levelText;
      let levelColor;

      if (item.isEvolved) {
        levelText = "EVOLVED";
        levelColor = item.color ?? "#ffe09a";
      } else if (item.isMaxLevel) {
        levelText = "MAX";
        levelColor = "#ffe09a";
      } else {
        levelText = `Lv ${item.level}/${item.maxLevel}`;
        levelColor = "#9eb0aa";
      }

      const levelWidth = ctx.measureText(levelText).width;
      ctx.fillStyle = levelColor;
      ctx.fillText(levelText, panelX + panelWidth - levelWidth - 18, rowY);
      rowY += 32;
    }

    return rowY;
  }

  drawWaveInfo(wave) {
    if (!wave) {
      return;
    }

    const ctx = this.context;
    const label = `Min ${wave.minute} · ${wave.waveName}`;
    const sublabel = wave.worldSubtitle ?? "";

    ctx.save();
    ctx.textAlign = "center";
    ctx.font = "700 22px system-ui, sans-serif";
    ctx.fillStyle = "rgba(8, 9, 12, 0.82)";
    ctx.fillText(label, this.width / 2 + 2, 34);
    ctx.fillStyle = "#ffe09a";
    ctx.fillText(label, this.width / 2, 32);

    if (sublabel) {
      ctx.font = "600 16px system-ui, sans-serif";
      ctx.fillStyle = "rgba(8, 9, 12, 0.82)";
      ctx.fillText(sublabel, this.width / 2 + 1, 58);
      ctx.fillStyle = "#9eb0aa";
      ctx.fillText(sublabel, this.width / 2, 57);
    }

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

    ctx.fillStyle = "rgba(8, 9, 12, 0.72)";
    ctx.fillRect(centerX - 520, 72, 1040, 118);
    ctx.strokeStyle = "rgba(255, 222, 161, 0.35)";
    ctx.lineWidth = 3;
    ctx.strokeRect(centerX - 520, 72, 1040, 118);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.font = "900 54px 'Courier New', monospace";
    ctx.fillStyle = "rgba(8, 9, 12, 0.85)";
    ctx.fillText(announcement.title ?? announcement.text ?? "", centerX + 3, 112);
    ctx.fillStyle = "#ffe09a";
    ctx.fillText(announcement.title ?? announcement.text ?? "", centerX, 109);

    if (announcement.worldName) {
      ctx.font = "700 28px system-ui, sans-serif";
      ctx.fillStyle = "#fff4dc";
      ctx.fillText(announcement.worldName, centerX, 152);
    }

    if (announcement.subtitle) {
      ctx.font = "500 22px system-ui, sans-serif";
      ctx.fillStyle = "#b8c4d0";
      ctx.fillText(announcement.subtitle, centerX, 178);
    }

    ctx.restore();
  }

  drawPlayerHealthBar(current, max, x, y, width, height) {
    const ctx = this.context;
    const percent = clamp(current / max, 0, 1);
    const hpText = `HP ${Math.ceil(current)} / ${max}`;

    ctx.fillStyle = "rgba(8, 9, 12, 0.9)";
    ctx.fillRect(x - 3, y - 3, width + 6, height + 6);
    ctx.fillStyle = "#46262c";
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = percent > 0.35 ? "#5ed66f" : "#e45a4f";
    ctx.fillRect(x, y, width * percent, height);
    ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
    ctx.fillRect(x, y, width * percent, 7);

    ctx.font = "700 18px system-ui, sans-serif";
    ctx.fillStyle = "#101318";
    ctx.fillText(hpText, x + 12, y + 4);
    ctx.fillStyle = "#fff4dc";
    ctx.fillText(hpText, x + 10, y + 2);
  }

  drawXPBar(level, xp, xpToNextLevel) {
    const ctx = this.context;
    const x = 420;
    const y = this.height - 58;
    const width = this.width - 840;
    const height = 24;
    const percent = clamp(xp / xpToNextLevel, 0, 1);

    ctx.fillStyle = "rgba(8, 9, 12, 0.82)";
    ctx.fillRect(x - 4, y - 4, width + 8, height + 8);
    ctx.fillStyle = "#17243a";
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = "#43a9ff";
    ctx.fillRect(x, y, width * percent, height);
    ctx.fillStyle = "rgba(255, 255, 255, 0.26)";
    ctx.fillRect(x, y, width * percent, 6);

    ctx.textAlign = "center";
    ctx.font = "800 22px 'Courier New', monospace";
    ctx.fillStyle = "#101318";
    ctx.fillText(`LEVEL ${level}  SHARDS ${xp} / ${xpToNextLevel}`, this.width / 2 + 2, y - 2);
    ctx.fillStyle = "#fff4dc";
    ctx.fillText(`LEVEL ${level}  SHARDS ${xp} / ${xpToNextLevel}`, this.width / 2, y - 4);
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
    ctx.fillStyle = "rgba(8, 9, 12, 0.72)";
    ctx.fillRect(x - 2, y - 18, width + 4, height + 22);
    ctx.fillStyle = "#17243a";
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = progress >= 1 ? "#7fd88a" : "#ffe09a";
    ctx.fillRect(x, y, width * clamp(progress, 0, 1), height);

    ctx.font = "600 14px system-ui, sans-serif";
    ctx.fillStyle = "#b8c4d0";
    ctx.textAlign = "center";
    ctx.fillText(label, x + width / 2, y - 4);
    ctx.textAlign = "left";
  }

  drawLevelUp(choices) {
    this.layoutUpgradeChoiceCards(choices);

    const ctx = this.context;
    const panelX = this.width / 2 - 650;
    const panelY = this.height / 2 - 300;

    ctx.save();
    ctx.fillStyle = "rgba(5, 6, 9, 0.7)";
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.fillStyle = "rgba(15, 18, 24, 0.95)";
    ctx.fillRect(panelX, panelY, 1300, 600);
    ctx.strokeStyle = "#ffd27e";
    ctx.lineWidth = 4;
    ctx.strokeRect(panelX, panelY, 1300, 600);

    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#fff4dc";
    ctx.font = "900 64px 'Courier New', monospace";
    ctx.fillText("INSIGHT GAINED", this.width / 2, panelY + 42);

    ctx.font = "700 26px 'Courier New', monospace";
    ctx.fillStyle = "#d9e8e2";
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

    ctx.fillStyle = "#211d22";
    ctx.fillRect(card.x, card.y, card.width, card.height);
    ctx.strokeStyle = "#c8914d";
    ctx.lineWidth = 4;
    ctx.strokeRect(card.x, card.y, card.width, card.height);

    ctx.fillStyle = "#3a2c2b";
    ctx.fillRect(card.x + 18, card.y + 18, 58, 58);
    ctx.strokeStyle = "#ffd27e";
    ctx.lineWidth = 2;
    ctx.strokeRect(card.x + 18, card.y + 18, 58, 58);
    ctx.fillStyle = "#fff4dc";
    ctx.font = "900 36px 'Courier New', monospace";
    ctx.fillText(String(index + 1), card.x + 47, card.y + 27);

    ctx.textAlign = "left";
    ctx.fillStyle = "#9eb0aa";
    ctx.font = "700 18px 'Courier New', monospace";
    ctx.fillText(categoryText, card.x + 96, card.y + 22);

    ctx.fillStyle = "#fff4dc";
    ctx.font = "900 30px 'Courier New', monospace";
    this.drawWrappedText(choice.name, card.x + 96, card.y + 44, card.width - 118, 34);

    ctx.fillStyle = "#d9e8e2";
    ctx.font = "700 24px 'Courier New', monospace";
    this.drawWrappedText(choice.description, card.x + 30, card.y + 126, card.width - 60, 34);

    ctx.fillStyle = "#ffe09a";
    ctx.font = "800 22px 'Courier New', monospace";
    this.drawWrappedText(rankText, card.x + 30, card.y + 286, card.width - 60, 30);
    ctx.textAlign = "center";
  }

  drawWrappedText(text, x, y, maxWidth, lineHeight) {
    const words = text.split(" ");
    let line = "";
    let drawY = y;

    for (const word of words) {
      const testLine = line.length > 0 ? `${line} ${word}` : word;
      const width = this.context.measureText(testLine).width;

      if (width > maxWidth && line.length > 0) {
        this.context.fillText(line, x, drawY);
        line = word;
        drawY += lineHeight;
      } else {
        line = testLine;
      }
    }

    this.context.fillText(line, x, drawY);
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

      ctx.fillStyle = reward.isEvolution ? "rgba(18, 12, 28, 0.97)" : "rgba(15, 18, 24, 0.96)";
      ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
      ctx.strokeStyle = reward.accent ?? "#ffd27e";
      ctx.lineWidth = reward.isEvolution ? 7 : 5;
      ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);

      if (reward.isEvolution) {
        ctx.strokeStyle = "rgba(255, 244, 220, 0.22)";
        ctx.lineWidth = 2;
        ctx.strokeRect(panelX + 14, panelY + 14, panelWidth - 28, panelHeight - 28);
      }

      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillStyle = reward.accent ?? "#ffd27e";
      ctx.font = reward.isEvolution ? "900 64px 'Courier New', monospace" : "900 58px 'Courier New', monospace";
      ctx.fillText(reward.isEvolution ? "TALE REWRITTEN!" : "CATALOG OPENED!", centerX, panelY + 36);

      ctx.fillStyle = "#fff4dc";
      ctx.font = "900 42px 'Courier New', monospace";
      ctx.fillText(reward.title, centerX, panelY + 112);

      const iconPulse = reward.isEvolution ? 1 + Math.sin(time * 10) * 0.08 : 1;
      ctx.save();
      ctx.translate(centerX, panelY + 204);
      ctx.scale(iconPulse, iconPulse);
      ctx.fillStyle = reward.accent ?? "#ffd27e";
      ctx.font = "900 72px 'Courier New', monospace";
      ctx.fillText(reward.icon ?? "★", 0, 0);
      ctx.restore();

      ctx.fillStyle = "#fff4dc";
      ctx.font = "900 48px 'Courier New', monospace";
      ctx.fillText(reward.name, centerX, panelY + (reward.isEvolution ? 268 : 252));

      ctx.fillStyle = "#ffe09a";
      ctx.font = "800 36px 'Courier New', monospace";
      ctx.fillText(reward.headline, centerX, panelY + (reward.isEvolution ? 334 : 316));

      ctx.fillStyle = "#d9e8e2";
      ctx.font = "700 28px 'Courier New', monospace";
      this.drawWrappedText(
        reward.description,
        centerX - 320,
        panelY + (reward.isEvolution ? 392 : 372),
        640,
        34,
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
      };

      ctx.fillStyle = "#2a2118";
      ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
      ctx.strokeStyle = "#ffd27e";
      ctx.lineWidth = 3;
      ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
      ctx.fillStyle = "#ffe09a";
      ctx.font = "900 28px 'Courier New', monospace";
      ctx.fillText("SPACE OR CLICK TO CONTINUE", centerX, buttonY + 18);
    } else {
      this.chestContinueButton = null;
      ctx.textAlign = "center";
      ctx.fillStyle = "#fff4dc";
      ctx.font = "900 34px 'Courier New', monospace";
      ctx.fillText("Unfolding catalog...", centerX, centerY + 150);
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

  drawGameOver(summary) {
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
    ctx.fillStyle = "rgba(5, 6, 9, 0.74)";
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.fillStyle = "rgba(15, 18, 24, 0.96)";
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
    ctx.strokeStyle = "#ffd27e";
    ctx.lineWidth = 5;
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);

    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#fff4dc";
    ctx.font = "900 68px 'Courier New', monospace";
    ctx.fillText("PATROL ENDED", centerX, panelY + 28);

    ctx.font = "600 22px 'Courier New', monospace";
    ctx.fillStyle = "#9eb0aa";
    ctx.textAlign = "left";
    this.drawWrappedText(
      GameIdentity.storyPremise,
      panelX + 60,
      panelY + 96,
      panelWidth - 120,
      28,
    );

    ctx.font = "700 28px 'Courier New', monospace";
    ctx.fillStyle = "#d9e8e2";

    const leftX = panelX + 80;
    const rightX = panelX + panelWidth / 2 + 40;
    let rowY = panelY + 200;

    this.drawSummaryLine(leftX, rowY, `Survival Time: ${formatTime(summary.survivalTime)}`);
    rowY += 42;
    this.drawSummaryLine(leftX, rowY, `Level Reached: ${summary.finalLevel}`);
    rowY += 42;
    this.drawSummaryLine(leftX, rowY, `Unwritten Vanquished: ${summary.killCount}`);
    rowY += 42;
    this.drawSummaryLine(leftX, rowY, `Archivores Defeated: ${summary.bossDefeatedCount}`);
    rowY += 42;
    this.drawSummaryLine(leftX, rowY, `Memory Coins Earned: ${summary.coinsEarned}`);

    if (summary.startingCoinBonus > 0) {
      rowY += 42;
      this.drawSummaryLine(leftX, rowY, `Starting Bonus: +${summary.startingCoinBonus}`);
    }

    rowY += 42;
    this.drawSummaryLine(leftX, rowY, `Total Memory Coins: ${summary.totalCoins}`, "#ffe09a");

    rowY = panelY + 200;
    ctx.textAlign = "left";
    ctx.fillStyle = "#fff4dc";
    ctx.font = "800 28px 'Courier New', monospace";
    ctx.fillText("Tools Carried", rightX, rowY);
    rowY += 40;
    ctx.font = "700 24px 'Courier New', monospace";
    ctx.fillStyle = "#d9e8e2";

    if (summary.weapons.length === 0) {
      ctx.fillText("None", rightX, rowY);
      rowY += 34;
    } else {
      for (const weaponName of summary.weapons) {
        ctx.fillText(`• ${weaponName}`, rightX, rowY);
        rowY += 34;
      }
    }

    rowY += 12;
    ctx.fillStyle = "#fff4dc";
    ctx.font = "800 28px 'Courier New', monospace";
    ctx.fillText("Tales Rewritten", rightX, rowY);
    rowY += 40;
    ctx.font = "700 24px 'Courier New', monospace";
    ctx.fillStyle = "#d9e8e2";

    if (summary.evolutions.length === 0) {
      ctx.fillText("None this run", rightX, rowY);
    } else {
      for (const evolutionName of summary.evolutions) {
        ctx.fillText(`• ${evolutionName}`, rightX, rowY);
        rowY += 34;
      }
    }

    const shopButton = {
      x: centerX - 430,
      y: panelY + panelHeight - 110,
      width: 380,
      height: 72,
      label: "BACK TO BUREAU",
    };
    const restartButton = {
      x: centerX + 50,
      y: panelY + panelHeight - 110,
      width: 380,
      height: 72,
      label: "BEGIN PATROL",
    };

    this.gameOverShopButton = shopButton;
    this.gameOverRestartButton = restartButton;

    this.drawSummaryActionButton(shopButton, "#b94f42");
    this.drawSummaryActionButton(restartButton, "#4a7058");

    ctx.fillStyle = "#ffe09a";
    ctx.font = "800 24px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.fillText("SPACE / BUREAU = UPGRADES   ·   R = INSTANT RESTART", centerX, panelY + panelHeight - 34);
    ctx.restore();
  }

  drawSummaryLine(x, y, text, color = "#d9e8e2") {
    const ctx = this.context;
    ctx.textAlign = "left";
    ctx.fillStyle = color;
    ctx.font = "700 28px 'Courier New', monospace";
    ctx.fillText(text, x, y);
  }

  drawSummaryActionButton(button, accent) {
    const ctx = this.context;

    ctx.fillStyle = "#0b0e14";
    ctx.fillRect(button.x + 6, button.y + 6, button.width, button.height);
    ctx.fillStyle = accent;
    ctx.fillRect(button.x, button.y, button.width, button.height);
    ctx.fillStyle = "#2a1e28";
    ctx.fillRect(button.x + 8, button.y + 8, button.width - 16, button.height - 16);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "900 28px 'Courier New', monospace";
    ctx.fillStyle = "#ffe09a";
    ctx.fillText(button.label, button.x + button.width / 2, button.y + button.height / 2);
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

  return "";
}

function getUpgradeCategoryText(choice) {
  if (choice.type === "newWeapon" || choice.type === "weaponUpgrade") {
    return "TOOL";
  }

  if (choice.type === "newPassive" || choice.type === "passiveUpgrade") {
    return "RELIC";
  }

  return "BONUS";
}
