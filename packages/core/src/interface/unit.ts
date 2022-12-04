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
export type DmgEffectArgs = { type: DmgType; power: number };
export type ArmorEffectArgs = { type: DmgType; power: number };

export enum EffectType {
  Review = "revive",
  Heal = "heal",
  Dmg = "dmg",
  SpawnUnit = "spawn-unit",
  Armor = "armor",
}

export type GenericEffect = { type: EffectType; args?: never };
export type HealEffect = { type: EffectType.Heal; args: { power: number } };
export type DmgEffect = { type: EffectType.Dmg; args: DmgEffectArgs };
export type ArmorEffect = { type: EffectType.Armor; args: ArmorEffectArgs };

export type Effect = GenericEffect | HealEffect | DmgEffect | ArmorEffect;

export type Animation = "attack";

export interface ActionState {
  speed?: number;
  cooldown?: number;
  targetUnit?: Unit;
}

export type ActionBuilding = {
  speed: number;
  effect: Effect[];
};

export interface ActionAttack {
  seekTargetCondition: SeekCondition[];
  animation: Animation;
  cooldown: number;
  speed: number;
  effect: Effect[];
  distance: number;
  hitEffect: Effect[];
}

export interface ActionProjectileAttack extends ActionAttack {
  projectileId: string;
  projectileSpeed: number;
}

export type Action = ActionBuilding | ActionAttack | ActionProjectileAttack;

export interface UnitConfig {
  id: string;
  spriteId: string;
  size: number;
  maxHp: number;
  action: Action;
  effects: Effect[];
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
