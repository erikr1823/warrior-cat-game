export class Camera {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.position = { x: 0, y: 0 };
  }

  follow(targetPosition) {
    this.position.x = targetPosition.x - this.width / 2;
    this.position.y = targetPosition.y - this.height / 2;
  }

  worldToScreen(position) {
    return {
      x: position.x - this.position.x,
      y: position.y - this.position.y,
    };
  }
}
