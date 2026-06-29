import { getCharacterDefinition, PLAYABLE_CHARACTERS } from "../config/CharacterDefinitions.js";
import { GameConfig } from "../config/GameConfig.js";

export class CharacterSelectSystem {
  constructor(context, width) {
    this.context = context;
    this.width = width;
    this.characterButtons = [];
    this.previews = {};

    for (const character of PLAYABLE_CHARACTERS) {
      const image = new Image();
      image.src = GameConfig.player.spriteSets[character.id].preview;
      this.previews[character.id] = image;
    }
  }

  getSelectedCharacterId(saveData) {
    return saveData.selectedCharacter ?? "puzas";
  }

  update(input, saveData) {
    this.characterButtons = this.buildCharacterButtons();

    for (const button of this.characterButtons) {
      if (input.isMouseOver(button) && input.consumeClick()) {
        saveData.selectedCharacter = button.characterId;
        return "select";
      }
    }

    return null;
  }

  draw(input, saveData) {
    const ctx = this.context;
    const selectedId = this.getSelectedCharacterId(saveData);
    this.characterButtons = this.buildCharacterButtons();

    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#fff4dc";
    ctx.font = "900 34px 'Courier New', monospace";
    ctx.fillText("CHOOSE YOUR KEEPER", this.width / 2, 206);

    for (const button of this.characterButtons) {
      const character = getCharacterDefinition(button.characterId);
      const isSelected = button.characterId === selectedId;
      const isHovered = input.isMouseOver(button);
      this.drawCharacterCard(button, character, isSelected, isHovered);
    }
  }

  buildCharacterButtons() {
    const cardWidth = 500;
    const cardHeight = 132;
    const gap = 28;
    const totalWidth = cardWidth * 3 + gap * 2;
    const startX = (this.width - totalWidth) / 2;
    const y = 252;

    return PLAYABLE_CHARACTERS.map((character, index) => ({
      characterId: character.id,
      x: startX + index * (cardWidth + gap),
      y,
      width: cardWidth,
      height: cardHeight,
    }));
  }

  drawCharacterCard(button, character, isSelected, isHovered) {
    const ctx = this.context;
    const accent = character.accent ?? "#ffd27e";
    const preview = this.previews[character.id];

    ctx.fillStyle = isSelected ? "rgba(24, 20, 32, 0.96)" : "rgba(10, 14, 18, 0.88)";
    ctx.fillRect(button.x, button.y, button.width, button.height);
    ctx.strokeStyle = isSelected ? accent : isHovered ? "#ffd27e" : "#6a5a48";
    ctx.lineWidth = isSelected ? 4 : 3;
    ctx.strokeRect(button.x, button.y, button.width, button.height);

    if (preview?.complete && preview.naturalWidth > 0) {
      ctx.imageSmoothingEnabled = false;
      const previewHeight = 96;
      const previewWidth = (preview.naturalWidth / preview.naturalHeight) * previewHeight;
      ctx.drawImage(
        preview,
        button.x + 18,
        button.y + (button.height - previewHeight) / 2,
        previewWidth,
        previewHeight,
      );
    }

    ctx.textAlign = "left";
    ctx.fillStyle = "#fff4dc";
    ctx.font = "900 26px 'Courier New', monospace";
    ctx.fillText(character.name, button.x + 118, button.y + 22);

    ctx.fillStyle = accent;
    ctx.font = "700 18px 'Courier New', monospace";
    ctx.fillText(character.title.toUpperCase(), button.x + 118, button.y + 52);

    ctx.fillStyle = "#d9e8e2";
    ctx.font = "600 18px 'Courier New', monospace";
    this.drawWrappedText(character.description, button.x + 118, button.y + 78, button.width - 136, 22);

    if (isSelected) {
      ctx.textAlign = "right";
      ctx.fillStyle = accent;
      ctx.font = "800 16px 'Courier New', monospace";
      ctx.fillText("SELECTED", button.x + button.width - 16, button.y + 18);
    }
  }

  drawWrappedText(text, x, y, maxWidth, lineHeight) {
    const ctx = this.context;
    const words = text.split(" ");
    let line = "";
    let drawY = y;

    for (const word of words) {
      const testLine = line.length > 0 ? `${line} ${word}` : word;
      const width = ctx.measureText(testLine).width;

      if (width > maxWidth && line.length > 0) {
        ctx.fillText(line, x, drawY);
        line = word;
        drawY += lineHeight;
      } else {
        line = testLine;
      }
    }

    if (line.length > 0) {
      ctx.fillText(line, x, drawY);
    }
  }
}
