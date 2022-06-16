import { Cordinate } from "src/interfaces";

import { Battle } from "./battle";

export interface RendererState {
  units: Cordinate[];
}

export class Renderer {
  private state!: RendererState;

  constructor(private battle: Battle) {}

  calculateState(): void {
    const battleState = this.battle.getState();

    this.state = {
      units: battleState.units.map(x => x.cordinate),
    };
  }

  getState(): RendererState {
    return this.state;
  }
}
