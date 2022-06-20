import { Cordinate, Dimension, Unit } from "interface";

export type Tick = number;
export type TeamID = number;

export enum UnitActionType {
  None,
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
