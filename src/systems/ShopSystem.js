import { GameIdentity } from "../config/GameIdentity.js";
import { CharacterSelectSystem } from "./CharacterSelectSystem.js";
import { UITheme, drawButton as drawThemeButton, drawPanel, drawTextShadow, drawWrappedText as wrapThemeText } from "../config/UITheme.js";

export class ShopSystem {
  constructor(context, width, height) {
    this.context = context;
    this.width = width;
    this.height = height;
    this.upgradeButtons = [];
    this.characterSelect = new CharacterSelectSystem(context, width);
    this.startRunButton = {
      x: width / 2 - 220,
      y: height - 130,
      width: 440,
      height: 88,
      label: GameIdentity.startRunLabel,
    };
    this.resetSaveButton = {
      x: 48,
      y: height - 88,
      width: 260,
      height: 56,
      label: "RESET SAVE",
    };
    this.backButton = {
      x: 48,
      y: 48,
      width: 260,
      height: 56,
      label: "BACK",
    };
  }

  update(input, saveData, metaUpgradeSystem, saveSystem, options = {}) {
    const { mode = "preRun" } = options;

    if (mode === "preRun") {
      const characterAction = this.characterSelect.update(input, saveData);

      if (characterAction === "select") {
        saveSystem.save(saveData);
        return "selectCharacter";
      }
    }

    this.upgradeButtons = this.buildUpgradeButtons(metaUpgradeSystem.getShopEntries(saveData), mode);
    const clicked = input.consumeClick();

    if (clicked) {
      if (mode === "pause" && input.isMouseOver(this.backButton)) {
        return "back";
      }

      for (const button of this.upgradeButtons) {
        if (input.isMouseOver(button) && metaUpgradeSystem.canPurchase(saveData, button.upgradeId)) {
          metaUpgradeSystem.purchase(saveData, button.upgradeId);
          saveSystem.save(saveData);
          return "purchase";
        }
      }

      if (input.isMouseOver(this.startRunButton)) {
        return mode === "pause" ? "back" : "startRun";
      }

      if (mode === "preRun" && input.isMouseOver(this.resetSaveButton)) {
        Object.assign(saveData, saveSystem.reset());
        return "reset";
      }
    }

    if (input.wasActionJustPressed()) {
      return mode === "pause" ? "back" : "startRun";
    }

    return null;
  }

  draw(input, saveData, metaUpgradeSystem, options = {}) {
    const { mode = "preRun" } = options;
    const ctx = this.context;
    const entries = metaUpgradeSystem.getShopEntries(saveData);

    ctx.save();
    ctx.fillStyle = mode === "pause" ? "rgba(18, 24, 35, 0.94)" : "#121823";
    ctx.fillRect(0, 0, this.width, this.height);

    const background = ctx.createLinearGradient(0, 0, this.width, this.height);
    background.addColorStop(0, mode === "pause" ? "#141028" : "#121823");
    background.addColorStop(0.5, mode === "pause" ? "#1a1838" : "#1a2430");
    background.addColorStop(1, mode === "pause" ? "#241812" : "#241812");
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.font = UITheme.fonts.title;
    drawTextShadow(ctx, GameIdentity.shopTitle, this.width / 2, 42, {
      fillStyle: UITheme.colors.textPrimary,
      align: "center",
    });

    ctx.font = UITheme.fonts.heading;
    ctx.fillStyle = UITheme.colors.accent;
    ctx.fillText(`${GameIdentity.memoryCoinLabel}: ${saveData.totalCoins}`, this.width / 2, 128);

    ctx.font = UITheme.fonts.body;
    ctx.fillStyle = UITheme.colors.textMuted;
    ctx.fillText(
      mode === "pause"
        ? "Patrol paused — spend memory coins, then resume."
        : GameIdentity.shopSubtitle,
      this.width / 2,
      172,
    );

    this.upgradeButtons = this.buildUpgradeButtons(entries, mode);

    if (mode === "preRun") {
      this.characterSelect.draw(input, saveData);
    }

    this.drawUpgradeCards(entries, this.upgradeButtons);

    const primaryButton = {
      ...this.startRunButton,
      label: mode === "pause" ? "RESUME PATROL" : this.startRunButton.label,
    };
    this.drawActionButton(primaryButton, input.isMouseOver(this.startRunButton));

    if (mode === "pause") {
      this.drawBackButton(this.backButton, input.isMouseOver(this.backButton));
    } else {
      this.drawResetButton(this.resetSaveButton);
    }

    ctx.font = UITheme.fonts.body;
    ctx.fillStyle = UITheme.colors.textSecondary;
    ctx.fillText(
      mode === "pause"
        ? "Click an upgrade to purchase   ·   Enter or click RESUME PATROL"
        : GameIdentity.shopHint,
      this.width / 2,
      this.height - 34,
    );
    ctx.restore();
  }

  buildUpgradeButtons(entries, mode = "preRun") {
    const buttons = [];
    const cardWidth = 560;
    const cardHeight = 148;
    const gapX = 40;
    const gapY = 24;
    const gridWidth = cardWidth * 2 + gapX;
    const startX = (this.width - gridWidth) / 2;
    const startY = mode === "preRun" ? 420 : 230;

    entries.forEach((entry, index) => {
      const column = index % 2;
      const row = Math.floor(index / 2);

      buttons.push({
        x: startX + column * (cardWidth + gapX),
        y: startY + row * (cardHeight + gapY),
        width: cardWidth,
        height: cardHeight,
        upgradeId: entry.id,
      });
    });

    return buttons;
  }

  drawUpgradeCards(entries, buttons) {
    entries.forEach((entry, index) => {
      this.drawUpgradeCard(entry, buttons[index]);
    });
  }

  drawUpgradeGrid(entries) {
    const buttons = this.buildUpgradeButtons(entries);

    this.drawUpgradeCards(entries, buttons);
    return buttons;
  }

  drawUpgradeCard(entry, card) {
    const ctx = this.context;
    const buyButton = {
      x: card.x + card.width - 148,
      y: card.y + card.height - 54,
      width: 118,
      height: 42,
    };

    drawPanel(ctx, card.x, card.y, card.width, card.height, {
      fillStyle: UITheme.colors.panelBgLight,
      borderColor: entry.isMaxed ? UITheme.colors.accent : UITheme.colors.border,
      borderWidth: 2,
    });

    ctx.textAlign = "left";
    ctx.fillStyle = UITheme.colors.textPrimary;
    ctx.font = UITheme.fonts.heading;
    ctx.fillText(entry.name, card.x + 22, card.y + 18);

    if (entry.optional) {
      ctx.fillStyle = UITheme.colors.textMuted;
      ctx.font = UITheme.fonts.label;
      ctx.fillText("OPTIONAL", card.x + 22, card.y + 52);
    }

    ctx.fillStyle = UITheme.colors.textSecondary;
    ctx.font = UITheme.fonts.bodySmall;
    wrapThemeText(ctx, entry.description, card.x + 22, card.y + (entry.optional ? 74 : 56), card.width - 44, 22, 3);

    ctx.fillStyle = entry.isMaxed ? UITheme.colors.accent : UITheme.colors.textMuted;
    ctx.font = UITheme.fonts.label;
    const levelText = entry.isMaxed ? "MAX LEVEL" : `Level ${entry.level}/${entry.maxLevel}`;
    ctx.fillText(levelText, card.x + 22, card.y + card.height - 28);

    drawThemeButton(ctx, buyButton, {
      hovered: entry.canBuy,
      label: entry.isMaxed ? "MAX" : `${entry.cost} G`,
      fontStyle: UITheme.fonts.label,
    });
    ctx.textAlign = "left";
  }

  drawActionButton(button, isHovered) {
    drawThemeButton(this.context, button, {
      hovered: isHovered,
      fontStyle: UITheme.fonts.buttonLarge,
    });
  }

  drawResetButton(button) {
    drawThemeButton(this.context, button, {
      hovered: false,
      danger: true,
      fontStyle: UITheme.fonts.label,
    });
  }

  drawBackButton(button, isHovered) {
    drawThemeButton(this.context, button, {
      hovered: isHovered,
      fontStyle: UITheme.fonts.label,
    });
  }
}
