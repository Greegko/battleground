import { chunk } from "lodash-es";

import Konva from "konva";
import { Text } from "konva/lib/shapes/Text";

import { Battle } from "@battle/battle";
import { Mod } from "@mod/interface";
import { Renderer } from "@renderer/renderer";
import { sample } from "@utils/array/sample";

export class Battleground {
  private battle: Battle | undefined;
  private renderer: Renderer | undefined;

  private tick_text: Text | undefined;

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

  setTickText(textNode: Text) {
    this.tick_text = textNode;
  }

  start(): void {
    const anim = new Konva.Animation(() => {
      this.battle!.tick();
      this.renderer!.tick();

      const state = this.battle!.getState();
      if (this.tick_text) {
        this.tick_text.text("Tick: " + state.tick.toString());
      }

      if (!state.isRunning) {
        anim.stop();
      }
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
