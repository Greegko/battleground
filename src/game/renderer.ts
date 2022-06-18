import { Cordinate } from "@game/interface";
import { Mod } from "@mod/interface";

import { Battle } from "./battle";

export interface RendererUnit {
  cordinate: Cordinate;
  sprite: ImageBitmap;
}

export interface RendererState {
  units: RendererUnit[];
}

export class Renderer {
  private state!: RendererState;

  constructor(private battle: Battle, private mod: Mod) {}

  calculateState(): void {
    const battleState = this.battle.getState();

    this.state = {
      units: battleState.units.map(x => ({ cordinate: x.cordinate, sprite: this.mod.units[0].sprite })),
    };
  }

  getState(): RendererState {
    return this.state;
  }
}
