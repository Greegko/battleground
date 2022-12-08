import { merge } from "lodash-es";

import { AssetManager, BattlefieldInit, Config, Mod, Unit, UnitState, Vector } from "@battleground/core";

import { HHAssetManager } from "../../assets/hero-hours/asset-manager";
import { ResourceManager } from "./resource-manager";

export class CastleWarsMod implements Mod {
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
      team,
      effects: unitConfig.effects || [],
    };

    return merge({}, unitConfig, unitState, { action: { state: {} } });
  }
}
