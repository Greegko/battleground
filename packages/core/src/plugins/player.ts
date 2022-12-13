import { without } from "ramda";

import { Vector } from "../utils/vector";
import { addVector, isZeroVector, subVector } from "../utils/vector";

function getVectorFromKeyCode(code: string): Vector {
  switch (code) {
    case "w":
      return { x: 0, y: -1 };
    case "s":
      return { x: 0, y: 1 };
    case "a":
      return { x: -1, y: 0 };
    case "d":
      return { x: 1, y: 0 };
  }
}

type MoveDirectionCallback = (direction: Vector) => void;

export class Player {
  private moveDirectionChange: MoveDirectionCallback = (direction: Vector) => {};

  hookMoveDirectionChangeCallback(cb: MoveDirectionCallback) {
    this.moveDirectionChange = cb;
  }

  hookKeyboardEvents() {
    const trackedKeys = ["w", "s", "a", "d"];
    let availableKeys = [...trackedKeys];

    let currentDirection: Vector = undefined;

    window.addEventListener("keydown", event => {
      if (!availableKeys.includes(event.key)) return;

      availableKeys = without([event.key], availableKeys);

      const direction = getVectorFromKeyCode(event.key);
      if (currentDirection) {
        currentDirection = addVector(currentDirection, direction);
      } else {
        currentDirection = direction;
      }

      this.moveDirectionChange(currentDirection);
    });

    window.addEventListener("keyup", event => {
      if (!trackedKeys.includes(event.key)) return;
      if (availableKeys.includes(event.key)) return;

      availableKeys.push(event.key);

      const direction = getVectorFromKeyCode(event.key);

      currentDirection = subVector(currentDirection, direction);

      if (isZeroVector(currentDirection)) {
        currentDirection = undefined;
      }

      this.moveDirectionChange(currentDirection);
    });
  }
}
