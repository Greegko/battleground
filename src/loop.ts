import { BattlefieldRenderer } from "./battlefield-renderer/battlefield-renderer";
import { Battlefield } from "./battlefield/battlefield";
import { Config } from "./interface/config";
import { Scenario } from "./interface/scenario";
import { Player } from "./player";

export class Loop {
  constructor(private config: Config, private scenario: Scenario) {
    this.renderer = new BattlefieldRenderer(config, scenario.assetManager);
    this.battleField = new Battlefield(config, scenario.resourceManager);
    this.player = new Player();
  }

  private battleField: Battlefield;

  private renderer: BattlefieldRenderer;
  private player: Player;

  private isRunning: boolean = false;

  init() {
    this.battleField.init(this.scenario.battlefieldInit(this.config));

    this.player.hookKeyboardEvents();
    this.player.hookMoveDirectionChangeCallback(moveDirection =>
      this.battleField.controlManuallyControlledUnit(moveDirection),
    );
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
