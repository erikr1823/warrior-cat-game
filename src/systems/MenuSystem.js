import { GameConfig } from "../config/GameConfig.js";
import { GameIdentity } from "../config/GameIdentity.js";
import { formatTime } from "../core/MathUtils.js";
import { UITheme, drawButton as drawThemeButton, drawPanel, drawTextShadow } from "../config/UITheme.js";

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
    this.leaderboardButton = {
      x: width / 2 - 380,
      y: 888,
      width: 360,
      height: 56,
      label: "LEADERBOARDS",
    };
    this.creditsButton = {
      x: width / 2 + 20,
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
    this.leaderboard = null;
    this.leaderboardEntries = [];
    this.leaderboardStatus = "";
    this.leaderboardLoading = false;
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
    if (this.page === "credits" || this.page === "leaderboard") {
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
    const leaderboardHovered = input.isMouseOver(this.leaderboardButton);
    const clicked = input.consumeClick();

    if (clicked && leaderboardHovered) {
      this.page = "leaderboard";
      this.loadLeaderboard();
      return false;
    }

    if (clicked && creditsHovered) {
      this.page = "credits";
      return false;
    }

    return input.wasActionJustPressed() || (startHovered && clicked);
  }

  async loadLeaderboard() {
    if (!this.leaderboard || !this.leaderboard.isConfigured()) {
      this.leaderboardEntries = [];
      this.leaderboardLoading = false;
      this.leaderboardStatus = "Leaderboard not configured yet";
      return;
    }

    // Show cached scores instantly (no loading flash), then refresh in background.
    const cached = this.leaderboard.getCachedScores();

    if (cached) {
      this.leaderboardEntries = cached;
      this.leaderboardStatus = cached.length === 0 ? "No scores yet. Be the first!" : "";
      this.leaderboardLoading = false;
    } else {
      this.leaderboardLoading = true;
      this.leaderboardStatus = "";
      this.leaderboardEntries = [];
    }

    const result = await this.leaderboard.getTopScores(10);

    // Ignore late responses if the player already left the page.
    if (this.page !== "leaderboard") {
      return;
    }

    this.leaderboardLoading = false;

    if (result.ok) {
      this.leaderboardEntries = result.scores;
      this.leaderboardStatus = result.scores.length === 0 ? "No scores yet. Be the first!" : "";
    } else if (this.leaderboardEntries.length === 0) {
      // Only surface the error if we have nothing cached to show.
      this.leaderboardStatus = "Could not load leaderboard";
    }
  }

  draw(input) {
    const ctx = this.context;
    const startHovered = input.isMouseOver(this.startButton);
    const creditsHovered = input.isMouseOver(this.creditsButton);
    const leaderboardHovered = input.isMouseOver(this.leaderboardButton);

    ctx.save();
    ctx.imageSmoothingEnabled = true;
    this.drawMenuBackground();
    this.drawVignette();

    if (this.page === "credits") {
      this.drawCreditsOverlay(input);
      ctx.restore();
      return;
    }

    if (this.page === "leaderboard") {
      this.drawLeaderboardOverlay(input);
      ctx.restore();
      return;
    }

    this.drawButton(this.startButton, startHovered);
    this.drawSecondaryButton(this.leaderboardButton, leaderboardHovered);
    this.drawSecondaryButton(this.creditsButton, creditsHovered);
    this.drawHint();
    ctx.restore();
  }

  drawLeaderboardOverlay(input) {
    const ctx = this.context;
    const centerX = this.width / 2;
    const panel = {
      x: centerX - 480,
      y: 160,
      width: 960,
      height: 720,
    };
    const backHovered = input.isMouseOver(this.backButton);

    ctx.fillStyle = UITheme.colors.overlay;
    ctx.fillRect(0, 0, this.width, this.height);

    drawPanel(ctx, panel.x, panel.y, panel.width, panel.height, {
      fillStyle: UITheme.colors.panelBg,
      borderColor: UITheme.colors.border,
      borderWidth: 3,
    });

    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.font = UITheme.fonts.titleSmall;
    drawTextShadow(ctx, "LEADERBOARD", centerX, panel.y + 28, {
      fillStyle: UITheme.colors.textPrimary,
      align: "center",
    });

    ctx.font = UITheme.fonts.body;
    ctx.fillStyle = UITheme.colors.textMuted;
    ctx.fillText("Top 10 — longest survival", centerX, panel.y + 96);

    ctx.strokeStyle = "rgba(255, 210, 126, 0.35)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(panel.x + 48, panel.y + 136);
    ctx.lineTo(panel.x + panel.width - 48, panel.y + 136);
    ctx.stroke();

    const leftX = panel.x + 64;
    let rowY = panel.y + 158;

    if (this.leaderboardLoading) {
      ctx.textAlign = "center";
      ctx.font = UITheme.fonts.body;
      ctx.fillStyle = UITheme.colors.textMuted;
      ctx.fillText("Loading...", centerX, rowY + 20);
    } else if (this.leaderboardStatus) {
      ctx.textAlign = "center";
      ctx.font = UITheme.fonts.body;
      ctx.fillStyle = this.leaderboardStatus.startsWith("Could not")
        ? UITheme.colors.warning
        : UITheme.colors.textMuted;
      ctx.fillText(this.leaderboardStatus, centerX, rowY + 20);
    } else {
      ctx.textAlign = "left";
      ctx.font = UITheme.fonts.body;

      this.leaderboardEntries.slice(0, 10).forEach((entry, index) => {
        const rank = `${index + 1}.`.padEnd(4, " ");
        const name = String(entry.player_name ?? "Player")
          .toUpperCase()
          .slice(0, 12)
          .padEnd(12, " ");
        const time = formatTime(entry.survival_time ?? 0).padStart(5, " ");
        const line = `${rank}${name}  ${time}   ${entry.kills ?? 0} kills   Lv ${entry.final_level ?? 1}`;
        ctx.fillStyle = index === 0 ? UITheme.colors.accent : UITheme.colors.textSecondary;
        ctx.fillText(line, leftX, rowY);
        rowY += 44;
      });
    }

    this.backButton.y = panel.y + panel.height - 96;
    this.drawSecondaryButton(this.backButton, backHovered);

    ctx.textAlign = "center";
    ctx.font = UITheme.fonts.bodySmall;
    ctx.fillStyle = UITheme.colors.textDim;
    ctx.fillText("ESC / ENTER / CLICK BACK", centerX, panel.y + panel.height - 32);
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

    ctx.fillStyle = UITheme.colors.overlay;
    ctx.fillRect(0, 0, this.width, this.height);

    drawPanel(ctx, panel.x, panel.y, panel.width, panel.height, {
      fillStyle: UITheme.colors.panelBg,
      borderColor: UITheme.colors.border,
      borderWidth: 3,
    });

    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.font = UITheme.fonts.titleSmall;
    drawTextShadow(ctx, "CREDITS", centerX, panel.y + 32, {
      fillStyle: UITheme.colors.textPrimary,
      align: "center",
    });

    ctx.font = UITheme.fonts.body;
    ctx.fillStyle = UITheme.colors.textMuted;
    ctx.fillText(GameIdentity.title, centerX, panel.y + 102);

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
        ctx.font = UITheme.fonts.label;
        ctx.fillStyle = UITheme.colors.textMuted;
        ctx.fillText(column.role, column.x, panel.y + 156);
      }

      this.drawCreditPhoto(column.photo, column.x, photoTop, photoBox.width, photoBox.height);

      ctx.font = column.role ? UITheme.fonts.subheading : UITheme.fonts.body;
      ctx.fillStyle = column.role ? UITheme.colors.accent : UITheme.colors.textSecondary;
      ctx.fillText(column.name, column.x, nameTop);
    }

    ctx.font = UITheme.fonts.body;
    ctx.fillStyle = UITheme.colors.textMuted;
    ctx.fillText("Thank you for playing.", centerX, panel.y + 392);

    ctx.font = UITheme.fonts.bodySmall;
    ctx.fillStyle = UITheme.colors.textDim;
    ctx.fillText("Music: King's Feast by RandomMind (CC0)", centerX, panel.y + 430);

    this.backButton.y = panel.y + 468;
    this.drawSecondaryButton(this.backButton, backHovered);

    ctx.font = UITheme.fonts.bodySmall;
    ctx.fillStyle = UITheme.colors.textDim;
    ctx.fillText("ESC / ENTER / CLICK BACK", centerX, panel.y + panel.height - 36);
  }

  drawCreditPhoto(photo, centerX, topY, maxWidth, maxHeight) {
    const ctx = this.context;
    const pad = 4;
    const frameX = centerX - maxWidth / 2 - pad;
    const frameY = topY - pad;
    const frameWidth = maxWidth + pad * 2;
    const frameHeight = maxHeight + pad * 2;

    drawPanel(ctx, frameX, frameY, frameWidth, frameHeight, {
      fillStyle: UITheme.colors.buttonShadow,
      borderColor: UITheme.colors.border,
      borderWidth: 2,
      cornerAccent: false,
    });

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
    drawThemeButton(this.context, button, {
      hovered: isHovered,
      fontStyle: UITheme.fonts.button,
    });
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
    drawThemeButton(this.context, button, {
      hovered: isHovered,
      fontStyle: UITheme.fonts.buttonLarge,
    });
  }

  drawHint() {
    const ctx = this.context;

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = UITheme.fonts.body;
    drawTextShadow(ctx, "WASD / ARROWS TO MOVE   ·   ENTER OR CLICK TO START", this.width / 2, 972, {
      fillStyle: UITheme.colors.accentBright,
      align: "center",
      baseline: "middle",
    });
  }
}
