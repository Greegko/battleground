import { Cordinate, Unit } from "../interfaces";
import { randomInt } from "../utils/random";

type BattleAction = Cordinate;

interface BattleUnit extends Unit {
  cordinate: Cordinate;
  action: BattleAction | null;
}

export interface BattleState {
  units: BattleUnit[];
}

export interface BattleConfig {
  size: number;
}

export class Battle {
  private state: BattleState;

  constructor(units: Unit[], private config: BattleConfig) {
    this.state = {
      units: units.map(unit => ({
        ...unit,
        cordinate: [randomInt(0, config.size), randomInt(0, config.size)],
        action: null,
      })),
    };
  }

  tick(): void {
    this.state.units.forEach(unit => {
      const deltaX = (Math.random() < 0.5 ? 1 : -1) * unit.speed;
      const deltaY = (Math.random() < 0.5 ? 1 : -1) * unit.speed;

      unit.cordinate[0] = Math.min(Math.max(0, unit.cordinate[0] + deltaX), this.config.size);
      unit.cordinate[1] = Math.min(Math.max(0, unit.cordinate[1] + deltaY), this.config.size);
    });
  }

  getState(): BattleState {
    return this.state;
  }
}
