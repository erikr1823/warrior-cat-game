import { getCharacterDefinition, PLAYABLE_CHARACTERS } from "../config/CharacterDefinitions.js";
import { GameConfig } from "../config/GameConfig.js";
import { UITheme, drawPanel, drawTextShadow, drawWrappedText as wrapThemeText } from "../config/UITheme.js";

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
    ctx.font = UITheme.fonts.heading;
    drawTextShadow(ctx, "CHOOSE YOUR KEEPER", this.width / 2, 206, {
      fillStyle: UITheme.colors.textPrimary,
      align: "center",
    });

    for (const button of this.characterButtons) {
      const character = getCharacterDefinition(button.characterId);
      const isSelected = button.characterId === selectedId;
      const isHovered = input.isMouseOver(button);
      this.drawCharacterCard(button, character, isSelected, isHovered);
    }
  }

  buildCharacterButtons() {
    const cardWidth = 540;
    const cardHeight = 132;
    const gap = 36;
    const totalWidth = cardWidth * 2 + gap;
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
    const accent = character.accent ?? UITheme.colors.border;
    const preview = this.previews[character.id];

    drawPanel(ctx, button.x, button.y, button.width, button.height, {
      fillStyle: isSelected ? "rgba(24, 20, 32, 0.96)" : UITheme.colors.panelBgHud,
      borderColor: isSelected ? accent : isHovered ? UITheme.colors.border : UITheme.colors.borderSoft,
      borderWidth: isSelected ? 3 : 2,
      cornerAccent: false,
    });

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
    ctx.fillStyle = UITheme.colors.textPrimary;
    ctx.font = UITheme.fonts.subheading;
    ctx.fillText(character.name, button.x + 118, button.y + 22);

    ctx.fillStyle = accent;
    ctx.font = UITheme.fonts.label;
    ctx.fillText(character.title.toUpperCase(), button.x + 118, button.y + 52);

    ctx.fillStyle = UITheme.colors.textSecondary;
    ctx.font = UITheme.fonts.bodySmall;
    wrapThemeText(ctx, character.description, button.x + 118, button.y + 78, button.width - 136, 22, 2);

    if (isSelected) {
      ctx.textAlign = "right";
      ctx.fillStyle = accent;
      ctx.font = UITheme.fonts.label;
      ctx.fillText("SELECTED", button.x + button.width - 16, button.y + 18);
    }
  }
}
