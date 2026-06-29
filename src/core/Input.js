import { GameConfig } from "../config/GameConfig.js";
import { TouchControls } from "./TouchControls.js";

export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.justPressedKeys = new Set();
    this.mousePosition = { x: 0, y: 0 };
    this.mouseClicked = false;
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
      this.mouseClicked = true;
    });

    canvas.addEventListener(
      "touchstart",
      (event) => {
        this.handleTouchEvent(event);
        this.touch.handleTouchStart(event, (touch) => this.getCanvasPoint(touch));
        this.syncPointerFromTouch(event);
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
    });

    canvas.addEventListener("touchcancel", (event) => {
      this.touch.handleTouchCancel(event);
      this.syncPointerFromTouch(event);
    });

    window.addEventListener("blur", () => {
      this.keys.clear();
      this.justPressedKeys.clear();
      this.mouseClicked = false;
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
    this.mouseClicked = true;
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

  consumeClick() {
    const wasClicked = this.mouseClicked;

    if (wasClicked && this.shouldBlockTapAt(this.mousePosition)) {
      this.mouseClicked = false;
      return false;
    }

    this.mouseClicked = false;
    return wasClicked;
  }

  endFrame() {
    this.mouseClicked = false;
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
    code === "KeyR" ||
    code === "Escape" ||
    code === "KeyP" ||
    code === "Digit1" ||
    code === "Digit2" ||
    code === "Digit3"
  );
}
