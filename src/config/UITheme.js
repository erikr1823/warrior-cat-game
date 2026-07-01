/** Shared dark-fantasy UI palette, fonts, and canvas draw helpers. */

export const UITheme = {
  fonts: {
    title: "900 64px Cinzel, Georgia, 'Times New Roman', serif",
    titleMedium: "900 54px Cinzel, Georgia, 'Times New Roman', serif",
    titleSmall: "900 42px Cinzel, Georgia, 'Times New Roman', serif",
    heading: "700 28px Cinzel, Georgia, 'Times New Roman', serif",
    subheading: "700 22px Cinzel, Georgia, 'Times New Roman', serif",
    button: "800 28px Cinzel, Georgia, 'Times New Roman', serif",
    buttonLarge: "900 42px Cinzel, Georgia, 'Times New Roman', serif",
    body: "600 20px system-ui, -apple-system, 'Segoe UI', Arial, sans-serif",
    bodySmall: "500 16px system-ui, -apple-system, 'Segoe UI', Arial, sans-serif",
    label: "700 14px system-ui, -apple-system, 'Segoe UI', Arial, sans-serif",
    hud: "600 17px system-ui, -apple-system, 'Segoe UI', Arial, sans-serif",
    hudSmall: "600 14px system-ui, -apple-system, 'Segoe UI', Arial, sans-serif",
    debug: "500 14px system-ui, -apple-system, 'Segoe UI', Arial, sans-serif",
  },
  colors: {
    textPrimary: "#fff4dc",
    textSecondary: "#d9e8e2",
    textMuted: "#9eb0aa",
    textDim: "#7a8a86",
    accent: "#ffe09a",
    accentBright: "#fff6d4",
    border: "#ffd27e",
    borderSoft: "rgba(255, 222, 161, 0.32)",
    panelBg: "rgba(12, 14, 20, 0.92)",
    panelBgLight: "rgba(15, 18, 24, 0.88)",
    panelBgHud: "rgba(8, 10, 14, 0.78)",
    overlay: "rgba(5, 6, 9, 0.72)",
    shadow: "rgba(8, 9, 12, 0.85)",
    warning: "#e45a4f",
    success: "#5ed66f",
    xp: "#43a9ff",
    hpLow: "#e45a4f",
    hpMid: "#5ed66f",
    hpTrack: "#46262c",
    buttonPrimary: "#b94f42",
    buttonPrimaryHover: "#ffe09a",
    buttonSecondary: "#4a7058",
    buttonInner: "#2a1e28",
    buttonShadow: "#0b0e14",
    rarityCommon: "#9eb0aa",
    rarityRare: "#7ec8ff",
    rarityEpic: "#c89bff",
    rarityLegendary: "#ffe09a",
    rarityEvolved: "#ffb347",
    debug: "#a0ffa0",
  },
  spacing: {
    panelPad: 16,
    lineHeight: 28,
    lineHeightSmall: 22,
  },
};

export function font(size, weight = 600, family = "sans") {
  if (family === "serif") {
    return `${weight} ${size}px Cinzel, Georgia, 'Times New Roman', serif`;
  }

  return `${weight} ${size}px system-ui, -apple-system, 'Segoe UI', Arial, sans-serif`;
}

export function drawTextShadow(ctx, text, x, y, options = {}) {
  const {
    fillStyle = UITheme.colors.textPrimary,
    shadowColor = UITheme.colors.shadow,
    shadowX = 2,
    shadowY = 2,
    align = ctx.textAlign ?? "left",
    baseline = ctx.textBaseline ?? "top",
  } = options;

  ctx.save();
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.fillStyle = shadowColor;
  ctx.fillText(text, x + shadowX, y + shadowY);
  ctx.fillStyle = fillStyle;
  ctx.fillText(text, x, y);
  ctx.restore();
}

export function drawTextOutline(ctx, text, x, y, options = {}) {
  const {
    fillStyle = UITheme.colors.accent,
    strokeStyle = UITheme.colors.shadow,
    lineWidth = 3,
    align = ctx.textAlign ?? "left",
    baseline = ctx.textBaseline ?? "top",
  } = options;

  ctx.save();
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = strokeStyle;
  ctx.strokeText(text, x, y);
  ctx.fillStyle = fillStyle;
  ctx.fillText(text, x, y);
  ctx.restore();
}

export function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 99) {
  const words = String(text ?? "").split(" ");
  let line = "";
  let drawY = y;
  let linesDrawn = 0;

  for (const word of words) {
    const testLine = line.length > 0 ? `${line} ${word}` : word;
    const width = ctx.measureText(testLine).width;

    if (width > maxWidth && line.length > 0) {
      ctx.fillText(line, x, drawY);
      line = word;
      drawY += lineHeight;
      linesDrawn += 1;

      if (linesDrawn >= maxLines - 1) {
        line = `${line.slice(0, Math.max(0, maxWidth / 8))}…`;
        break;
      }
    } else {
      line = testLine;
    }
  }

  if (line.length > 0 && linesDrawn < maxLines) {
    ctx.fillText(line, x, drawY);
  }
}

export function drawPanel(ctx, x, y, width, height, options = {}) {
  const {
    fillStyle = UITheme.colors.panelBg,
    borderColor = UITheme.colors.borderSoft,
    borderWidth = 2,
    cornerAccent = true,
    accentColor = UITheme.colors.border,
  } = options;

  ctx.fillStyle = fillStyle;
  ctx.fillRect(x, y, width, height);

  if (borderWidth > 0) {
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderWidth;
    ctx.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1);
  }

  if (cornerAccent) {
    const corner = Math.min(14, width * 0.04, height * 0.08);
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.55;

    ctx.beginPath();
    ctx.moveTo(x + 6, y + 6 + corner);
    ctx.lineTo(x + 6, y + 6);
    ctx.lineTo(x + 6 + corner, y + 6);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + width - 6 - corner, y + 6);
    ctx.lineTo(x + width - 6, y + 6);
    ctx.lineTo(x + width - 6, y + 6 + corner);
    ctx.stroke();

    ctx.globalAlpha = 1;
  }
}

export function drawButton(ctx, button, options = {}) {
  const {
    hovered = false,
    pressed = false,
    danger = false,
    label = button.label ?? "",
    fontStyle = UITheme.fonts.button,
  } = options;

  const accent = danger
    ? hovered
      ? "#ff8a7a"
      : UITheme.colors.buttonPrimary
    : hovered
      ? UITheme.colors.buttonPrimaryHover
      : UITheme.colors.buttonSecondary;
  const inset = hovered || pressed ? 0 : 6;
  const yOffset = pressed ? 2 : 0;

  ctx.fillStyle = UITheme.colors.buttonShadow;
  ctx.fillRect(button.x + 5, button.y + 7 + yOffset, button.width, button.height);

  ctx.fillStyle = accent;
  ctx.fillRect(button.x, button.y + yOffset, button.width, button.height);

  ctx.fillStyle = hovered ? "#55323a" : UITheme.colors.buttonInner;
  ctx.fillRect(
    button.x + 8,
    button.y + 8 + yOffset,
    button.width - 16,
    button.height - 16,
  );

  if (!danger) {
    ctx.fillStyle = hovered ? UITheme.colors.accentBright : UITheme.colors.accent;
    ctx.fillRect(button.x + inset, button.y + inset + yOffset, button.width - inset * 2, 4);
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = fontStyle;
  drawTextShadow(ctx, label, button.x + button.width / 2, button.y + button.height / 2 + yOffset, {
    fillStyle: hovered ? UITheme.colors.accentBright : UITheme.colors.accent,
    shadowX: 2,
    shadowY: 2,
    align: "center",
    baseline: "middle",
  });
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
}

export function drawProgressBar(ctx, x, y, width, height, percent, options = {}) {
  const {
    trackColor = UITheme.colors.hpTrack,
    fillColor = UITheme.colors.success,
    borderColor = "rgba(8, 9, 12, 0.9)",
    shine = true,
    label = "",
    labelColor = UITheme.colors.textPrimary,
    fontStyle = UITheme.fonts.label,
  } = options;

  const clamped = Math.max(0, Math.min(1, percent));

  ctx.fillStyle = borderColor;
  ctx.fillRect(x - 3, y - 3, width + 6, height + 6);
  ctx.fillStyle = trackColor;
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = fillColor;
  ctx.fillRect(x, y, width * clamped, height);

  if (shine && clamped > 0) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
    ctx.fillRect(x, y, width * clamped, Math.max(4, height * 0.35));
  }

  if (label) {
    ctx.font = fontStyle;
    drawTextShadow(ctx, label, x + 8, y + Math.max(0, (height - 14) / 2 - 1), {
      fillStyle: labelColor,
      shadowX: 1,
      shadowY: 1,
    });
  }
}

export function getRarityColor(kind) {
  if (kind === "synergy" || kind === "evolution") {
    return UITheme.colors.rarityEvolved;
  }

  if (kind === "trait") {
    return UITheme.colors.rarityEpic;
  }

  if (kind === "weaponUpgrade" || kind === "passiveUpgrade") {
    return UITheme.colors.rarityRare;
  }

  return UITheme.colors.rarityCommon;
}
