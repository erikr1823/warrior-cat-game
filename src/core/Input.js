import { normalizeVector } from "../core/MathUtils.js";
import { GameConfig } from "../config/GameConfig.js";
import { TouchControls } from "./TouchControls.js";

export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.justPressedKeys = new Set();
    this.mousePosition = { x: 0, y: 0 };
    this.mouseClicked = false;
    this.clickFramesRemaining = 0;
    this.pointerHeld = false;
    this.lastAimDirection = { x: 1, y: 0 };
    this.touch = new TouchControls(GameConfig.resolution.width, GameConfig.resolution.height);

    window.addEventListener("keydown", (event) => {
      if (isGameKey(event.code)) {
        event.preventDefault();
      }

      if (!this.keys.has(event.code)) {
        this.justPressedKeys.add(event.code);
      }

      this.keys.add(event.code);
    });

    window.addEventListener("keyup", (event) => {
      if (isGameKey(event.code)) {
        event.preventDefault();
      }

      this.keys.delete(event.code);
    });

    canvas.addEventListener("mousemove", (event) => {
      this.mousePosition = this.getCanvasPoint(event);
    });

    canvas.addEventListener("mousedown", (event) => {
      this.mousePosition = this.getCanvasPoint(event);
      this.registerClick();
      this.pointerHeld = true;
    });

    window.addEventListener("mouseup", () => {
      this.pointerHeld = false;
    });

    canvas.addEventListener(
      "touchstart",
      (event) => {
        this.handleTouchEvent(event);
        this.touch.handleTouchStart(event, (touch) => this.getCanvasPoint(touch));
        this.syncPointerFromTouch(event);
        this.pointerHeld = true;
      },
      { passive: false },
    );

    canvas.addEventListener(
      "touchmove",
      (event) => {
        this.handleTouchEvent(event);
        this.touch.handleTouchMove(event, (touch) => this.getCanvasPoint(touch));
        this.syncPointerFromTouch(event);
      },
      { passive: false },
    );

    canvas.addEventListener("touchend", (event) => {
      this.touch.handleTouchEnd(event, (touch) => this.getCanvasPoint(touch));
      this.applyTouchTap();
      this.syncPointerFromTouch(event);
      this.pointerHeld = event.touches.length > 0;
    });

    canvas.addEventListener("touchcancel", (event) => {
      this.touch.handleTouchCancel(event);
      this.syncPointerFromTouch(event);
      this.pointerHeld = event.touches.length > 0;
    });

    window.addEventListener("blur", () => {
      this.keys.clear();
      this.justPressedKeys.clear();
      this.mouseClicked = false;
      this.pointerHeld = false;
      this.touch.resetJoystick();
      this.touch.actionHeld = false;
    });
  }

  handleTouchEvent(event) {
    if (this.touch.enabled) {
      event.preventDefault();
    }
  }

  syncPointerFromTouch(event) {
    const touch = event.touches[0] ?? event.changedTouches[0];

    if (touch) {
      this.mousePosition = this.getCanvasPoint(touch);
    }
  }

  applyTouchTap() {
    const tap = this.touch.consumePendingTap();

    if (!tap) {
      return;
    }

    this.mousePosition = { x: tap.x, y: tap.y };
    this.registerClick();
  }

  // A click stays valid for a couple of frames so it is never dropped due to
  // frame-timing (e.g. a state transition on the same frame the click lands).
  registerClick() {
    this.mouseClicked = true;
    this.clickFramesRemaining = 2;
  }

  isTouchEnabled() {
    return this.touch.enabled;
  }

  drawTouchControls(context, state) {
    this.touch.draw(context, {
      state,
      showGameplayControls: this.touch.shouldShowGameplayControls(state),
      showActionButton: this.touch.shouldShowActionButton(state),
    });
  }

  shouldBlockTapAt(point) {
    return (
      this.touch.isPointOnActionButton(point) ||
      this.touch.isPointOnJoystick(point) ||
      (this.touch.shouldShowGameplayControls("playing") && this.touch.isJoystickZone(point))
    );
  }

  getMovementVector() {
    const keyboard = this.getKeyboardMovementVector();
    const touch = this.touch.getMovementVector();

    if (keyboard.x !== 0 || keyboard.y !== 0) {
      return keyboard;
    }

    return touch;
  }

  isMouseInCanvas() {
    return (
      this.mousePosition.x >= 0 &&
      this.mousePosition.x <= this.canvas.width &&
      this.mousePosition.y >= 0 &&
      this.mousePosition.y <= this.canvas.height
    );
  }

  /** Screen mouse position → world aim vector from the player (desktop aiming). */
  getWorldAimDirection(playerPosition, camera) {
    if (!this.isMouseInCanvas()) {
      return {
        direction: this.lastAimDirection,
        valid: false,
      };
    }

    const worldPoint = camera.screenToWorld(this.mousePosition);
    const direction = normalizeVector({
      x: worldPoint.x - playerPosition.x,
      y: worldPoint.y - playerPosition.y,
    });

    if (direction.x !== 0 || direction.y !== 0) {
      this.lastAimDirection = direction;
    }

    return {
      direction: this.lastAimDirection,
      valid: true,
    };
  }

  wasDashJustPressed() {
    return (
      this.justPressedKeys.has("ShiftLeft") ||
      this.justPressedKeys.has("ShiftRight") ||
      this.justPressedKeys.has("Space")
    );
  }

  consumeManualShootClick() {
    // Left click manual shot; blocked over touch UI zones.
    if (!this.mouseClicked) {
      return false;
    }

    if (this.shouldBlockTapAt(this.mousePosition)) {
      this.mouseClicked = false;
      return false;
    }

    this.mouseClicked = false;
    return true;
  }

  getKeyboardMovementVector() {
    let x = 0;
    let y = 0;

    if (this.keys.has("KeyA") || this.keys.has("ArrowLeft")) {
      x -= 1;
    }

    if (this.keys.has("KeyD") || this.keys.has("ArrowRight")) {
      x += 1;
    }

    if (this.keys.has("KeyW") || this.keys.has("ArrowUp")) {
      y -= 1;
    }

    if (this.keys.has("KeyS") || this.keys.has("ArrowDown")) {
      y += 1;
    }

    return { x, y };
  }

  isActionPressed() {
    return this.keys.has("Enter") || this.keys.has("Space") || this.touch.isActionHeld();
  }

  wasActionJustPressed() {
    return (
      this.justPressedKeys.has("Enter") ||
      this.justPressedKeys.has("Space") ||
      this.touch.wasActionJustPressed()
    );
  }

  consumeTouchAttackPress() {
    return this.touch.wasActionJustPressed();
  }

  isRestartPressed() {
    return this.keys.has("KeyR");
  }

  wasPauseJustPressed() {
    return this.justPressedKeys.has("Escape") || this.justPressedKeys.has("KeyP");
  }

  getChoicePressed() {
    if (this.justPressedKeys.has("Digit1")) {
      return 0;
    }

    if (this.justPressedKeys.has("Digit2")) {
      return 1;
    }

    if (this.justPressedKeys.has("Digit3")) {
      return 2;
    }

    return -1;
  }

  isMouseOver(rectangle) {
    return (
      this.mousePosition.x >= rectangle.x &&
      this.mousePosition.x <= rectangle.x + rectangle.width &&
      this.mousePosition.y >= rectangle.y &&
      this.mousePosition.y <= rectangle.y + rectangle.height
    );
  }

  isPointerHeld() {
    return this.pointerHeld;
  }

  consumeClick() {
    const wasClicked = this.mouseClicked;

    if (wasClicked && this.shouldBlockTapAt(this.mousePosition)) {
      this.clearClick();
      return false;
    }

    this.clearClick();
    return wasClicked;
  }

  consumeUiClick(rectangle) {
    if (!this.isMouseOver(rectangle)) {
      return false;
    }

    const wasClicked = this.mouseClicked;
    this.clearClick();
    return wasClicked;
  }

  clearClick() {
    this.mouseClicked = false;
    this.clickFramesRemaining = 0;
  }

  endFrame() {
    if (this.mouseClicked) {
      this.clickFramesRemaining -= 1;

      if (this.clickFramesRemaining <= 0) {
        this.mouseClicked = false;
      }
    }

    this.justPressedKeys.clear();
  }

  getCanvasPoint(source) {
    const bounds = this.canvas.getBoundingClientRect();
    const clientX = source.clientX ?? 0;
    const clientY = source.clientY ?? 0;

    return {
      x: ((clientX - bounds.left) / bounds.width) * this.canvas.width,
      y: ((clientY - bounds.top) / bounds.height) * this.canvas.height,
    };
  }
}

function isGameKey(code) {
  return (
    code === "KeyA" ||
    code === "KeyD" ||
    code === "KeyW" ||
    code === "KeyS" ||
    code === "ArrowLeft" ||
    code === "ArrowRight" ||
    code === "ArrowUp" ||
    code === "ArrowDown" ||
    code === "Enter" ||
    code === "Space" ||
    code === "ShiftLeft" ||
    code === "ShiftRight" ||
    code === "KeyR" ||
    code === "Escape" ||
    code === "KeyP" ||
    code === "Digit1" ||
    code === "Digit2" ||
    code === "Digit3"
  );
}
