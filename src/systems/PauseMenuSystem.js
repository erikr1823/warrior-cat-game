import { formatTime } from "../core/MathUtils.js";
import { GameIdentity } from "../config/GameIdentity.js";
import { getCharacterDefinition } from "../config/CharacterDefinitions.js";

export class PauseMenuSystem {
  constructor(context, width, height) {
    this.context = context;
    this.width = width;
    this.height = height;
    this.page = "main";
    this.mainButtons = [];
    this.charBackButton = null;
  }

  reset() {
    this.page = "main";
  }

  update(input, game, shopSystem) {
    if (this.page === "bureau") {
      const action = shopSystem.update(
        input,
        game.saveData,
        game.metaUpgradeSystem,
        game.saveSystem,
        { mode: "pause" },
      );

      if (action === "back") {
        this.page = "main";
      }

      return null;
    }

    if (this.page === "charInfo") {
      if (
        input.wasActionJustPressed() ||
        (this.charBackButton && input.isMouseOver(this.charBackButton) && input.consumeClick())
      ) {
        this.page = "main";
      }

      return null;
    }

    this.mainButtons = this.buildMainButtons();
    const clicked = input.consumeClick();

    if (clicked) {
      for (const button of this.mainButtons) {
        if (input.isMouseOver(button)) {
          return button.id;
        }
      }
    }

    if (input.wasActionJustPressed()) {
      return "resume";
    }

    return null;
  }

  draw(input, game, shopSystem) {
    const ctx = this.context;

    ctx.save();
    ctx.fillStyle = "rgba(5, 6, 9, 0.72)";
    ctx.fillRect(0, 0, this.width, this.height);

    if (this.page === "bureau") {
      ctx.restore();
      shopSystem.draw(input, game.saveData, game.metaUpgradeSystem, { mode: "pause" });
      return;
    }

    if (this.page === "charInfo") {
      this.drawCharInfo(input, game);
      ctx.restore();
      return;
    }

    this.drawMainMenu(input);
    ctx.restore();
  }

  drawMainMenu(input) {
    const ctx = this.context;
    const centerX = this.width / 2;
    const panelX = centerX - 420;
    const panelY = 220;
    const panelWidth = 840;
    const panelHeight = 620;

    ctx.fillStyle = "rgba(15, 18, 24, 0.96)";
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
    ctx.strokeStyle = "#ffd27e";
    ctx.lineWidth = 5;
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);

    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#fff4dc";
    ctx.font = "900 64px 'Courier New', monospace";
    ctx.fillText("PATROL PAUSED", centerX, panelY + 36);

    ctx.font = "600 24px 'Courier New', monospace";
    ctx.fillStyle = "#9eb0aa";
    ctx.fillText("The stacks hold still while you consult the ledger.", centerX, panelY + 108);

    this.mainButtons = this.buildMainButtons();

    for (const button of this.mainButtons) {
      const hovered = input.isMouseOver(button);
      this.drawMenuButton(button, hovered, button.id === "abandon");
    }

    ctx.font = "700 22px 'Courier New', monospace";
    ctx.fillStyle = "#9eb0aa";
    ctx.fillText("ESC / P = resume   ·   click a option", centerX, panelY + panelHeight - 42);
  }

  buildMainButtons() {
    const centerX = this.width / 2;
    const buttonWidth = 520;
    const buttonHeight = 68;
    const startY = 380;
    const gap = 18;
    const labels = [
      { id: "resume", label: "RESUME PATROL" },
      { id: "bureau", label: "ARCHIVE BUREAU" },
      { id: "profile", label: "KEEPER PROFILE" },
      { id: "abandon", label: "ABANDON PATROL" },
    ];

    return labels.map((entry, index) => ({
      id: entry.id,
      label: entry.label,
      x: centerX - buttonWidth / 2,
      y: startY + index * (buttonHeight + gap),
      width: buttonWidth,
      height: buttonHeight,
    }));
  }

  drawMenuButton(button, hovered, danger = false) {
    const ctx = this.context;
    const accent = danger ? (hovered ? "#ff8a7a" : "#b94f42") : hovered ? "#ffe09a" : "#4a7058";

    ctx.fillStyle = "#0b0e14";
    ctx.fillRect(button.x + 6, button.y + 6, button.width, button.height);
    ctx.fillStyle = accent;
    ctx.fillRect(button.x, button.y, button.width, button.height);
    ctx.fillStyle = danger ? "#3a1818" : "#2a1e28";
    ctx.fillRect(button.x + 8, button.y + 8, button.width - 16, button.height - 16);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "900 28px 'Courier New', monospace";
    ctx.fillStyle = hovered ? "#fff6d4" : "#ffe09a";
    ctx.fillText(button.label, button.x + button.width / 2, button.y + button.height / 2);
  }

  drawCharInfo(input, game) {
    const ctx = this.context;
    const centerX = this.width / 2;
    const panelX = 120;
    const panelY = 72;
    const panelWidth = this.width - 240;
    const panelHeight = 936;
    const info = this.buildCharInfo(game);

    ctx.fillStyle = "rgba(15, 18, 24, 0.96)";
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
    ctx.strokeStyle = "#ffd27e";
    ctx.lineWidth = 5;
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);

    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#fff4dc";
    ctx.font = "900 56px 'Courier New', monospace";
    ctx.fillText("KEEPER PROFILE", centerX, panelY + 28);

    ctx.font = "700 28px 'Courier New', monospace";
    ctx.fillStyle = "#ffe09a";
    ctx.fillText(info.name, centerX, panelY + 96);

    ctx.font = "600 22px 'Courier New', monospace";
    ctx.fillStyle = "#9eb0aa";
    this.drawWrappedText(info.role, panelX + 48, panelY + 132, panelWidth - 96, 28, "center");

    const leftX = panelX + 56;
    const rightX = panelX + panelWidth / 2 + 24;
    let rowY = panelY + 196;

    ctx.textAlign = "left";
    ctx.font = "800 26px 'Courier New', monospace";
    ctx.fillStyle = "#fff4dc";
    ctx.fillText("Current Patrol", leftX, rowY);
    rowY += 40;
    ctx.font = "700 24px 'Courier New', monospace";
    ctx.fillStyle = "#d9e8e2";

    const patrolLines = [
      `Wing: ${info.waveName}`,
      `Time: ${formatTime(info.survivalTime)}`,
      `Level: ${info.level}`,
      `HP: ${Math.ceil(info.health)} / ${info.maxHealth}`,
      `Speed: ${Math.round(info.speed)}`,
      `Unwritten vanquished: ${info.killCount}`,
      `Run ${GameIdentity.memoryCoinLabel}: ${info.coins}`,
    ];

    for (const line of patrolLines) {
      ctx.fillText(line, leftX, rowY);
      rowY += 34;
    }

    rowY = panelY + 196;
    ctx.fillStyle = "#fff4dc";
    ctx.font = "800 26px 'Courier New', monospace";
    ctx.fillText("Run Bonuses", rightX, rowY);
    rowY += 40;
    ctx.font = "700 24px 'Courier New', monospace";
    ctx.fillStyle = "#d9e8e2";

    const modifierLines = [
      `Damage: x${info.modifiers.damageMultiplier.toFixed(2)}`,
      `${GameIdentity.xpLabel}: x${info.modifiers.xpMultiplier.toFixed(2)}`,
      `Move speed: x${info.modifiers.moveSpeedMultiplier.toFixed(2)}`,
      `Pickup range: x${info.modifiers.pickupRangeMultiplier.toFixed(2)}`,
      `Total ${GameIdentity.memoryCoinLabel}: ${info.totalCoins}`,
    ];

    for (const line of modifierLines) {
      ctx.fillText(line, rightX, rowY);
      rowY += 34;
    }

    rowY = panelY + 470;
    ctx.fillStyle = "#fff4dc";
    ctx.font = "800 26px 'Courier New', monospace";
    ctx.fillText("Tools & Relics", leftX, rowY);
    rowY += 40;
    ctx.font = "700 24px 'Courier New', monospace";
    ctx.fillStyle = "#d9e8e2";

    if (info.weapons.length === 0) {
      ctx.fillText("No tools yet", leftX, rowY);
      rowY += 34;
    } else {
      for (const weapon of info.weapons) {
        ctx.fillText(`• ${weapon.name}  Lv ${weapon.level}`, leftX, rowY);
        rowY += 32;
      }
    }

    rowY += 8;

    if (info.passives.length === 0) {
      ctx.fillText("No relics yet", leftX, rowY);
      rowY += 34;
    } else {
      for (const passive of info.passives) {
        ctx.fillText(`• ${passive.name}  Lv ${passive.level}`, leftX, rowY);
        rowY += 32;
      }
    }

    rowY = Math.max(rowY + 16, panelY + 680);
    ctx.fillStyle = "#fff4dc";
    ctx.font = "800 26px 'Courier New', monospace";
    ctx.fillText("Permanent Ledger", leftX, rowY);
    rowY += 40;
    ctx.font = "700 22px 'Courier New', monospace";
    ctx.fillStyle = "#d9e8e2";

    for (const upgrade of info.metaUpgrades) {
      const levelText = upgrade.isMaxed ? "MAX" : `Lv ${upgrade.level}/${upgrade.maxLevel}`;
      ctx.fillText(`${upgrade.name}: ${levelText}`, leftX, rowY);
      rowY += 30;
    }

    const backWidth = 360;
    const backHeight = 64;
    this.charBackButton = {
      x: centerX - backWidth / 2,
      y: panelY + panelHeight - 88,
      width: backWidth,
      height: backHeight,
      label: "BACK",
    };

    this.drawMenuButton(this.charBackButton, input.isMouseOver(this.charBackButton));

    ctx.textAlign = "center";
    ctx.font = "700 20px 'Courier New', monospace";
    ctx.fillStyle = "#9eb0aa";
    ctx.fillText("ESC / SPACE = back", centerX, panelY + panelHeight - 28);
  }

  buildCharInfo(game) {
    const wave = game.spawner.getWaveDirector().getDisplayInfo(game.survivalTime);
    const character = getCharacterDefinition(game.player.characterId);

    return {
      name: character.name,
      role: `${character.title} — ${character.description}`,
      level: game.player.level,
      health: game.player.health,
      maxHealth: game.player.maxHealth,
      speed: game.player.speed,
      survivalTime: game.survivalTime,
      killCount: game.killCount,
      coins: game.coins,
      totalCoins: game.saveData.totalCoins,
      modifiers: game.runModifiers,
      weapons: game.weaponSystem.getOwnedWeaponSummary(),
      passives: game.passiveSystem.getOwnedPassiveSummary(),
      metaUpgrades: game.metaUpgradeSystem.getShopEntries(game.saveData),
      waveName: wave?.waveName ?? "Unknown",
    };
  }

  drawWrappedText(text, x, y, maxWidth, lineHeight, align = "left") {
    const ctx = this.context;
    const words = text.split(" ");
    let line = "";
    let drawY = y;

    ctx.textAlign = align;

    for (const word of words) {
      const testLine = line.length > 0 ? `${line} ${word}` : word;
      const width = ctx.measureText(testLine).width;
      const anchorX = align === "center" ? x + maxWidth / 2 : x;

      if (width > maxWidth && line.length > 0) {
        ctx.fillText(line, anchorX, drawY);
        line = word;
        drawY += lineHeight;
      } else {
        line = testLine;
      }
    }

    if (line.length > 0) {
      const anchorX = align === "center" ? x + maxWidth / 2 : x;
      ctx.fillText(line, anchorX, drawY);
    }

    ctx.textAlign = "left";
  }
}
