import { formatTime } from "../core/MathUtils.js";
import { GameIdentity } from "../config/GameIdentity.js";
import { getCharacterDefinition } from "../config/CharacterDefinitions.js";
import { UITheme, drawButton as drawThemeButton, drawPanel, drawTextShadow, drawWrappedText as wrapThemeText } from "../config/UITheme.js";

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
    ctx.fillStyle = UITheme.colors.overlay;
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

    drawPanel(ctx, panelX, panelY, panelWidth, panelHeight, {
      fillStyle: UITheme.colors.panelBg,
      borderColor: UITheme.colors.border,
      borderWidth: 3,
    });

    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.font = UITheme.fonts.title;
    drawTextShadow(ctx, "PATROL PAUSED", centerX, panelY + 36, {
      fillStyle: UITheme.colors.textPrimary,
      align: "center",
    });

    ctx.font = UITheme.fonts.body;
    ctx.fillStyle = UITheme.colors.textMuted;
    ctx.fillText("The stacks hold still while you consult the ledger.", centerX, panelY + 108);

    this.mainButtons = this.buildMainButtons();

    for (const button of this.mainButtons) {
      const hovered = input.isMouseOver(button);
      this.drawMenuButton(button, hovered, button.id === "abandon");
    }

    ctx.font = UITheme.fonts.bodySmall;
    ctx.fillStyle = UITheme.colors.textMuted;
    ctx.fillText("ESC / P = resume   ·   click an option", centerX, panelY + panelHeight - 42);
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
    drawThemeButton(this.context, button, {
      hovered,
      danger,
      fontStyle: UITheme.fonts.button,
    });
  }

  drawCharInfo(input, game) {
    const ctx = this.context;
    const centerX = this.width / 2;
    const panelX = 120;
    const panelY = 72;
    const panelWidth = this.width - 240;
    const panelHeight = 936;
    const info = this.buildCharInfo(game);

    drawPanel(ctx, panelX, panelY, panelWidth, panelHeight, {
      fillStyle: UITheme.colors.panelBg,
      borderColor: UITheme.colors.border,
      borderWidth: 3,
    });

    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.font = UITheme.fonts.titleSmall;
    drawTextShadow(ctx, "KEEPER PROFILE", centerX, panelY + 28, {
      fillStyle: UITheme.colors.textPrimary,
      align: "center",
    });

    ctx.font = UITheme.fonts.heading;
    ctx.fillStyle = UITheme.colors.accent;
    ctx.fillText(info.name, centerX, panelY + 96);

    ctx.font = UITheme.fonts.body;
    ctx.fillStyle = UITheme.colors.textMuted;
    wrapThemeText(ctx, info.role, panelX + 48, panelY + 132, panelWidth - 96, UITheme.spacing.lineHeightSmall);

    const leftX = panelX + 56;
    const rightX = panelX + panelWidth / 2 + 24;
    let rowY = panelY + 196;

    ctx.textAlign = "left";
    ctx.font = UITheme.fonts.subheading;
    ctx.fillStyle = UITheme.colors.textPrimary;
    ctx.fillText("Current Patrol", leftX, rowY);
    rowY += 40;
    ctx.font = UITheme.fonts.body;
    ctx.fillStyle = UITheme.colors.textSecondary;

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
    ctx.fillStyle = UITheme.colors.textPrimary;
    ctx.font = UITheme.fonts.subheading;
    ctx.fillText("Run Bonuses", rightX, rowY);
    rowY += 40;
    ctx.font = UITheme.fonts.body;
    ctx.fillStyle = UITheme.colors.textSecondary;

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
    ctx.fillStyle = UITheme.colors.textPrimary;
    ctx.font = UITheme.fonts.subheading;
    ctx.fillText("Tools & Relics", leftX, rowY);
    rowY += 40;
    ctx.font = UITheme.fonts.body;
    ctx.fillStyle = UITheme.colors.textSecondary;

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
    ctx.fillStyle = UITheme.colors.textPrimary;
    ctx.font = UITheme.fonts.subheading;
    ctx.fillText("Permanent Ledger", leftX, rowY);
    rowY += 40;
    ctx.font = UITheme.fonts.bodySmall;
    ctx.fillStyle = UITheme.colors.textSecondary;

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
    ctx.font = UITheme.fonts.bodySmall;
    ctx.fillStyle = UITheme.colors.textMuted;
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
}
