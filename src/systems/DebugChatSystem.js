import { getGodModeStatusLabel, normalizeGodModeCommand } from "../debug/GodMode.js";

export class DebugChatSystem {
  constructor(context, width, height) {
    this.context = context;
    this.width = width;
    this.height = height;
    this.open = false;
    this.text = "";
    this.status = "";
    this.button = {
      x: 32,
      y: height - 124,
      width: 52,
      height: 44,
    };
    this.onKeyDown = this.onKeyDown.bind(this);
    this.activeGame = null;
  }

  isOpen() {
    return this.open;
  }

  openChat(game) {
    this.open = true;
    this.activeGame = game;
    this.text = "";
    window.addEventListener("keydown", this.onKeyDown, true);
  }

  closeChat() {
    this.open = false;
    this.activeGame = null;
    window.removeEventListener("keydown", this.onKeyDown, true);
  }

  onKeyDown(event) {
    if (!this.open) {
      return;
    }

    const game = this.activeGame;

    if (!game) {
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();
      this.submitCommand(game, this.text);
      this.text = "";
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      this.closeChat();
      return;
    }

    if (event.key === "Backspace") {
      event.preventDefault();
      event.stopPropagation();
      this.text = this.text.slice(0, -1);
      return;
    }

    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      event.stopPropagation();
      if (this.text.length < 48) {
        this.text += event.key;
      }
    }
  }

  submitCommand(game, rawCommand) {
    if (!game) {
      this.status = "Command failed";
      this.closeChat();
      return;
    }

    const command = normalizeGodModeCommand(rawCommand);

    if (command === "godmode") {
      game.setGodMode(true, 1);
      this.status = "";
      this.closeChat();
      return;
    }

    if (command === "godmodex2") {
      game.setGodMode(true, 2);
      this.status = "";
      this.closeChat();
      return;
    }

    if (command === "godmodex5") {
      game.setGodMode(true, 5);
      this.status = "";
      this.closeChat();
      return;
    }

    if (command === "godmodex10") {
      game.setGodMode(true, 10);
      this.status = "";
      this.closeChat();
      return;
    }

    if (command === "godmode off") {
      game.setGodMode(false);
      this.status = "God mode OFF";
      this.closeChat();
      return;
    }

    this.status = command ? `Unknown: ${command}` : "";
  }

  update(game, input) {
    if (this.open) {
      return true;
    }

    if (
      (game.state === "playing" || game.state === "paused") &&
      input.consumeUiClick(this.button)
    ) {
      this.openChat(game);
      return true;
    }

    return false;
  }

  draw(game) {
    if (game.state !== "playing" && game.state !== "paused") {
      return;
    }

    const ctx = this.context;

    ctx.save();
    ctx.textBaseline = "top";

    this.drawButton(ctx, this.open);

    if (this.open) {
      this.drawPanel(ctx);
    } else if (game.godMode || this.status) {
      this.drawStatus(ctx, game.godMode ? getGodModeStatusLabel(game) : this.status);
    }

    ctx.restore();
  }

  drawButton(ctx, active) {
    const button = this.button;

    ctx.fillStyle = active ? "rgba(120, 180, 120, 0.35)" : "rgba(10, 14, 18, 0.58)";
    ctx.fillRect(button.x, button.y, button.width, button.height);
    ctx.strokeStyle = active ? "rgba(160, 255, 160, 0.7)" : "rgba(255, 222, 161, 0.32)";
    ctx.lineWidth = 2;
    ctx.strokeRect(button.x, button.y, button.width, button.height);

    ctx.fillStyle = "#fff4dc";
    ctx.font = "700 16px system-ui, sans-serif";
    ctx.fillText("CMD", button.x + 10, button.y + 14);
  }

  drawPanel(ctx) {
    const panelX = 32;
    const panelY = this.height - 220;
    const panelWidth = 420;
    const panelHeight = 96;

    ctx.fillStyle = "rgba(8, 10, 14, 0.92)";
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
    ctx.strokeStyle = "rgba(160, 255, 160, 0.45)";
    ctx.lineWidth = 2;
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);

    ctx.fillStyle = "#b8f0b8";
    ctx.font = "600 16px system-ui, sans-serif";
    ctx.fillText("Debug — godmode, godmode off", panelX + 12, panelY + 10);
    ctx.fillText("godmodex2 · godmodex5 · godmodex10", panelX + 12, panelY + 28);

    ctx.fillStyle = "#fff4dc";
    ctx.font = "500 22px system-ui, sans-serif";
    ctx.fillText(`> ${this.text}_`, panelX + 12, panelY + 52);
  }

  drawStatus(ctx, label) {
    ctx.fillStyle = "rgba(8, 10, 14, 0.72)";
    ctx.fillRect(this.button.x + this.button.width + 10, this.button.y + 8, 168, 28);
    ctx.fillStyle = "#9ef59e";
    ctx.font = "600 16px system-ui, sans-serif";
    ctx.fillText(label, this.button.x + this.button.width + 18, this.button.y + 12);
  }
}
