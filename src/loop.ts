import { BattlefieldRenderer } from "./battlefield-renderer/battlefield-renderer";
import { Battlefield } from "./battlefield/battlefield";
import { Config, Mod } from "./interface";

export class Loop {
  constructor(private config: Config, private mod: Mod) {
    this.renderer = new BattlefieldRenderer(config, mod.assetManager);
    this.battleField = new Battlefield(config, mod.resourceManager);
  }

  private battleField: Battlefield;

  private renderer: BattlefieldRenderer;

  private isRunning: boolean = false;

  init() {
    this.battleField.init(this.mod.getInitState(this.config));
  }

  stop() {
    this.isRunning = false;
  }

  start() {
    this.isRunning = true;
    this.loop();
  }

  private loop = () => {
    if (!this.isRunning) return;

    this.tick();
    requestAnimationFrame(this.loop);
  };

  tick() {
    this.battleField.tick();

    const battleFieldState = this.battleField.getState();

    this.renderer.renderScene(battleFieldState);

    if (this.battleField.isFinished) {
      this.isRunning = false;
    }
  }
}
