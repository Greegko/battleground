import { Unit } from "../interface";
import { Vector, addVector } from "./vector";

export function getUnitCentral(unit: Unit): Vector {
  return addVector(unit.location, { x: unit.size / 2, y: unit.size / 2 });
}
