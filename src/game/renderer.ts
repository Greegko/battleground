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
  sprite: ImageBitmap;
  currentHp: number;
  state: RendererUnitState;
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
            case x.action.type === UnitActionType.Move:
              return RendererUnitState.Move;
            case x.action.type === UnitActionType.Attack:
              return RendererUnitState.Attack;
            case x.action.type === UnitActionType.Recover:
              return RendererUnitState.Idle;
            default:
              return RendererUnitState.Idle;
          }
        })();

        return {
          currentHp: x.currentHp,
          cordinate: x.cordinate,
          sprite: (x.unit as ModUnit).sprite,
          state,
        };
      }),
    };
  }

  getState(): RendererState {
    return this.state;
  }
}
