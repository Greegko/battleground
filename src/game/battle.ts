import { flatten, head, sortBy, without } from "ramda";

import { Cordinate, Unit } from "../interfaces";
import { calculateAngle } from "../utils/calculate-angle";
import { calculateDisntance } from "../utils/calculate-distance";
// import { calculateDisntance as calculateDistance } from "../utils/calculate-distance";
import { randomInt } from "../utils/random-int";

interface BattleUnit extends Unit {
  cordinate: Cordinate;
  team: number;
}

export interface BattleState {
  units: BattleUnit[];
}

export interface BattleConfig {
  size: number;
}

interface BattleCache {
  teamMembers: Map<BattleUnit, BattleUnit[]>;
  enemyTeamMembers: Map<BattleUnit, BattleUnit[]>;
}

const closestUnit = (unit: BattleUnit, units: BattleUnit[]): BattleUnit => {
  const list = sortBy(x => calculateDisntance(unit.cordinate, x.cordinate), units);

  return head(list)!;
};

export class Battle {
  private state: BattleState;
  private cache!: BattleCache;

  constructor(teams: Unit[][], private config: BattleConfig) {
    this.state = {
      units: flatten(
        teams.map((units, index) =>
          units.map(unit => ({
            ...unit,
            cordinate: [randomInt(0, config.size), randomInt(0, config.size)] as Cordinate,
            team: index,
          })),
        ),
      ),
    };

    this.refreshCache();
  }

  tick(): void {
    return;

    this.state.units.forEach(unit => {
      const enemyUnit = closestUnit(unit, this.cache.enemyTeamMembers.get(unit)!);

      const rot = calculateAngle(enemyUnit.cordinate, unit.cordinate);

      const deltaX = Math.floor(-Math.cos(rot) * unit.speed * 10) / 10;
      const deltaY = Math.floor(-Math.sin(rot) * unit.speed * 10) / 10;

      unit.cordinate[0] = Math.min(Math.max(0, unit.cordinate[0] + deltaX), this.config.size);
      unit.cordinate[1] = Math.min(Math.max(0, unit.cordinate[1] + deltaY), this.config.size);
    });
  }

  getState(): BattleState {
    return this.state;
  }

  private refreshCache(): void {
    const teamMembers = new Map();
    const enemyTeamMembers = new Map();

    this.state.units.forEach(unit => {
      teamMembers.set(
        unit,
        without(
          this.state.units.filter(x => x.team === unit.team),
          [unit],
        ),
      );
      enemyTeamMembers.set(
        unit,
        this.state.units.filter(allUnit => unit.team !== allUnit.team),
      );
    });

    this.cache = {
      teamMembers,
      enemyTeamMembers,
    };
  }
}
