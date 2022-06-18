import { flatten, head, sortBy, without } from "ramda";

import { calculateAngle } from "@utils/calculate-angle";
import { calculateDistance } from "@utils/calculate-distance";
import { randomInt } from "@utils/random-int";

import { Cordinate, Dimension, Unit } from "./interface";

export enum UnitActionType {
  None,
  Move,
  Attack,
  Recover,
}

export interface UnitAction {
  type: UnitActionType;
  time: number;
}

export interface UnitState {
  unit: Unit;
  team: number;
  cordinate: Cordinate;
  action: UnitAction;
  currentHp: number;
}

export interface BattleState {
  isRunning: boolean;

  units: UnitState[];

  aliveUnits: UnitState[];

  teamMembers: Map<UnitState, UnitState[]>;
  enemyTeamMembers: Map<UnitState, UnitState[]>;
}

export interface BattleConfig {
  dimension: Dimension;
}

const closestUnit = (unit: UnitState, units: UnitState[]): UnitState => {
  const list = sortBy(x => calculateDistance(unit.cordinate, x.cordinate), units);

  return head(list)!;
};

export class Battle {
  private state!: BattleState;

  constructor(teams: Unit[][], private config: BattleConfig) {
    const units = flatten(
      teams.map((units, teamIndex) => {
        return units.map(unit => {
          return {
            unit,
            team: teamIndex,
            action: { time: 0, type: UnitActionType.None },
            currentHp: unit.hp,
            cordinate: [randomInt(0, config.dimension[0]), randomInt(0, config.dimension[1])] as Cordinate,
          } as UnitState;
        });
      }),
    );

    this.state = { isRunning: true, units, aliveUnits: [...units], ...this.createCache(units) };
  }

  tick(): void {
    this.state.aliveUnits.forEach(unitState => {
      switch (unitState.action.type) {
        case UnitActionType.Move:
          this.move(unitState);
          break;
        case UnitActionType.Attack:
          if (unitState.action.time === 0) {
            this.attack(unitState);
          } else {
            unitState.action.time--;
          }
          break;
        case UnitActionType.Recover:
          if (unitState.action.time === 0) {
            unitState.action = { type: UnitActionType.None, time: 0 };
          } else {
            unitState.action.time--;
          }
          break;
        case UnitActionType.None:
          unitState.action = { type: UnitActionType.Move, time: 0 };
          break;
      }
    });
  }

  getState(): BattleState {
    return this.state;
  }

  private checkEndCondition(): void {
    if (
      this.state.aliveUnits.length > 1 &&
      this.state.aliveUnits.some((unit, index, array) => unit.team !== array[0].team)
    ) {
      return;
    }
    this.state.isRunning = false;
  }

  private attack(unit: UnitState): void {
    const enemyUnit = closestUnit(unit, this.state.enemyTeamMembers.get(unit)!);

    enemyUnit.currentHp = Math.max(0, enemyUnit.currentHp - unit.unit.attack.dmg);

    if (enemyUnit.currentHp === 0) {
      enemyUnit.action = { type: UnitActionType.None, time: 0 };
      this.killUnitCacheUpdate(enemyUnit);
      this.checkEndCondition();
    }

    unit.action = { type: UnitActionType.Recover, time: unit.unit.attack.recover };
  }

  private move(unit: UnitState): void {
    const enemyUnit = closestUnit(unit, this.state.enemyTeamMembers.get(unit)!);

    const rot = calculateAngle(enemyUnit.cordinate, unit.cordinate);

    const deltaX = Math.floor(-Math.cos(rot) * unit.unit.speed * 10) / 10;
    const deltaY = Math.floor(-Math.sin(rot) * unit.unit.speed * 10) / 10;

    unit.cordinate[0] = Math.min(Math.max(0, Math.round(unit.cordinate[0] + deltaX)), this.config.dimension[0]);
    unit.cordinate[1] = Math.min(Math.max(0, Math.round(unit.cordinate[1] + deltaY)), this.config.dimension[1]);

    if (calculateDistance(unit.cordinate, enemyUnit.cordinate) < 30) {
      unit.action = { type: UnitActionType.Attack, time: unit.unit.attack.speed };
    }
  }

  private killUnitCacheUpdate(unit: UnitState) {
    this.state.aliveUnits = without([unit], this.state.aliveUnits);

    const { teamMembers, enemyTeamMembers } = this.createCache(this.state.aliveUnits);
    this.state.teamMembers = teamMembers;
    this.state.enemyTeamMembers = enemyTeamMembers;
  }

  private createCache(units: UnitState[]) {
    const teamMembers = new Map();
    const enemyTeamMembers = new Map();

    units.forEach(unit => {
      teamMembers.set(
        unit,
        without(
          units.filter(x => x.team === unit.team),
          [unit],
        ),
      );
      enemyTeamMembers.set(
        unit,
        units.filter(allUnit => unit.team !== allUnit.team),
      );
    });

    return { teamMembers, enemyTeamMembers };
  }
}
