import { random, range } from "lodash-es";

import { BattlefieldInit } from "../battlefield/battlefield";
import { Scenario } from "../interface";
import { AssetManager, Config, Unit, UnitState } from "../interface";
import { Vector } from "../utils/vector";
import { HHAssetManager } from "./asset-manager";
import { ResourceManager } from "./resource-manager";

export class GroupFightScenario implements Scenario {
  assetManager: AssetManager = new HHAssetManager();
  resourceManager: ResourceManager = new ResourceManager();

  init() {
    return this.assetManager.init();
  }

  battlefieldInit(config: Config): BattlefieldInit {
    const unitWidth = 16 * 5;

    const groups = range(1, 8).map(() => ({
      x: random(0, config.mapSize[0] - unitWidth),
      y: random(0, config.mapSize[1] - unitWidth),
    }));

    const units = [];

    for (let index in groups) {
      const { x, y } = groups[index];

      for (let i = 0; i < 10; i++) {
        const random = Math.random();
        if (random < 0.1) {
          units.push(this.generateUnit("necromancer", { x, y }, parseInt(index) + 2));
        } else if (random < 0.2) {
          units.push(this.generateUnit("priest", { x, y }, parseInt(index) + 2));
        } else if (random < 0.5) {
          units.push(this.generateUnit("archer", { x, y }, parseInt(index) + 2));
        } else {
          units.push(this.generateUnit("skeleton", { x, y }, parseInt(index) + 2));
        }
      }
    }

    return { units };
  }

  private generateUnit(unitId: string, location: Vector, team: number): Unit {
    const unitConfig = this.resourceManager.getUnitConfig(unitId);

    const unitState: UnitState = {
      location,
      hp: 100,
      actionState: {},
      team,
    };

    const unit = { ...unitConfig, ...unitState } as Unit;

    return unit;
  }
}
