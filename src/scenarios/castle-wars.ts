import { BattlefieldInit } from "../battlefield/battlefield";
import { Scenario } from "../interface";
import { AssetManager, Config, Unit, UnitState } from "../interface";
import { Vector } from "../utils/vector";
import { HHAssetManager } from "./asset-manager";
import { ResourceManager } from "./resource-manager";

export class CastleWarsScenario implements Scenario {
  assetManager: AssetManager = new HHAssetManager();
  resourceManager: ResourceManager = new ResourceManager();

  init() {
    return this.assetManager.init();
  }

  battlefieldInit(config: Config): BattlefieldInit {
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
