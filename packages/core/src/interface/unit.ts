import { Vector } from "../utils/vector";

export type SeekCondition =
  | "enemy-team"
  | "alive"
  | "dead"
  | "same-team"
  | "damaged"
  | ["in-distance", { distance: number }];

export enum DmgType {
  Pure = "pure",
  Phisical = "physical",
  Magic = "magic",
}

export enum EffectType {
  Review = "revive",
  Heal = "heal",
  Dmg = "dmg",
  SpawnUnit = "spawn-unit",
  Armor = "armor",
}

export type GenericEffect = { type: EffectType };
export type HealEffect = { type: EffectType.Heal; power: number };
export type DmgEffect = { type: EffectType.Dmg; dmgType: DmgType; power: number };
export type ArmorEffect = { type: EffectType.Armor; dmgType: DmgType; power: number };

export type Effect = GenericEffect | HealEffect | DmgEffect | ArmorEffect;

export type Animation = "attack";

export interface ActionState {
  speed?: number;
  cooldown?: number;
  targetUnit?: Unit;
}

export interface Action {
  seekTargetCondition?: SeekCondition[];
  animation?: Animation;
  cooldown: number;
  speed: number;
  effect?: Effect[];
  distance?: number;
  hitEffect?: Effect[];
  projectileId?: string;
  projectileSpeed?: number;
}

export interface UnitConfig {
  id: string;
  spriteId: string;
  size: number;
  maxHp: number;
  action: Action;
  effects?: Effect[];
  moveSpeed?: number;
}

export interface UnitState {
  location: Vector;
  hp: number;
  team: number;
  effects: Effect[];
  actionState: ActionState;
  moveDirection?: Vector;
}

export type Unit = UnitConfig & UnitState;
