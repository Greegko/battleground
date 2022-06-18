import { Cordinate } from "@game/interface";
import { ModUnit } from "@mod/interface";

import { Battle, UnitActionType } from "./battle";

export enum RendererUnitState {
  Idle,
  Move,
  Attack,
  Dead,
}

export interface RendererUnit {
  cordinate: Cordinate;
  currentHp: number;
  state: RendererUnitState;
  unit: ModUnit;
}

export interface RendererState {
  units: RendererUnit[];
}

export class Renderer {
  private state!: RendererState;

  constructor(private battle: Battle) {}

  calculateState(): void {
    const battleState = this.battle.getState();

    this.state = {
      units: battleState.units.map(x => {
        const state = (() => {
          switch (true) {
            case x.currentHp === 0:
              return RendererUnitState.Dead;
            case !battleState.isRunning:
              return RendererUnitState.Idle;
            case x.action.type === UnitActionType.Attack:
              return RendererUnitState.Attack;
            default:
              return RendererUnitState.Idle;
          }
        })();

        return {
          unit: x.unit as ModUnit,
          currentHp: x.currentHp,
          cordinate: x.cordinate,
          state,
        };
      }),
    };
  }

  getState(): RendererState {
    return this.state;
  }
}
