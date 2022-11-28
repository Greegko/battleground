import { AssetManager, Config, Mod, ModInitState, Unit, UnitState } from "@battleground/core";
import { Vector } from "@battleground/core";

import { HeroHoursAssetsLoader } from "../../assets/hero_hours/hero-hours-assets-loader";
import { ResourceManager } from "./resource-manager";

export class CastleWarsMod implements Mod {
  assetManager: AssetManager = new HeroHoursAssetsLoader();
  resourceManager: ResourceManager = new ResourceManager();

  init() {
    return this.assetManager.init();
  }

  getInitState(config: Config): ModInitState {
    const base1 = { x: config.mapSize[0] / 20, y: config.mapSize[1] / 2 - 50 };
    const base2 = { x: (config.mapSize[0] / 20) * 18, y: config.mapSize[1] / 2 - 50 };

    const units = [this.generateUnit("castle", base1, 1), this.generateUnit("castle", base2, 2)];

    return { units };
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
