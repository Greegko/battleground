import { find } from "lodash-es";

import { ResourceManager as IResourceManager, UnitConfig } from "@battleground/core";

const units = require("./units.json");
const buildings = require("./buildings.json");

export class ResourceManager implements IResourceManager {
  getUnitConfig(unitId: string): UnitConfig {
    return find(units, { id: unitId }) || find(buildings, { id: unitId });
  }
}
