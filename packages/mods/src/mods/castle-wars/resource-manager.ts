import { find, prop } from "ramda";

import { ResourceManager as IResourceManager, UnitConfig } from "@battleground/core";

const units = require("./units.json");
const buildings = require("./buildings.json");

export class ResourceManager implements IResourceManager {
  getUnitConfig(unitId: string): UnitConfig {
    return find(prop("id", unitId), units) || find(prop("id", unitId), buildings);
  }
}
