import Konva from "konva";
import { chunk } from "lodash-es";

import { Mod } from "@mod/interface";
import { sample } from "@utils/array/sample";

import { Battle } from "./battle";
import { Renderer } from "./renderer";

export class Game {
  private battle: Battle | undefined;
  private renderer: Renderer | undefined;

  private mod!: Mod;

  init(mod: Mod): void {
    this.mod = mod;

    const randomUnit = () => sample(this.mod.units);

    const units = Array(100)
      .fill(null)
      .map(() => randomUnit());

    const teams = chunk(units, 50);

    this.battle = new Battle(teams, { dimension: [2000, 1000] });
    this.renderer = new Renderer(this.battle, mod);
  }

  start(): void {
    const anim = new Konva.Animation(() => {
      this.battle!.tick();
      this.renderer!.tick();
    });

    anim.start();
  }

  getBattle(): Battle | undefined {
    return this.battle;
  }

  getRenderer(): Renderer | undefined {
    return this.renderer;
  }
}
