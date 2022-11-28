import { Unit } from "../interface";
import { Vector } from "../utils/vector";
import { normVector } from "../utils/vector";

export class ManuallyControlledUnit {
  controlledUnit: Unit | null;

  setControlledUnit(unit: Unit) {
    this.controlledUnit = unit;

    this.controlledUnit.moveDirection = undefined;
  }

  setMoveDirection(direction: Vector) {
    this.controlledUnit.moveDirection = direction ? normVector(direction) : undefined;
  }
}
