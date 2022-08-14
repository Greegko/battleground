import { Vector } from "../utils/vector";
import { Effect, Unit } from "./unit";

export interface Projectile {
  projectileId: string;
  source: Unit;
  sourceLocation: Vector;
  targetLocation: Vector;
  speed: number;
  time: number;
  timeState: number;
  area: number;
  effect: Effect[];
}
