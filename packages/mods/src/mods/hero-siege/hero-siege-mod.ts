import { Battlefield } from "@battleground/core";
import { AssetManager, Config, Mod, ModInitState, Unit, UnitState } from "@battleground/core";
import { Player } from "@battleground/core";
import { Vector } from "@battleground/core";

import { HeroHoursAssetsLoader } from "../../assets/hero_hours/hero-hours-assets-loader";
import { ResourceManager } from "./resource-manager";

export class HeroSiegeMod implements Mod {
  assetManager: AssetManager = new HeroHoursAssetsLoader();
  resourceManager: ResourceManager = new ResourceManager();

  private battlefield: Battlefield;

  private player: Player = new Player();

  init() {
    this.player.init();
    this.player.hookMoveDirectionChangeCallback(direction => this.battlefield.controlManuallyControlledUnit(direction));

    return this.assetManager.init();
  }

  getInitState(config: Config): ModInitState {
    const spawnPoint1 = { x: config.mapSize[0] * 0.8, y: 0 };
    const spawnPoint2 = { x: config.mapSize[0] * 0.1, y: config.mapSize[1] * 0.8 };

    const player = this.generateUnit("skeleton", { x: config.mapSize[0] * 0.5, y: config.mapSize[1] * 0.5 }, 1);

    const units: Unit[] = [player];

    setInterval(() => {
      const location = Math.random() > 0.5 ? spawnPoint1 : spawnPoint2;
      // this.battlefield.addUnit(this.generateUnit("skeleton", location, 2));
    }, 1000);

    this.battlefield.selectUnit(player);

    return { units };
  }

  setBattlefield(battleield: Battlefield) {
    this.battlefield = battleield;
  }

  private generateUnit(unitId: string, location: Vector, team: number): Unit {
    const unitConfig = this.resourceManager.getUnitConfig(unitId);

    const unitState: UnitState = {
      location,
      hp: unitConfig.maxHp,
      actionState: {},
      team,
    };

    const unit = { ...unitConfig, ...unitState } as Unit;

    return unit;
  }
}
