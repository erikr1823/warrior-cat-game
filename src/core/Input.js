export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.justPressedKeys = new Set();
    this.mousePosition = { x: 0, y: 0 };
    this.mouseClicked = false;

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

    window.addEventListener("blur", () => {
      this.keys.clear();
      this.justPressedKeys.clear();
      this.mouseClicked = false;
    });
  }

  getMovementVector() {
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
    return this.keys.has("Enter") || this.keys.has("Space");
  }

  wasActionJustPressed() {
    return this.justPressedKeys.has("Enter") || this.justPressedKeys.has("Space");
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
    this.mouseClicked = false;
    return wasClicked;
  }

  endFrame() {
    this.mouseClicked = false;
    this.justPressedKeys.clear();
  }

  getCanvasPoint(event) {
    const bounds = this.canvas.getBoundingClientRect();

    return {
      x: ((event.clientX - bounds.left) / bounds.width) * this.canvas.width,
      y: ((event.clientY - bounds.top) / bounds.height) * this.canvas.height,
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
