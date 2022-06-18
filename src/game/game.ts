import { Mod } from "@mod/interface";
import { chunk } from "@utils/array/chunk";
import { sample } from "@utils/array/sample";

import { Battle } from "./battle";

export class Game {
  private battle: Battle | undefined;

  private mod!: Mod;

  setMod(mod: Mod): void {
    this.mod = mod;
  }

  start(): void {
    const randomUnit = () => sample(this.mod.units);

    const units = Array(100)
      .fill(null)
      .map(() => randomUnit());

    const teams = chunk(units, 50);
    this.battle = new Battle(teams, { size: 1000 });

    setInterval(() => this.battle!.tick(), 10);
  }

  getBattle(): Battle | undefined {
    return this.battle;
  }
}
