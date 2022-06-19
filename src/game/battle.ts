import { flatten, forEach, groupBy, head, sortBy, without } from "lodash-es";

import { calculateAngle } from "@utils/calculate-angle";
import { calculateDistance } from "@utils/calculate-distance";
import { randomInt } from "@utils/random-int";

import { Cordinate, Dimension, Unit } from "./interface";

type Tick = number;
type TeamID = number;

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

function closestUnit(unit: UnitState, units: UnitState[]): UnitState | undefined {
  return head(sortBy(units, x => calculateDistance(unit.cordinate, x.cordinate)));
}

function getUnitsInDistance(location: Cordinate, area: number, units: UnitState[]): UnitState[] {
  return units.filter(unit => calculateDistance(unit.cordinate, location) <= area);
}

export class Battle {
  private state!: BattleState;

  constructor(inputTeams: Unit[][], private config: BattleConfig) {
    const teams = inputTeams.map((units, teamIndex) => {
      return units.map(unit => {
        return {
          unit,
          team: teamIndex,
          action: { time: 0, type: UnitActionType.None },
          currentHp: unit.hp,
          cordinate: [randomInt(0, config.dimension[0]), randomInt(0, config.dimension[1])] as Cordinate,
          cooldowns: { attack: 0 },
        } as UnitState;
      });
    });

    const units = flatten(teams);

    this.state = {
      isRunning: true,
      units,
      aliveUnits: [...units],
      enemyTeamMembers: new Map(),
      teamMembers: new Map(),
      projectiles: [],
    };

    this.updateTeamCache();
  }

  tick(): void {
    this.state.projectiles.forEach((projectile, index, projectiles) => {
      projectile.time--;

      if (projectile.time === 0) {
        this.doAreaDmg(projectile.team, projectile.area, projectile.dmg, projectile.targetLocation);

        projectiles.splice(index, 1);
      }
    });

    this.state.aliveUnits.forEach(unit => (unit.cooldowns.attack = Math.max(0, unit.cooldowns.attack - 1)));

    this.state.aliveUnits.forEach(unitState => {
      const enemyUnit = closestUnit(unitState, this.state.enemyTeamMembers.get(unitState.team)!);

      if (!enemyUnit) return;

      switch (unitState.action.type) {
        case UnitActionType.None:
          const attackDistance = unitState.unit.attack.distance || 30;

          if (calculateDistance(unitState.cordinate, enemyUnit.cordinate) > attackDistance) {
            this.move(unitState);
          } else {
            if (unitState.cooldowns.attack === 0) {
              unitState.action = { type: UnitActionType.Attack, time: unitState.unit.attack.animationTime };
            }
          }

          break;
        case UnitActionType.Attack:
          if (unitState.action.time === 0) {
            if (unitState.unit.attack.distance > 0) {
              this.shootProjectile(unitState, enemyUnit.cordinate);
            } else {
              this.meleeAttack(unitState, enemyUnit);
            }
          } else {
            unitState.action.time--;
          }
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

  private doAreaDmg(team: TeamID, area: number, dmg: number, location: Cordinate) {
    const enemyUnits = this.state.enemyTeamMembers.get(team)!;

    const reachableEnemies = getUnitsInDistance(location, area, enemyUnits);

    reachableEnemies.forEach(enemy => this.doDmg(enemy, dmg));
  }

  private shootProjectile(unit: UnitState, targetLocation: Cordinate) {
    const attack = unit.unit.attack;

    const distance = calculateDistance(unit.cordinate, targetLocation);

    this.state.projectiles.push({
      area: 10,
      dmg: attack.dmg,
      sprite_id: attack.projectile.sprite_id,
      team: unit.team,
      time: Math.ceil(distance / attack.projectile.speed),
      targetLocation,
      sourceLocation: unit.cordinate,
    });
  }

  private meleeAttack(unit: UnitState, enemyUnit: UnitState): void {
    this.doDmg(enemyUnit, unit.unit.attack.dmg);

    unit.cooldowns.attack = unit.unit.attack.speed;
    unit.action = { type: UnitActionType.None, time: 0 };
  }

  private doDmg(unit: UnitState, dmg: number) {
    unit.currentHp = Math.max(0, unit.currentHp - dmg);

    if (unit.currentHp === 0) {
      unit.action = { type: UnitActionType.None, time: 0 };
      this.killUnitCacheUpdate(unit);
      this.checkEndCondition();
    }
  }

  private move(unit: UnitState): void {
    const enemyUnit = closestUnit(unit, this.state.enemyTeamMembers.get(unit.team)!)!;

    const rot = calculateAngle(enemyUnit.cordinate, unit.cordinate);

    const deltaX = Math.floor(-Math.cos(rot) * unit.unit.speed * 10) / 10;
    const deltaY = Math.floor(-Math.sin(rot) * unit.unit.speed * 10) / 10;

    unit.cordinate[0] = Math.min(Math.max(0, Math.round(unit.cordinate[0] + deltaX)), this.config.dimension[0]);
    unit.cordinate[1] = Math.min(Math.max(0, Math.round(unit.cordinate[1] + deltaY)), this.config.dimension[1]);
  }

  private killUnitCacheUpdate(unit: UnitState) {
    this.state.aliveUnits = without(this.state.aliveUnits, unit);

    this.updateTeamCache();
  }

  private updateTeamCache() {
    const units = this.state.aliveUnits;
    const teams = groupBy(units, x => x.team);

    forEach(teams, (team, teamKey) => {
      const teamId = parseInt(teamKey);

      this.state.teamMembers.set(teamId, team);
      this.state.enemyTeamMembers.set(teamId, without(units, ...team));
    });
  }
}
