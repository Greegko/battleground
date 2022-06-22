import { Cordinate, Dimension, Unit } from "interface";

export type Tick = number;
export type TeamID = number;

export enum BattleEventType {
  Move,
  Attack,
  Damaged,
  Died,
  Created,
}

export enum BattleEventSource {
  Unit,
  Projectile,
}

export interface BattleEventUnit {
  tick: Tick;
  type: BattleEventType;
  source: UnitState;
  sourceType: BattleEventSource.Unit;
  target?: UnitState;
}

export interface BattleEventProjectile {
  tick: Tick;
  type: BattleEventType;
  source: Projectile;
  sourceType: BattleEventSource.Projectile;
  target?: UnitState;
}

export type BattleEvent = BattleEventUnit | BattleEventProjectile;

export enum UnitActionType {
  None,
  Move,
  Attack,
}

export interface UnitAction {
  type: UnitActionType;
  time: Tick;
}

export interface UnitState {
  unit: Unit;
  team: TeamID;
  cordinate: Cordinate;
  action: UnitAction;
  cooldowns: { attack: Tick };
  currentHp: number;
}

export interface Projectile {
  team: TeamID;
  area: number;
  sprite_id: string;
  dmg: number;
  sourceLocation: Cordinate;
  targetLocation: Cordinate;
  time: Tick;
}

export interface BattleState {
  tick: number;
  isRunning: boolean;

  units: UnitState[];
  projectiles: Projectile[];

  aliveUnits: UnitState[];

  teamMembers: Map<TeamID, UnitState[]>;
  enemyTeamMembers: Map<TeamID, UnitState[]>;
}

export interface BattleConfig {
  dimension: Dimension;
}
