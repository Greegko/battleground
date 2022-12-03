import { Vector } from "../utils/vector";

export type SeekCondition =
  | "enemy-team"
  | "alive"
  | "dead"
  | "same-team"
  | "damaged"
  | ["in-distance", { distance: number }];

export type EffectType = "revive" | "heal" | "dmg" | "spawn-unit";
export type Effect = { type: EffectType; args?: any };
export type Animation = "attack";

export interface ActionState {
  speed?: number;
  cooldown?: number;
  targetUnit?: Unit;
}

export interface Action {
  seekTargetCondition: SeekCondition[];
  animation: Animation;
  speed: number;
  cooldown: number;
  distance: number;
  effect: Effect[];
  hitEffect: Effect[];
  projectileId?: string;
  projectileSpeed?: number;
}

export interface UnitConfig {
  id: string;
  spriteId: string;
  size: number;
  maxHp: number;
  action: Action;
  moveSpeed?: number;
}

export interface UnitState {
  location: Vector;
  hp: number;
  team: number;
  actionState: ActionState;
  moveDirection?: Vector;
}

export type Unit = UnitConfig & UnitState;
