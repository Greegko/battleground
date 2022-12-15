import {
  AssetManager,
  Battlefield,
  BattlefieldRenderer,
  Config,
  Mod,
  Player,
  SpellSelection,
} from "@battleground/core";

export class Loop {
  constructor(private config: Config, private mod: Mod) {
    this.renderer = new BattlefieldRenderer(config, mod.assetManager);
    this.battleField = new Battlefield(config, mod.resourceManager);
    this.player = new Player();
    this.spellSelection = new SpellSelection(this.renderer, this.battleField);
  }

  readonly spellSelection: SpellSelection;

  battleField: Battlefield;

  private renderer: BattlefieldRenderer;
  private player: Player;

  private isRunning: boolean = false;

  get assetManager(): AssetManager {
    return this.mod.assetManager;
  }

  init() {
    this.battleField.init(this.mod.battlefieldInit(this.config));
    this.spellSelection.init();

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

  tick() {
    this.battleField.tick();

    const battleFieldState = this.battleField.getState();

    this.renderer.renderScene(battleFieldState);

    if (this.battleField.isFinished) {
      this.isRunning = false;
    }
  }

  private loop = () => {
    if (!this.isRunning) return;

    this.tick();
    if (this.config.speed === "requestFrame") {
      requestAnimationFrame(this.loop);
    } else {
      setTimeout(this.loop, 1000 / this.config.speed);
    }
  };
}
