import { GameConfig } from "../config/GameConfig.js";

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

export class MenuSystem {
  constructor(context, width, height) {
    this.context = context;
    this.width = width;
    this.height = height;
    this.background = new Image();
    this.background.src = GameConfig.menu.fallbackImage;
    this.backgroundVideos = [this.createBackgroundVideo(), this.createBackgroundVideo()];
    this.activeVideoIndex = 0;
    this.loopCrossfadeActive = false;
    this.startButton = {
      x: width / 2 - 210,
      y: 768,
      width: 420,
      height: 104,
      label: "START RUN",
    };
    this.creditsButton = {
      x: width / 2 - 180,
      y: 888,
      width: 360,
      height: 56,
      label: "CREDITS",
    };
    this.backButton = {
      x: width / 2 - 160,
      y: 780,
      width: 320,
      height: 64,
      label: "BACK",
    };
    this.page = "main";
    this.creditPhotos = {
      erik: this.loadCreditPhoto("./src/assets/credits/erik-rivera.png"),
      bruce: this.loadCreditPhoto("./src/assets/credits/bruce-odin-minnie.png"),
      bailey: this.loadCreditPhoto("./src/assets/credits/bailey.png"),
    };
  }

  createBackgroundVideo() {
    const video = document.createElement("video");
    video.src = GameConfig.menu.video;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.play().catch(() => {});
    return video;
  }

  getActiveBackgroundVideo() {
    return this.backgroundVideos[this.activeVideoIndex];
  }

  getInactiveBackgroundVideo() {
    return this.backgroundVideos[1 - this.activeVideoIndex];
  }

  updateBackgroundVideoLoop() {
    const crossfadeDuration = GameConfig.menu.loopCrossfade ?? 0;
    if (crossfadeDuration <= 0) {
      return 1;
    }

    const active = this.getActiveBackgroundVideo();
    const inactive = this.getInactiveBackgroundVideo();
    const duration = active.duration;

    if (!Number.isFinite(duration) || duration <= 0) {
      return 1;
    }

    const timeRemaining = duration - active.currentTime;

    if (timeRemaining <= crossfadeDuration && !this.loopCrossfadeActive) {
      this.loopCrossfadeActive = true;
      inactive.currentTime = 0;
      inactive.play().catch(() => {});
    }

    if (this.loopCrossfadeActive) {
      const blend = clamp01(1 - timeRemaining / crossfadeDuration);

      if (blend >= 0.999 || active.ended) {
        inactive.play().catch(() => {});
        active.pause();
        active.currentTime = 0;
        this.activeVideoIndex = 1 - this.activeVideoIndex;
        this.loopCrossfadeActive = false;
        return 1;
      }

      return 1 - blend;
    }

    return 1;
  }

  loadCreditPhoto(src) {
    const image = new Image();
    image.src = src;
    return image;
  }

  update(input) {
    if (this.page === "credits") {
      const backHovered = input.isMouseOver(this.backButton);
      const clicked = input.consumeClick();

      if (
        input.wasPauseJustPressed() ||
        input.wasActionJustPressed() ||
        (backHovered && clicked)
      ) {
        this.page = "main";
      }

      return false;
    }

    const startHovered = input.isMouseOver(this.startButton);
    const creditsHovered = input.isMouseOver(this.creditsButton);
    const clicked = input.consumeClick();

    if (creditsHovered && clicked) {
      this.page = "credits";
      return false;
    }

    return input.wasActionJustPressed() || (startHovered && clicked);
  }

  draw(input) {
    const ctx = this.context;
    const startHovered = input.isMouseOver(this.startButton);
    const creditsHovered = input.isMouseOver(this.creditsButton);

    ctx.save();
    ctx.imageSmoothingEnabled = true;
    this.drawMenuBackground();
    this.drawVignette();

    if (this.page === "credits") {
      this.drawCreditsOverlay(input);
      ctx.restore();
      return;
    }

    this.drawButton(this.startButton, startHovered);
    this.drawSecondaryButton(this.creditsButton, creditsHovered);
    this.drawHint();
    ctx.restore();
  }

  drawCreditsOverlay(input) {
    const ctx = this.context;
    const centerX = this.width / 2;
    const panel = {
      x: centerX - 480,
      y: 200,
      width: 960,
      height: 640,
    };
    const backHovered = input.isMouseOver(this.backButton);
    const photoBox = { width: 96, height: 96 };
    const columns = [
      {
        x: centerX - 280,
        role: "CREATED BY",
        name: "Erik Rivera",
        photo: this.creditPhotos.erik,
      },
      {
        x: centerX,
        role: "WITH HELP FROM",
        name: "Bruce Odin Minnie",
        photo: this.creditPhotos.bruce,
      },
      {
        x: centerX + 280,
        role: "",
        name: "Baliey",
        photo: this.creditPhotos.bailey,
      },
    ];

    ctx.fillStyle = "rgba(5, 8, 13, 0.62)";
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.fillStyle = "rgba(15, 18, 24, 0.97)";
    ctx.fillRect(panel.x, panel.y, panel.width, panel.height);
    ctx.strokeStyle = "#ffd27e";
    ctx.lineWidth = 5;
    ctx.strokeRect(panel.x, panel.y, panel.width, panel.height);

    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#fff4dc";
    ctx.font = "900 56px 'Courier New', monospace";
    ctx.fillText("CREDITS", centerX, panel.y + 32);

    ctx.font = "600 22px 'Courier New', monospace";
    ctx.fillStyle = "#9eb0aa";
    ctx.fillText("Warrior Cat Game Test", centerX, panel.y + 102);

    ctx.strokeStyle = "rgba(255, 210, 126, 0.35)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(panel.x + 48, panel.y + 142);
    ctx.lineTo(panel.x + panel.width - 48, panel.y + 142);
    ctx.stroke();

    const photoTop = panel.y + 188;
    const nameTop = panel.y + 308;

    for (const column of columns) {
      if (column.role) {
        ctx.font = "700 18px 'Courier New', monospace";
        ctx.fillStyle = "#9eb0aa";
        ctx.fillText(column.role, column.x, panel.y + 156);
      }

      this.drawCreditPhoto(column.photo, column.x, photoTop, photoBox.width, photoBox.height);

      ctx.font = column.role ? "700 26px 'Courier New', monospace" : "600 26px 'Courier New', monospace";
      ctx.fillStyle = column.role ? "#ffe09a" : "#d9e8e2";
      ctx.fillText(column.name, column.x, nameTop);
    }

    ctx.font = "600 22px 'Courier New', monospace";
    ctx.fillStyle = "#9eb0aa";
    ctx.fillText("Thank you for playing.", centerX, panel.y + 392);

    ctx.font = "600 18px 'Courier New', monospace";
    ctx.fillStyle = "#7a8a86";
    ctx.fillText("Music: King's Feast by RandomMind (CC0)", centerX, panel.y + 430);

    this.backButton.y = panel.y + 468;
    this.drawSecondaryButton(this.backButton, backHovered);

    ctx.font = "700 20px 'Courier New', monospace";
    ctx.fillStyle = "#7a8a86";
    ctx.fillText("ESC / ENTER / CLICK BACK", centerX, panel.y + panel.height - 36);
  }

  drawCreditPhoto(photo, centerX, topY, maxWidth, maxHeight) {
    const ctx = this.context;
    const pad = 4;
    const frameX = centerX - maxWidth / 2 - pad;
    const frameY = topY - pad;
    const frameWidth = maxWidth + pad * 2;
    const frameHeight = maxHeight + pad * 2;

    ctx.fillStyle = "#0b0e14";
    ctx.fillRect(frameX, frameY, frameWidth, frameHeight);
    ctx.strokeStyle = "#ffd27e";
    ctx.lineWidth = 2;
    ctx.strokeRect(frameX, frameY, frameWidth, frameHeight);

    if (!photo?.complete || photo.naturalWidth <= 0) {
      return;
    }

    const scale = Math.min(maxWidth / photo.naturalWidth, maxHeight / photo.naturalHeight);
    const drawWidth = photo.naturalWidth * scale;
    const drawHeight = photo.naturalHeight * scale;
    const x = centerX - drawWidth / 2;
    const y = topY + (maxHeight - drawHeight) / 2;

    ctx.drawImage(photo, x, y, drawWidth, drawHeight);
  }

  drawSecondaryButton(button, isHovered) {
    const ctx = this.context;

    ctx.fillStyle = "#0b0e14";
    ctx.fillRect(button.x + 6, button.y + 6, button.width, button.height);

    ctx.fillStyle = isHovered ? "#ffe09a" : "#4a7058";
    ctx.fillRect(button.x, button.y, button.width, button.height);

    ctx.fillStyle = "#2a1e28";
    ctx.fillRect(button.x + 8, button.y + 8, button.width - 16, button.height - 16);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "900 28px 'Courier New', monospace";
    ctx.fillStyle = isHovered ? "#fff6d4" : "#ffe09a";
    ctx.fillText(button.label, button.x + button.width / 2, button.y + button.height / 2);
  }

  drawMenuBackground() {
    const ctx = this.context;
    const activeVideo = this.getActiveBackgroundVideo();

    if (activeVideo.readyState >= 2) {
      if (activeVideo.paused) {
        activeVideo.play().catch(() => {});
      }

      const activeOpacity = this.updateBackgroundVideoLoop();
      const crossfadeDuration = GameConfig.menu.loopCrossfade ?? 0;

      if (crossfadeDuration > 0 && activeOpacity < 1) {
        const inactiveVideo = this.getInactiveBackgroundVideo();
        ctx.globalAlpha = activeOpacity;
        this.drawMediaFill(ctx, activeVideo);
        ctx.globalAlpha = 1 - activeOpacity;
        this.drawMediaFill(ctx, inactiveVideo);
        ctx.globalAlpha = 1;
        return;
      }

      this.drawMediaFill(ctx, activeVideo);
      return;
    }

    if (this.background.complete && this.background.naturalWidth > 0) {
      this.drawMediaFill(ctx, this.background);
      return;
    }

    const gradient = ctx.createLinearGradient(0, 0, this.width, this.height);
    gradient.addColorStop(0, "#141028");
    gradient.addColorStop(0.45, "#1c1840");
    gradient.addColorStop(1, "#241812");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  drawMediaFill(ctx, media) {
    const sourceWidth = media.videoWidth || media.naturalWidth;
    const sourceHeight = media.videoHeight || media.naturalHeight;

    if (sourceWidth <= 0 || sourceHeight <= 0) {
      return;
    }

    const crop = GameConfig.menu.backgroundCrop;
    const cropWidth = Math.max(1, sourceWidth - crop.right);
    const cropHeight = Math.max(1, sourceHeight - crop.bottom);

    ctx.drawImage(media, 0, 0, cropWidth, cropHeight, 0, 0, this.width, this.height);
  }

  drawVignette() {
    const ctx = this.context;

    ctx.fillStyle = "rgba(5, 8, 13, 0.1)";
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.fillStyle = "rgba(5, 8, 13, 0.35)";
    ctx.fillRect(0, 900, this.width, 180);
  }

  drawButton(button, isHovered) {
    const ctx = this.context;
    const inset = isHovered ? 0 : 8;

    ctx.fillStyle = "#0b0e14";
    ctx.fillRect(button.x + 14, button.y + 14, button.width, button.height);

    ctx.fillStyle = isHovered ? "#ffe09a" : "#b94f42";
    ctx.fillRect(button.x, button.y, button.width, button.height);

    ctx.fillStyle = isHovered ? "#55323a" : "#2a1e28";
    ctx.fillRect(button.x + 10, button.y + 10, button.width - 20, button.height - 20);

    ctx.fillStyle = isHovered ? "#fff6d4" : "#ffe09a";
    ctx.fillRect(button.x + inset, button.y + inset, button.width - inset * 2, 8);
    ctx.fillRect(button.x + inset, button.y + button.height - inset - 8, button.width - inset * 2, 8);
    ctx.fillRect(button.x + inset, button.y + inset, 8, button.height - inset * 2);
    ctx.fillRect(button.x + button.width - inset - 8, button.y + inset, 8, button.height - inset * 2);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "900 42px 'Courier New', monospace";
    ctx.fillStyle = "#080a0f";
    ctx.fillText(button.label, button.x + button.width / 2 + 4, button.y + button.height / 2 + 5);
    ctx.fillStyle = isHovered ? "#fff6d4" : "#ffe09a";
    ctx.fillText(button.label, button.x + button.width / 2, button.y + button.height / 2);
  }

  drawHint() {
    const ctx = this.context;

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "700 30px 'Courier New', monospace";
    ctx.fillStyle = "#080a0f";
    ctx.fillText("WASD / ARROWS TO MOVE   -   ENTER OR CLICK TO START", this.width / 2 + 3, 972 + 3);
    ctx.fillStyle = "#fff6d4";
    ctx.fillText("WASD / ARROWS TO MOVE   -   ENTER OR CLICK TO START", this.width / 2, 972);
  }
}
