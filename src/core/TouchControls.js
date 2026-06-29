import { normalizeVector } from "./MathUtils.js";

const TAP_MOVE_THRESHOLD = 18;

export class TouchControls {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.enabled =
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0);
    this.joystick = {
      active: false,
      pointerId: null,
      originX: 0,
      originY: 0,
      knobX: 0,
      knobY: 0,
      vector: { x: 0, y: 0 },
    };
    this.actionJustPressed = false;
    this.actionHeld = false;
    this.pendingTap = null;
    this.layout = this.buildLayout(width, height);
  }

  buildLayout(width, height) {
    return {
      joystick: {
        centerX: Math.round(width * 0.12),
        centerY: height - 190,
        radius: 118,
        knobRadius: 46,
      },
      action: {
        centerX: width - 170,
        centerY: height - 190,
        radius: 78,
        label: "ATTACK",
      },
    };
  }

  shouldShowGameplayControls(state) {
    return state === "playing";
  }

  shouldShowActionButton(state) {
    return (
      state === "menu" ||
      state === "shop" ||
      state === "playing" ||
      state === "levelUp" ||
      state === "chestReward" ||
      state === "gameOver" ||
      state === "paused"
    );
  }

  getMovementVector() {
    if (!this.joystick.active) {
      return { x: 0, y: 0 };
    }

    return { ...this.joystick.vector };
  }

  wasActionJustPressed() {
    if (!this.actionJustPressed) {
      return false;
    }

    this.actionJustPressed = false;
    return true;
  }

  isActionHeld() {
    return this.actionHeld;
  }

  consumePendingTap() {
    if (!this.pendingTap) {
      return null;
    }

    const tap = this.pendingTap;
    this.pendingTap = null;
    return tap;
  }

  handleTouchStart(event, getCanvasPoint) {
    if (!this.enabled) {
      return;
    }

    for (const touch of event.changedTouches) {
      const point = getCanvasPoint(touch);
      const action = this.layout.action;

      if (this.isWithinCircle(point, action.centerX, action.centerY, action.radius + 12)) {
        this.actionJustPressed = true;
        this.actionHeld = true;
        continue;
      }

      if (this.isJoystickZone(point)) {
        this.joystick.active = true;
        this.joystick.pointerId = touch.identifier;
        this.joystick.originX = point.x;
        this.joystick.originY = point.y;
        this.joystick.knobX = point.x;
        this.joystick.knobY = point.y;
        this.joystick.vector = { x: 0, y: 0 };
        continue;
      }

      this.pendingTap = {
        pointerId: touch.identifier,
        startX: point.x,
        startY: point.y,
        x: point.x,
        y: point.y,
      };
    }
  }

  handleTouchMove(event, getCanvasPoint) {
    if (!this.enabled) {
      return;
    }

    for (const touch of event.changedTouches) {
      const point = getCanvasPoint(touch);

      if (this.joystick.active && touch.identifier === this.joystick.pointerId) {
        this.updateJoystickKnob(point.x, point.y);
        continue;
      }

      if (this.pendingTap?.pointerId === touch.identifier) {
        this.pendingTap.x = point.x;
        this.pendingTap.y = point.y;
      }
    }
  }

  handleTouchEnd(event, getCanvasPoint) {
    if (!this.enabled) {
      return;
    }

    for (const touch of event.changedTouches) {
      if (this.joystick.active && touch.identifier === this.joystick.pointerId) {
        this.resetJoystick();
      }

      if (this.pendingTap?.pointerId === touch.identifier) {
        const point = getCanvasPoint(touch);
        const moved = Math.hypot(
          point.x - this.pendingTap.startX,
          point.y - this.pendingTap.startY,
        );

        if (moved <= TAP_MOVE_THRESHOLD) {
          this.pendingTap.x = point.x;
          this.pendingTap.y = point.y;
        } else {
          this.pendingTap = null;
        }
      }
    }

    if (event.touches.length === 0) {
      this.actionHeld = false;
    }
  }

  handleTouchCancel(event) {
    for (const touch of event.changedTouches) {
      if (this.joystick.active && touch.identifier === this.joystick.pointerId) {
        this.resetJoystick();
      }

      if (this.pendingTap?.pointerId === touch.identifier) {
        this.pendingTap = null;
      }
    }

    if (event.touches.length === 0) {
      this.actionHeld = false;
    }
  }

  isPointOnActionButton(point) {
    const action = this.layout.action;
    return this.isWithinCircle(point, action.centerX, action.centerY, action.radius + 12);
  }

  isPointOnJoystick(point) {
    if (!this.joystick.active) {
      return false;
    }

    return this.isWithinCircle(
      point,
      this.joystick.originX,
      this.joystick.originY,
      this.layout.joystick.radius + 24,
    );
  }

  updateJoystickKnob(x, y) {
    const { originX, originY } = this.joystick;
    const maxRadius = this.layout.joystick.radius;
    const dx = x - originX;
    const dy = y - originY;
    const distance = Math.hypot(dx, dy);

    if (distance <= maxRadius || distance === 0) {
      this.joystick.knobX = x;
      this.joystick.knobY = y;
      this.joystick.vector = normalizeVector({ x: dx, y: dy });
      return;
    }

    const scale = maxRadius / distance;
    this.joystick.knobX = originX + dx * scale;
    this.joystick.knobY = originY + dy * scale;
    this.joystick.vector = normalizeVector({ x: dx * scale, y: dy * scale });
  }

  resetJoystick() {
    this.joystick.active = false;
    this.joystick.pointerId = null;
    this.joystick.vector = { x: 0, y: 0 };
  }

  isJoystickZone(point) {
    const zoneX = 0;
    const zoneY = this.height * 0.45;
    const zoneWidth = this.width * 0.42;
    const zoneHeight = this.height - zoneY;

    return (
      point.x >= zoneX &&
      point.x <= zoneX + zoneWidth &&
      point.y >= zoneY &&
      point.y <= zoneY + zoneHeight
    );
  }

  isWithinCircle(point, centerX, centerY, radius) {
    return Math.hypot(point.x - centerX, point.y - centerY) <= radius;
  }

  draw(ctx, { state, showGameplayControls = false, showActionButton = false }) {
    if (!this.enabled) {
      return;
    }

    ctx.save();

    if (showGameplayControls) {
      this.drawJoystick(ctx);
    }

    if (showActionButton) {
      this.drawActionButton(ctx, state);
    }

    ctx.restore();
  }

  drawJoystick(ctx) {
    const base = this.layout.joystick;
    const knobX = this.joystick.active ? this.joystick.knobX : base.centerX;
    const knobY = this.joystick.active ? this.joystick.knobY : base.centerY;

    ctx.globalAlpha = 0.42;
    ctx.fillStyle = "#0b0e14";
    ctx.beginPath();
    ctx.arc(base.centerX, base.centerY, base.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.9;
    ctx.strokeStyle = "rgba(255, 210, 126, 0.55)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(base.centerX, base.centerY, base.radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = 0.82;
    ctx.fillStyle = "#2a1e28";
    ctx.beginPath();
    ctx.arc(knobX, knobY, base.knobRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#ffd27e";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.globalAlpha = 1;
  }

  drawActionButton(ctx, state) {
    const action = this.layout.action;
    const pressed = this.actionHeld;
    const label = state === "playing" ? "ATTACK" : "ACTION";

    ctx.globalAlpha = pressed ? 0.95 : 0.78;
    ctx.fillStyle = pressed ? "#b94f42" : "#4a7058";
    ctx.beginPath();
    ctx.arc(action.centerX, action.centerY, action.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = pressed ? "#ffe09a" : "#ffd27e";
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = "#fff6d4";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "900 24px 'Courier New', monospace";
    ctx.fillText(label, action.centerX, action.centerY);
    ctx.globalAlpha = 1;
  }
}
