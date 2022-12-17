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
  Physical = "physical",
  Magic = "magic",
  Fire = "fire",
}

export enum EffectType {
  Review = "revive",
  Heal = "heal",
  Dmg = "dmg",
  SpawnUnit = "spawn-unit",
  Armor = "armor",
  Dot = "dot",
}

export type GenericEffect = { type: EffectType };
export type HealEffect = { type: EffectType.Heal; power: number };
export type DmgEffect = { type: EffectType.Dmg; dmgType: DmgType; power: number | [number, number] };
export type ArmorEffect = { type: EffectType.Armor; dmgType: DmgType; power: number };
export type DotEffect = {
  type: EffectType.Dot;
  dmgType: DmgType;
  power: number;
  interval: number;
  period: number;
  state?: { intervalState: number; remainingPeriod: number };
};

export type Effect = GenericEffect | HealEffect | DmgEffect | ArmorEffect | DotEffect;

export type Animation = "attack";

export interface ActionActive {
  action: Action;
  speed: number;
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
  actions: Action[];
  effects?: Effect[];
  moveSpeed?: number;
}

export interface UnitSetup extends Partial<UnitConfig> {
  location: Vector;
  team: number;
  hp?: number;
}

export interface UnitState {
  hp: number;
  effects: Effect[];
  actionsCooldowns: Map<Action, number>;
  activeAction?: ActionActive;
  moveDirection?: Vector;
}

export type UnitInit = UnitConfig & UnitSetup;
export type Unit = UnitInit & UnitState;
