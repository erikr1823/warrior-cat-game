import { GameIdentity } from "../config/GameIdentity.js";
import { CharacterSelectSystem } from "./CharacterSelectSystem.js";

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
    ctx.fillStyle = "#fff4dc";
    ctx.font = "900 72px 'Courier New', monospace";
    ctx.fillText(GameIdentity.shopTitle, this.width / 2, 42);

    ctx.font = "700 34px 'Courier New', monospace";
    ctx.fillStyle = "#ffe09a";
    ctx.fillText(`${GameIdentity.memoryCoinLabel}: ${saveData.totalCoins}`, this.width / 2, 128);

    ctx.font = "600 24px 'Courier New', monospace";
    ctx.fillStyle = "#9eb0aa";
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

    ctx.font = "700 24px 'Courier New', monospace";
    ctx.fillStyle = "#d9e8e2";
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

    ctx.fillStyle = "rgba(10, 14, 18, 0.88)";
    ctx.fillRect(card.x, card.y, card.width, card.height);
    ctx.strokeStyle = entry.isMaxed ? "#ffe09a" : "#c8914d";
    ctx.lineWidth = 3;
    ctx.strokeRect(card.x, card.y, card.width, card.height);

    ctx.textAlign = "left";
    ctx.fillStyle = "#fff4dc";
    ctx.font = "900 28px 'Courier New', monospace";
    ctx.fillText(entry.name, card.x + 22, card.y + 18);

    if (entry.optional) {
      ctx.fillStyle = "#9eb0aa";
      ctx.font = "700 16px 'Courier New', monospace";
      ctx.fillText("OPTIONAL", card.x + 22, card.y + 52);
    }

    ctx.fillStyle = "#d9e8e2";
    ctx.font = "600 22px 'Courier New', monospace";
    ctx.fillText(entry.description, card.x + 22, card.y + (entry.optional ? 74 : 56));

    ctx.fillStyle = entry.isMaxed ? "#ffe09a" : "#9eb0aa";
    ctx.font = "700 20px 'Courier New', monospace";
    const levelText = entry.isMaxed ? "MAX LEVEL" : `Level ${entry.level}/${entry.maxLevel}`;
    ctx.fillText(levelText, card.x + 22, card.y + card.height - 28);

    ctx.fillStyle = entry.canBuy ? "#2a2118" : "#1a1418";
    ctx.fillRect(buyButton.x, buyButton.y, buyButton.width, buyButton.height);
    ctx.strokeStyle = entry.canBuy ? "#ffd27e" : "#6a5a48";
    ctx.lineWidth = 2;
    ctx.strokeRect(buyButton.x, buyButton.y, buyButton.width, buyButton.height);

    ctx.textAlign = "center";
    ctx.fillStyle = entry.isMaxed ? "#ffe09a" : entry.canBuy ? "#ffe09a" : "#8a7a68";
    ctx.font = "800 18px 'Courier New', monospace";
    ctx.fillText(
      entry.isMaxed ? "MAX" : `${entry.cost} G`,
      buyButton.x + buyButton.width / 2,
      buyButton.y + 11,
    );
    ctx.textAlign = "left";
  }

  drawActionButton(button, isHovered) {
    const ctx = this.context;

    ctx.fillStyle = "#0b0e14";
    ctx.fillRect(button.x + 8, button.y + 8, button.width, button.height);
    ctx.fillStyle = isHovered ? "#ffe09a" : "#b94f42";
    ctx.fillRect(button.x, button.y, button.width, button.height);
    ctx.fillStyle = isHovered ? "#55323a" : "#2a1e28";
    ctx.fillRect(button.x + 10, button.y + 10, button.width - 20, button.height - 20);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "900 36px 'Courier New', monospace";
    ctx.fillStyle = isHovered ? "#fff6d4" : "#ffe09a";
    ctx.fillText(button.label, button.x + button.width / 2, button.y + button.height / 2);
  }

  drawResetButton(button) {
    const ctx = this.context;

    ctx.fillStyle = "rgba(20, 12, 16, 0.92)";
    ctx.fillRect(button.x, button.y, button.width, button.height);
    ctx.strokeStyle = "#8a4a4a";
    ctx.lineWidth = 2;
    ctx.strokeRect(button.x, button.y, button.width, button.height);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "800 20px 'Courier New', monospace";
    ctx.fillStyle = "#ff9a9a";
    ctx.fillText(button.label, button.x + button.width / 2, button.y + button.height / 2);
  }

  drawBackButton(button, isHovered) {
    const ctx = this.context;

    ctx.fillStyle = isHovered ? "rgba(30, 24, 36, 0.96)" : "rgba(20, 16, 28, 0.92)";
    ctx.fillRect(button.x, button.y, button.width, button.height);
    ctx.strokeStyle = isHovered ? "#ffd27e" : "#8a7a68";
    ctx.lineWidth = 2;
    ctx.strokeRect(button.x, button.y, button.width, button.height);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "800 20px 'Courier New', monospace";
    ctx.fillStyle = isHovered ? "#fff4dc" : "#d9e8e2";
    ctx.fillText(button.label, button.x + button.width / 2, button.y + button.height / 2);
  }
}
