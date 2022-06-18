import { Cordinate } from "@game/interface";
import { ModUnit } from "@mod/interface";

import { Battle } from "./battle";

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
      units: battleState.units.map(x => ({
        currentHp: x.currentHp,
        cordinate: x.cordinate,
        sprite: (x.unit as ModUnit).sprite,
        state: x.currentHp > 0 ? RendererUnitState.Move : RendererUnitState.Dead,
      })),
    };
  }

  getState(): RendererState {
    return this.state;
  }
}
