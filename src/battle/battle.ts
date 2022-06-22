import { flatten, forEach, groupBy, without } from "lodash-es";

import { calculateDistance } from "@utils/calculate-distance";
import { randomInt } from "@utils/random-int";
import { transformCordinate } from "@utils/transform-cordinate";

import { Cordinate, Unit } from "../interface";
import { BattleConfig, BattleState, TeamID, UnitActionType, UnitState } from "./interface";
import { closestUnit, getUnitsInDistance } from "./utils";

export class Battle {
  private state!: BattleState;

  constructor(inputTeams: Unit[][], config: BattleConfig) {
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
      tick: 0,
      isRunning: true,
      units,
      aliveUnits: units,
      enemyTeamMembers: new Map(),
      teamMembers: new Map(),
      projectiles: [],
    };

    this.updateTeamCache();
  }

  tick(): void {
    this.state.tick++;

    this.state.projectiles.forEach(projectile => {
      projectile.time--;

      if (projectile.time === 0) {
        this.doAreaDmg(projectile.team, projectile.area, projectile.dmg, projectile.targetLocation);
      }
    });

    this.state.projectiles = this.state.projectiles.filter(x => x.time !== 0);

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

    this.state.projectiles = [
      ...this.state.projectiles,
      {
        area: 10,
        dmg: attack.dmg,
        sprite_id: attack.projectile.sprite_id,
        team: unit.team,
        time: Math.ceil(distance / attack.projectile.speed),
        sourceLocation: unit.cordinate,
        targetLocation,
      },
    ];

    unit.action = { type: UnitActionType.None, time: 0 };
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

    unit.cordinate = transformCordinate(unit.cordinate, enemyUnit.cordinate, unit.unit.speed);
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
