import { flatten, head, sortBy, without } from "ramda";

import { calculateAngle } from "@utils/calculate-angle";
import { calculateDisntance } from "@utils/calculate-distance";
// import { calculateDisntance as calculateDistance } from "@utils/calculate-distance";
import { randomInt } from "@utils/random-int";

import { Cordinate, Unit } from "./interface";

interface UnitState {
  unit: Unit;
  team: number;
  cordinate: Cordinate;
}

export interface BattleState {
  units: UnitState[];

  teamMembers: Map<UnitState, UnitState[]>;
  enemyTeamMembers: Map<UnitState, UnitState[]>;
}

export interface BattleConfig {
  size: number;
}

const closestUnit = (unit: UnitState, units: UnitState[]): UnitState => {
  const list = sortBy(x => calculateDisntance(unit.cordinate, x.cordinate), units);

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
            cordinate: [randomInt(0, config.size), randomInt(0, config.size)] as Cordinate,
          } as UnitState;
        });
      }),
    );

    this.state = { units, ...this.createCache(units) };
  }

  tick(): void {
    return;

    this.state.units.forEach(unitState => {
      const enemyUnit = closestUnit(unitState, this.state.enemyTeamMembers.get(unitState)!);

      const rot = calculateAngle(enemyUnit.cordinate, unitState.cordinate);

      const deltaX = Math.floor(-Math.cos(rot) * unitState.unit.speed * 10) / 10;
      const deltaY = Math.floor(-Math.sin(rot) * unitState.unit.speed * 10) / 10;

      unitState.cordinate[0] = Math.min(Math.max(0, unitState.cordinate[0] + deltaX), this.config.size);
      unitState.cordinate[1] = Math.min(Math.max(0, unitState.cordinate[1] + deltaY), this.config.size);
    });
  }

  getState(): BattleState {
    return this.state;
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
